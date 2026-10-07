import { command } from "../_extensions/course-moodle/infrastructure/process.ts";
import { assert } from "./support.ts";

Deno.test("process nonzero preserves tool, exit and both streams as external cause", async () => {
  try {
    await command(Deno.execPath(), [
      "eval",
      "console.log('OUT_MARKER'); console.error('ERR_MARKER'); Deno.exit(23)",
    ]);
    throw Error("expected process failure");
  } catch (error) {
    assert(error instanceof Error && error.name === "ExternalToolFailure");
    const cause = error.cause as any;
    assert(cause.tool === Deno.execPath() && cause.exitCode === 23);
    assert(cause.stdout === "OUT_MARKER\n" && cause.stderr === "ERR_MARKER\n");
    assert(
      error.message.includes("ERR_MARKER") &&
        error.message.includes("OUT_MARKER"),
    );
    assert(!error.message.includes("ADAPTER"));
  }
});
Deno.test("successful process allows stderr and preserves stdin and cwd", async () => {
  const cwd = await Deno.makeTempDir();
  try {
    const out = await command(
      Deno.execPath(),
      [
        "eval",
        "console.error('warning'); console.log(Deno.cwd()); const bytes = await new Response(Deno.stdin.readable).text(); console.log(bytes)",
      ],
      "INPUT",
      cwd,
    );
    assert(out === cwd + "\nINPUT\n");
  } finally {
    await Deno.remove(cwd);
  }
});
Deno.test("missing executable preserves original Deno error as cause", async () => {
  try {
    await command("/nonexistent/moodle-pandoc", []);
    throw Error("expected spawn failure");
  } catch (error) {
    assert(error instanceof Error && error.name === "ExternalToolFailure");
    const cause = error.cause as any;
    assert(
      cause.tool === "/nonexistent/moodle-pandoc" &&
        cause.cause instanceof Deno.errors.NotFound,
    );
  }
});
Deno.test("programmer TypeError remains unknown with its stack", async () => {
  try {
    await command(null as unknown as string, []);
    throw Error("expected TypeError");
  } catch (error) {
    assert(
      error instanceof TypeError && error.stack?.includes("process.test.ts"),
    );
  }
});
