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
Deno.test("early process exit still retains exit and streams after broken stdin", async () => {
  try {
    await command(Deno.execPath(), [
      "eval",
      "console.log('EARLY_OUT'); console.error('EARLY_ERR'); Deno.exit(31)",
    ], "x".repeat(2_000_000));
    throw Error("expected external failure");
  } catch (error) {
    assert(error instanceof Error && error.name === "ExternalToolFailure");
    const cause = error.cause as any;
    assert(
      cause.exitCode === 31 && cause.stdout === "EARLY_OUT\n" &&
        cause.stderr === "EARLY_ERR\n",
    );
    assert(
      cause.cause instanceof Deno.errors.BrokenPipe ||
        cause.cause instanceof TypeError,
    );
  }
});

import { earlyChildExit, unknownStartupFault } from "./process-runtime.ts";
Deno.test(
  "shell early exit retains real exit and streams with operational stdin cause",
  earlyChildExit,
);
Deno.test(
  "unknown startup error retains original identity and stack",
  unknownStartupFault,
);

import { concurrentDrain, visibleSuccessStderr } from "./process-runtime.ts";
Deno.test("output drains concurrently with large stdin", concurrentDrain);
Deno.test(
  "successful stderr is forwarded verbatim once and stdout returned",
  visibleSuccessStderr,
);

import { installedCliCause, visibleStartupCause } from "./process-runtime.ts";
Deno.test(
  "expected startup OS reason remains visible exactly once",
  visibleStartupCause,
);
Deno.test(
  "installed CLI preserves native startup cause once without stack",
  installedCliCause,
);
