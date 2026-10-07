/** The process boundary owns external failures; semantic guards stay in transport. */
function externalFailure(
  tool: string,
  exitCode: number | undefined,
  stdout: string,
  stderr: string,
  cause?: unknown,
): Error {
  const detail = stderr + stdout;
  const error = new Error(
    `Moodle: внешний инструмент ${tool} завершился с ошибкой${
      exitCode === undefined
        ? " запуска или ввода/вывода"
        : ` (код ${exitCode})`
    }.${detail ? "\n" + detail : ""}`,
    {
      cause: {
        tool,
        exitCode,
        stdout,
        stderr,
        ...(cause === undefined ? {} : { cause }),
      },
    },
  );
  error.name = "ExternalToolFailure";
  return error;
}
export async function command(
  cmd: string,
  args: string[],
  input?: string,
  cwd?: string,
): Promise<string> {
  let out: Deno.CommandOutput;
  try {
    const p = new Deno.Command(cmd, {
      args,
      cwd,
      stdin: input === undefined ? "null" : "piped",
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    if (input !== undefined) {
      const w = p.stdin.getWriter();
      await w.write(new TextEncoder().encode(input));
      await w.close();
    }
    out = await p.output();
  } catch (cause) {
    // TypeError and other programming faults must retain their original stack.
    if (!Object.values(Deno.errors).some((kind) => cause instanceof kind)) {
      throw cause;
    }
    throw externalFailure(cmd, undefined, "", "", cause);
  }
  const stdout = new TextDecoder().decode(out.stdout);
  const stderr = new TextDecoder().decode(out.stderr);
  if (!out.success) throw externalFailure(cmd, out.code, stdout, stderr);
  return stdout;
}
