import { build } from "esbuild";
import { readdir, readFile, writeFile } from "node:fs/promises";
await build({
  stdin: {
    contents: "export {create} from 'xmlbuilder2';",
    resolveDir: process.cwd(),
  },
  banner: {
    js:
      "import {createRequire} from 'node:module';const require=createRequire(import.meta.url);",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: "_extensions/course-moodle/vendor/xmlbuilder2.js",
  minify: true,
});
const pkgs = [
  "xmlbuilder2",
  "@oozcitak/dom",
  "@oozcitak/infra",
  "@oozcitak/util",
  "@oozcitak/url",
  "js-yaml",
  "argparse",
  "esprima",
  "sprintf-js",
];
for (const pkg of pkgs) {
  const fs = await readdir("node_modules/" + pkg);
  const name = fs.find((x) => /^license/i.test(x));
  if (!name) throw new Error("Missing upstream license: " + pkg);
  {
    await writeFile(
      "_extensions/course-moodle/vendor/" +
        pkg.replaceAll("/", "-").replaceAll("@", "") + "-LICENSE",
      await readFile("node_modules/" + pkg + "/" + name),
    );
  }
}
