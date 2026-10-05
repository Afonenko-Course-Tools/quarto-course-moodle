import { assert, sample } from "./native-sample.ts";
import { exportMoodle } from "../_extensions/course-moodle/application/export.ts";
Deno.test("Moodle accepts current native Body and ignores solutions and notes", async () => {
  const p: any = sample();
  Object.assign(p.questions[0], {
    closedKey: null,
    solution: [{ t: "Para", c: [{ t: "Str", c: "TEACHER_SECRET" }] }],
    gradingNotes: [{ t: "Para", c: [{ t: "Str", c: "GRADING_SECRET" }] }],
  });
  const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
  assert(
    xml.includes("Public native condition") &&
      !/TEACHER_SECRET|GRADING_SECRET/.test(xml),
    "private teacher body in XML",
  );
});
Deno.test("Moodle malformed single choice rejects clear adapter error", async () => {
  for (const correct of [-1, 1.5, 2, "0", null]) {
    const p: any = sample();
    Object.assign(p.questions[0], {
      answerType: "single-choice",
      closedKey: { correct },
      publicAnswer: [{
        t: "BulletList",
        c: [[{ t: "Para", c: [{ t: "Str", c: "A" }] }], [{
          t: "Para",
          c: [{ t: "Str", c: "B" }],
        }]],
      }],
    });
    let failed = false;
    try {
      await exportMoodle(p, { defaultGrade: 1, shuffle: false });
    } catch (e) {
      failed = String(e).includes("ADAPTER");
    }
    assert(failed, "malformed key accepted");
  }
});
