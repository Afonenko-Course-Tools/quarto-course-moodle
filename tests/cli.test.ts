import { sample } from "./native-sample.ts";
import { assert, equalBytes } from "./support.ts";
const entry =
  new URL("../_extensions/course-moodle/entrypoints/export.ts", import.meta.url)
    .pathname;
async function cli(
  cwd: string,
  args: string[],
  env: Record<string, string> = {},
) {
  const out = await new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--no-config",
      "--no-lock",
      "--no-npm",
      "--cached-only",
      "--deny-net",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "--allow-env",
      entry,
      ...args,
    ],
    cwd,
    env,
    stdout: "piped",
    stderr: "piped",
  }).output();
  return { ...out, err: new TextDecoder().decode(out.stderr) };
}
Deno.test("CLI prints named input diagnostic once without stack", async () => {
  const out = await cli(Deno.cwd(), []);
  assert(
    !out.success && (out.err.match(/MOODLE.INPUT_INVALID/g) || []).length === 1,
    out.err,
  );
  assert(
    !out.err.includes("at file:") && out.err.includes("Подсказка:"),
    out.err,
  );
});
Deno.test("CLI expected validation is contextual, once, and writes no new XML", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(dir + "/package.json", JSON.stringify(sample()));
    await Deno.writeTextFile(dir + "/binding.json", "{}");
    const out = await cli(dir, ["package.json", "binding.json", "new.xml"]);
    assert(
      !out.success && (out.err.match(/ADAPTER/g) || []).length === 1,
      out.err,
    );
    assert(
      out.err.includes("binding.json") && !out.err.includes("at file:"),
      out.err,
    );
    assert(
      !Array.from(Deno.readDirSync(dir)).some((x) => x.name === "new.xml"),
    );
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
Deno.test("CLI unknown SyntaxError retains original stack", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(dir + "/package.json", "{");
    await Deno.writeTextFile(dir + "/binding.json", "{}");
    const out = await cli(dir, ["package.json", "binding.json", "new.xml"]);
    assert(
      !out.success && out.err.includes("SyntaxError") &&
        out.err.includes("entrypoints/export.ts"),
      out.err,
    );
    assert(!out.err.includes("MOODLE.INPUT_INVALID"));
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
Deno.test("fake Pandoc nonzero remains foreign and preserves old XML and both streams", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(
      dir + "/quarto",
      "#!/bin/sh\nprintf 'PANDOC_OUT_MARKER\\n'\nprintf 'PANDOC_ERR_MARKER\\n' >&2\nexit 67\n",
    );
    await Deno.chmod(dir + "/quarto", 0o755);
    await Deno.writeTextFile(dir + "/package.json", JSON.stringify(sample()));
    await Deno.writeTextFile(
      dir + "/binding.json",
      '{"defaultGrade":1,"shuffle":false}',
    );
    await Deno.writeTextFile(dir + "/old.xml", "OLD XML");
    const original = await Deno.readFile(dir + "/old.xml");
    for (const output of ["new.xml", "old.xml"]) {
      const out = await cli(dir, ["package.json", "binding.json", output], {
        PATH: dir,
      });
      assert(!out.success && out.err.includes("67"), out.err);
      for (const marker of ["PANDOC_OUT_MARKER", "PANDOC_ERR_MARKER"]) {
        assert(
          (out.err.match(new RegExp(marker, "g")) || []).length === 1,
          out.err,
        );
      }
      assert(
        !out.err.includes("ADAPTER") && !out.err.includes("at file:"),
        out.err,
      );
    }
    assert(
      !Array.from(Deno.readDirSync(dir)).some((x) => x.name === "new.xml"),
    );
    assert(equalBytes(await Deno.readFile(dir + "/old.xml"), original));
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
