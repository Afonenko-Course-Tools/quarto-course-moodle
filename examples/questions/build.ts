import { join } from "node:path";
import { pathToFileURL } from "node:url";
const root = Deno.cwd();
async function extension(base: string, name: string) {
  for (const owner of ["", "Afonenko-Course-Tools/"]) {
    const path = join(base, "_extensions", owner + name);
    try {
      if ((await Deno.stat(path)).isDirectory) return path;
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) throw e;
    }
  }
  throw Error("Установите " + name + " в " + base);
}
const core = await extension(join(root, "bank"), "course-core");
const { collectExport } = await import(
  pathToFileURL(join(core, "body-export/collect.ts")).href
);
const { buildBodies } = await import(
  pathToFileURL(join(core, "body-export/producer.ts")).href
);
await Deno.mkdir(join(root, "artifacts"), { recursive: true });
const adapter = await extension(root, "course-moodle");
const { exportMoodle } = await import(
  pathToFileURL(join(adapter, "application/export.ts")).href
);
for (const variant of ["a", "b"]) {
  const selected = await collectExport(root, {
    book: "bank",
    work: "sec-variant-" + variant,
  });
  const bodies = await buildBodies(selected.result, {
    projectRoot: selected.projectRoot,
    courseId: selected.courseId,
    work: selected.work,
    includeClosed: true,
  });
  const xml = await exportMoodle(
    bodies.package,
    JSON.parse(await Deno.readTextFile("binding.json")),
  );
  await Deno.writeTextFile(
    join(root, "artifacts/variant-" + variant + ".xml"),
    xml,
  );
}
const html = await new Deno.Command("quarto", {
  args: ["render", "--fail-if-warnings"],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!html.success) Deno.exit(html.code);

const revision = await new Deno.Command("git", {
  args: ["rev-parse", "HEAD"],
  stdout: "piped",
  stderr: "null",
}).output();
await Deno.writeTextFile(
  "_site/BUILD.json",
  JSON.stringify(
    {
      sourceRepository: "Afonenko-Course-Tools/quarto-course-moodle",
      commit: Deno.env.get("DEMO_SOURCE_COMMIT") ||
        (revision.success
          ? new TextDecoder().decode(revision.stdout).trim()
          : ""),
      sourceDirty: Deno.env.get("DEMO_SOURCE_DIRTY") === "true",
      extensionVersion: "0.3.0",
      dependencies: { "quarto-course": "4.0.0" },
      projection: "full",
      verification: "local installed native build",
      livePlatformVerified: false,
    },
    null,
    2,
  ) + "\n",
);
