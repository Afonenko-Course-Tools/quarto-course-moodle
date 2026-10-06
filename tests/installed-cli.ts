/** Actual Quarto-installed package, executed with only consumer reads and no network. */
import {
  assert,
  assertInstalled,
  assertNoNodeModules,
  equalBytes,
  run,
  sha256,
} from "./support.ts";
import { children, decodeBase64, quiz, text } from "./xml.ts";

async function check(repo: string, packagePath: string) {
  const payload = JSON.parse(await Deno.readTextFile(packagePath));
  assert(payload.schema === "course-body-package-v1");
  assert(
    JSON.stringify(payload.questions.map((q: any) => q.key)) ===
      JSON.stringify([
        "course-a/exr-manual",
        "course-a/exr-choice",
      ]),
  );
  assert(
    JSON.stringify(
      Object.fromEntries(payload.works.map((w: any) => [w.key, w.items])),
    ) === JSON.stringify({
      "course-a/sec-work-one": ["course-a/exr-manual", "course-a/exr-choice"],
    }),
    "fixture contains only the explicitly selected work",
  );
  const consumer = await Deno.realPath(
    await Deno.makeTempDir({ prefix: "moodle-consumer-" }),
  );
  try {
    await run(["quarto", "add", repo, "--no-prompt"], { cwd: consumer });
    const installed = `${consumer}/_extensions/course-moodle`;
    await assertInstalled(repo, installed);
    await assertNoNodeModules(consumer);
    await Deno.copyFile(packagePath, `${consumer}/package.json`);
    await Deno.writeTextFile(
      `${consumer}/binding.json`,
      '{"defaultGrade":1,"shuffle":false}\n',
    );
    const env = {
      ...Deno.env.toObject(),
      DENO_DIR: `${consumer}/.deno`,
      DENO_NO_UPDATE_CHECK: "1",
    };
    const command = [
      "deno",
      "run",
      "--no-config",
      "--no-lock",
      "--no-npm",
      "--cached-only",
      "--deny-net",
      `--allow-read=${consumer}`,
      `--deny-read=${repo}`,
      `--allow-write=${consumer}`,
      "--allow-run=quarto",
      "--allow-env",
      `${installed}/entrypoints/export.ts`,
      "package.json",
      "binding.json",
    ];
    await run([...command, "bank.xml"], { cwd: consumer, env });
    const xml = await Deno.readTextFile(`${consumer}/bank.xml`);
    const questions = children(quiz(xml), "question");
    assert(questions.length === 2, "XML question count changed");
    assert(
      JSON.stringify(questions.map((q) => q.getAttribute("type"))) ===
        '["essay","multichoice"]',
    );
    assert(
      JSON.stringify(questions.map((q) => text(q, "idnumber"))) ===
        JSON.stringify(payload.questions.map((q: any) => q.key)),
    );
    const answers = children(questions[1], "answer");
    assert(
      JSON.stringify(answers.map((a) => a.getAttribute("fraction"))) ===
        '["0","100","0"]',
    );
    assert(text(answers[1], "text").includes("TLS"));
    assert(xml.includes("{{literal}}") && xml.includes("@@PLUGINFILE@@"));
    assert(!xml.includes("TEACHER_SECRET") && !xml.includes("GRADING_SECRET"));
    const attachments = new Map(
      children(children(questions[0], "questiontext")[0], "file").map((
        file,
      ) => [
        file.getAttribute("path").replace(/^\/+/, "") +
        file.getAttribute("name"),
        decodeBase64(file.textContent),
      ]),
    );
    assert(
      attachments.size === payload.resources.length,
      "XML attachment count changed",
    );
    for (const resource of payload.resources) {
      const bytes = attachments.get(resource.target);
      assert(
        bytes && equalBytes(bytes, decodeBase64(resource.data)),
        `attachment bytes differ: ${resource.target}`,
      );
      assert(
        await sha256(bytes) === resource.sha256,
        `Body resource integrity: ${resource.target}`,
      );
    }
    const original = await Deno.readFile(`${consumer}/bank.xml`);
    // Exercise failure with a new destination and an existing artifact.
    for (
      const binding of [
        "{}",
        '{"defaultGrade":"1","shuffle":false}',
        '{"defaultGrade":1e400,"shuffle":false}',
        '{"defaultGrade":0,"shuffle":false}',
        '{"defaultGrade":-1,"shuffle":false}',
      ]
    ) {
      await Deno.writeTextFile(`${consumer}/binding.json`, binding + "\n");
      for (const output of ["rejected.xml", "bank.xml"]) {
        const rejected = await new Deno.Command(command[0], {
          args: [...command.slice(1), output],
          cwd: consumer,
          env,
          stdout: "piped",
          stderr: "piped",
        }).output();
        assert(
          !rejected.success &&
            new TextDecoder().decode(rejected.stderr).includes("ADAPTER"),
          `invalid binding accepted: ${binding}`,
        );
      }
      assert(
        !await exists(`${consumer}/rejected.xml`),
        "failed CLI wrote output",
      );
      assert(
        equalBytes(await Deno.readFile(`${consumer}/bank.xml`), original),
        "failure replaced old XML",
      );
    }
    // Corrupt transport resources must also fail before replacing the current export.
    await Deno.writeTextFile(
      `${consumer}/binding.json`,
      '{"defaultGrade":1,"shuffle":false}\n',
    );
    await Deno.writeTextFile(
      `${consumer}/package.json`,
      JSON.stringify({
        ...payload,
        resources: payload.resources.map((r: any) => ({
          ...r,
          sha256: "0".repeat(64),
        })),
      }),
    );
    const damaged = await new Deno.Command(command[0], {
      args: [...command.slice(1), "bank.xml"],
      cwd: consumer,
      env,
      stdout: "piped",
      stderr: "piped",
    }).output();
    assert(
      !damaged.success &&
        new TextDecoder().decode(damaged.stderr).includes("hash mismatch"),
      "damaged resource accepted",
    );
    assert(
      equalBytes(await Deno.readFile(`${consumer}/bank.xml`), original),
      "damaged resource replaced old XML",
    );
    await assertNoNodeModules(consumer);
    console.log(
      "PASS: installed version/entrypoint, canonical XML, Body attachments and fail-before-output with old artifact preserved",
    );
  } finally {
    await Deno.remove(consumer, { recursive: true });
  }
}
async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}
if (import.meta.main) {
  assert(
    Deno.args.length === 2,
    "usage: installed-cli.ts repository generated-package.json",
  );
  await check(
    await Deno.realPath(Deno.args[0]),
    await Deno.realPath(Deno.args[1]),
  );
}
