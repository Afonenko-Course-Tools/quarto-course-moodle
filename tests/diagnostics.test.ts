import { exportMoodle } from "../_extensions/course-moodle/application/export.ts";
import { assert } from "./support.ts";
import { sample } from "./native-sample.ts";

async function refused(p: any, binding: any, ...context: string[]) {
  try {
    await exportMoodle(p, binding);
    throw Error("expected author diagnostic");
  } catch (error) {
    assert(error instanceof Error && error.name === "ExtensionDiagnostic");
    assert((error as any).code === "ADAPTER");
    for (const part of ["ADAPTER", "Moodle", "Подсказка:", ...context]) {
      assert(error.message.includes(part), error.message);
    }
  }
}
Deno.test("binding guards identify the field and a Russian correction", async () => {
  await refused(
    sample(),
    { defaultGrade: 0, shuffle: false },
    "defaultGrade",
    "число",
  );
  await refused(
    sample(),
    { defaultGrade: 1, shuffle: "false" },
    "shuffle",
    "boolean",
  );
});
Deno.test("unsupported type and choice mapping preserve question provenance", async () => {
  const p: any = sample();
  p.questions[0].answerType = "numeric";
  await refused(
    p,
    { defaultGrade: 1, shuffle: false },
    "index.qmd",
    "exr-manual",
    "answerType",
  );
  p.questions[0].answerType = "single-choice";
  p.questions[0].closedKey = { correct: 2 };
  p.questions[0].publicAnswer = [{
    t: "BulletList",
    c: [[{ t: "Para", c: [{ t: "Str", c: "A" }] }], [{
      t: "Para",
      c: [{ t: "Str", c: "B" }],
    }]],
  }];
  await refused(
    p,
    { defaultGrade: 1, shuffle: false },
    "index.qmd",
    "exr-manual",
    "closedKey.correct",
  );
});
Deno.test("native body guard identifies condition and question", async () => {
  const p = sample();
  p.questions[0].condition.push({ t: "RawBlock", c: ["html", "bad"] } as any);
  await refused(
    p,
    { defaultGrade: 1, shuffle: false },
    "index.qmd",
    "exr-manual",
    "condition",
  );
});
Deno.test("hash mismatch identifies resource source and hash field", async () => {
  const p: any = sample();
  p.resources = [{
    owner: p.owner,
    source: "data.txt",
    effectiveBase: ".",
    target: "resources/data.txt",
    sha256: "0".repeat(64),
    data: btoa("data"),
    visibility: "public",
  }];
  p.resources[0].effectiveBase = "resources";
  await refused(p, { defaultGrade: 1, shuffle: false }, "data.txt", "sha256");
});
