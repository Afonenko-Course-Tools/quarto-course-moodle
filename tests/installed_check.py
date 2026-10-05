"""Check the actual Quarto-installed package; only Python standard library."""
import base64
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET


def file_bytes(root):
    files = {}
    for path in root.rglob("*"):
        assert not path.is_symlink(), f"symlink in installed delivery: {path}"
        if path.is_file():
            files[path.relative_to(root)] = path.read_bytes()
    return files


def verify_installed(source, installed):
    # Do not resolve this path: that would hide a link back to the checkout.
    installed = installed.absolute()
    for path in (installed, *installed.parents):
        assert not path.is_symlink(), f"symlink in installed delivery path: {path}"
    expected, actual = file_bytes(source), file_bytes(installed)
    assert expected and expected.keys() == actual.keys(), "installed file set differs"
    for name, content in expected.items():
        assert content == actual[name], f"installed bytes differ: {name}"


def check(repo, package):
    payload = json.loads(package.read_text())
    assert payload["schema"] == "course-body-package-v1"
    assert [q["key"] for q in payload["questions"]] == [
        "course-a/exr-manual", "course-a/exr-choice"
    ]
    assert {w["key"]: w["items"] for w in payload["works"]} == {
        "course-a/sec-work-one": ["course-a/exr-manual", "course-a/exr-choice"],
        "course-a/sec-work-two": ["course-a/exr-manual"],
    }, "fixture package must contain both works sharing the canonical question"
    with tempfile.TemporaryDirectory(prefix="moodle-consumer-") as directory:
        # Canonicalize the fresh base before installation (e.g. macOS /tmp),
        # then retain lexical extension paths so later aliases remain visible.
        consumer = Path(directory).resolve()
        subprocess.run(["quarto", "add", str(repo), "--no-prompt"], cwd=consumer, check=True)
        installed = consumer / "_extensions/course-moodle"
        verify_installed(repo / "_extensions/course-moodle", installed)
        assert not list(consumer.rglob("node_modules")), "consumer has node_modules"
        shutil.copyfile(package, consumer / "package.json")
        (consumer / "binding.json").write_text('{"defaultGrade":1,"shuffle":false}\n')
        env = dict(os.environ, DENO_DIR=str(consumer / ".deno"), DENO_NO_UPDATE_CHECK="1")
        command = [
            "deno", "run", "--no-config", "--no-lock", "--no-npm", "--cached-only",
            "--deny-net", f"--allow-read={consumer}", f"--deny-read={repo}",
            f"--allow-write={consumer}", "--allow-run=quarto", "--allow-env",
            str(installed / "entrypoints/export.ts"), "package.json", "binding.json",
        ]
        subprocess.run(command + ["bank.xml"], cwd=consumer, env=env, check=True)
        xml = (consumer / "bank.xml").read_text()
        root = ET.fromstring(xml)
        questions = root.findall("question")
        assert root.tag == "quiz" and len(questions) == 2
        assert [q.get("type") for q in questions] == ["essay", "multichoice"]
        assert [q.findtext("idnumber") for q in questions] == [q["key"] for q in payload["questions"]]
        answers = questions[1].findall("answer")
        assert [a.get("fraction") for a in answers] == ["0", "100", "0"]
        assert "TLS" in answers[1].findtext("text")
        assert "{{literal}}" in xml and "@@PLUGINFILE@@" in xml
        assert "TEACHER_SECRET" not in xml and "GRADING_SECRET" not in xml
        attachments = {
            file.get("path").lstrip("/") + file.get("name"): base64.b64decode(file.text, validate=True)
            for file in questions[0].findall("questiontext/file")
        }
        assert attachments == {r["target"]: base64.b64decode(r["data"], validate=True) for r in payload["resources"]}
        # Exercise the installed CLI's failure path, not just its imported function.
        for binding in (
            "{}",
            '{"defaultGrade":"1","shuffle":false}',
            '{"defaultGrade":1e400,"shuffle":false}',
            '{"defaultGrade":0,"shuffle":false}',
            '{"defaultGrade":-1,"shuffle":false}',
        ):
            (consumer / "binding.json").write_text(binding + "\n")
            rejected = subprocess.run(command + ["rejected.xml"], cwd=consumer, env=env, capture_output=True, text=True)
            assert rejected.returncode != 0 and "ADAPTER" in rejected.stderr, (binding, rejected.stderr)
            assert not (consumer / "rejected.xml").exists(), "failed CLI wrote output"
        assert not list(consumer.rglob("node_modules")), "runtime created node_modules"
    print("PASS: installed bytes, entrypoint, canonical XML, attachments and fail-before-output")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: installed_check.py repository generated-package.json")
    check(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve())
