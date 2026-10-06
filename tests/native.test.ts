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

Deno.test("Moodle malformed native choice lists refuse with ADAPTER before XML", async () => {
  for (
    const content of [null, {}, [null], [], [[null]], [[{
      t: "Para",
      c: [{ t: "Str", c: "A" }],
    }], null]]
  ) {
    const p: any = sample();
    Object.assign(p.questions[0], {
      answerType: "single-choice",
      closedKey: { correct: 0 },
      publicAnswer: [{ t: "BulletList", c: content }],
    });
    let refused = false;
    try {
      await exportMoodle(p, { defaultGrade: 1, shuffle: false });
    } catch (e) {
      refused = String(e).includes("ADAPTER");
    }
    assert(
      refused,
      "malformed native choice was not an explicit ADAPTER refusal",
    );
  }
});

Deno.test("Moodle accepts task requirements and ungraded handout without creating activities", async () => {
  const p: any = sample();
  p.works[0].kind = "handout";
  p.works[0].requirements = { "exr-manual": "optional" };
  const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
  assert(
    xml.includes('type="essay"') && !xml.includes("assessment"),
    "work metadata became an LMS activity",
  );
});
Deno.test("Moodle rejects task requirements outside selected membership", async () => {
  const p: any = sample();
  p.works[0].requirements = { "exr-absent": "optional" };
  let refused = false;
  try {
    await exportMoodle(p, { defaultGrade: 1, shuffle: false });
  } catch (e) {
    refused = String(e).includes("ADAPTER");
  }
  assert(refused, "foreign member requirement accepted");
});
Deno.test("Moodle accepts explicit work ID independent from section prefix", async () => {
  const p: any = sample();
  p.works[0].id = "lab-one";
  p.works[0].key = "course-a/lab-one";
  const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
  assert(xml.includes("course-a/exr-manual"), "canonical question missing");
});
