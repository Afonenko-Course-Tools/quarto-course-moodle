import { exportMoodle } from "../application/export.ts";
import { diagnostic } from "../infrastructure/diagnostics.ts";
const [source, binding, output] = Deno.args;
try {
  if (!source || !binding || !output) {
    throw diagnostic(
      "MOODLE.INPUT_INVALID",
      "Не указаны входной пакет, binding или выходной XML",
      {
        field: "arguments",
        hint: "Запустите export.ts package.json binding.json bank.xml.",
      },
    );
  }
  const xml = await exportMoodle(
    JSON.parse(await Deno.readTextFile(source)),
    JSON.parse(await Deno.readTextFile(binding)),
  );
  await Deno.writeTextFile(output, xml);
} catch (error) {
  if (
    error instanceof Error &&
    ["ExtensionDiagnostic", "ExternalToolFailure"].includes(error.name)
  ) {
    console.error(error.message);
    if (source && binding && error.name === "ExtensionDiagnostic") {
      console.error(`Входной пакет: ${source}; binding: ${binding}`);
    }
    Deno.exit(1);
  }
  throw error;
}
