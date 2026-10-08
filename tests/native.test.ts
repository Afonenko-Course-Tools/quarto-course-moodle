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

Deno.test("Moodle accepts explicit work ID independent from section prefix", async () => {
  const p: any = sample();
  p.works[0].id = "lab-one";
  p.works[0].key = "course-a/lab-one";
  const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
  assert(xml.includes("course-a/exr-manual"), "canonical question missing");
});

import { validatePackage } from "../_extensions/course-moodle/infrastructure/transport.ts";
import { children, quiz, text } from "./xml.ts";
Deno.test("teacher validation preserves key and closed partitions after public validation", () => {
  const p: any = sample();
  Object.assign(p.questions[0], {
    closedKey: { correct: 1 },
    solution: [],
    gradingNotes: [],
  });
  assert(validatePackage(p) === p, "teacher capability was discarded");
});
Deno.test("restricted participant-safe statements export for every current work kind", async () => {
  for (const kind of ["lab", "seminar", "practical", "test"]) {
    const p: any = sample();
    p.works[0].kind = kind;
    p.works[0].theoryTime = 7.5;
    p.works[0].assignments["course-a/exr-manual"] = {
      stage: "homework",
      requirement: "optional",
      workMode: "pair",
    };
    const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
    assert(
      children(quiz(xml), "question").length === 1 &&
        !xml.includes("assessment"),
      "work became an activity",
    );
  }
});
Deno.test("open ordinary statement exports for lab and seminar", async () => {
  for (const kind of ["lab", "seminar"]) {
    const p: any = sample();
    p.works[0].kind = kind;
    p.questions[0].statementVisibility = "open";
    p.questions[0].purpose = undefined;
    assert(
      (await exportMoodle(p, { defaultGrade: 1, shuffle: false })).includes(
        'type="essay"',
      ),
      "open work failed",
    );
  }
});
Deno.test("new work and policy guards refuse malformed independent Body", () => {
  const cases: ((p: any) => void)[] = [
    (p) => delete p.questions[0].statementVisibility,
    (p) => p.questions[0].statementVisibility = "public",
    (p) => delete p.questions[0].hasPublicSolution,
    (p) => p.questions[0].hasPublicSolution = "false",
    (p) => p.questions[0].purpose = "objectives",
    (p) => p.questions[0].purpose = null,
    (p) => p.questions[0].purpose = ["control"],
    (p) => p.questions[0].statementVisibility = ["restricted"],
    (p) =>
      p.works[0].assignments["course-a/exr-manual"].requirement = ["required"],
    (p) => p.works[0].assignments["course-a/exr-manual"].workMode = ["pair"],
    (p) => p.questions[0].solution = "closed text",
    (p) => p.questions[0].gradingNotes = {},
    (p) => p.questions[0].closedKey = [],
    (p) => p.works[0].theoryTime = 0,
    (p) => p.works[0].theoryTime = Infinity,
    (p) => p.works[0].theoryTime = "10",
    (p) => delete p.works[0].assignments,
    (p) => p.works[0].assignments = {},
    (p) =>
      p.works[0].assignments["course-a/exr-extra"] = {
        requirement: "required",
        workMode: "individual",
      },
    (p) =>
      p.works[0].assignments = {
        "exr-manual": { requirement: "required", workMode: "individual" },
      },
    (p) => p.works[0].assignments["course-a/exr-manual"].stage = "lecture",
    (p) =>
      p.works[0].assignments["course-a/exr-manual"].requirement = "recommended",
    (p) => delete p.works[0].assignments["course-a/exr-manual"].workMode,
    (p) => p.works[0].assignments["course-a/exr-manual"].workMode = "classroom",
    (p) => p.works[0].assignments["course-a/exr-manual"].unknown = true,
    (p) => p.works[0].requirements = { "exr-manual": "required" },
    (p) => p.works[0].kind = "exam",
    (p) => p.works[0].kind = "handout",
    (p) => {
      p.works[0].kind = "test";
      p.questions[0].statementVisibility = "open";
    },
    (p) => {
      p.works[0].kind = "practical";
      p.questions[0].statementVisibility = "open";
    },
  ];
  for (const [i, mutate] of cases.entries()) {
    const p: any = sample();
    mutate(p);
    let refused = false;
    try {
      validatePackage(p);
    } catch (error) {
      refused = String(error).includes("ADAPTER");
    }
    assert(refused, `malformed Body case ${i} accepted`);
  }
});
Deno.test("demonstration stage requires open declaration purpose and public solution witness", () => {
  const base: any = sample();
  Object.assign(base.questions[0], {
    statementVisibility: "open",
    purpose: "demonstration",
    hasPublicSolution: true,
  });
  base.works[0].assignments["course-a/exr-manual"].stage = "demonstration";
  validatePackage(base);
  for (
    const delta of [
      { statementVisibility: "restricted" },
      { purpose: "discussion" },
      { purpose: undefined },
      { hasPublicSolution: false },
    ]
  ) {
    const p = structuredClone(base);
    Object.assign(p.questions[0], delta);
    let refused = false;
    try {
      validatePackage(p);
    } catch (error) {
      refused = String(error).includes("ADAPTER");
    }
    assert(refused, "invalid demonstration accepted");
  }
});
Deno.test("single choice retains exactly one teacher keyed correct answer in well formed XML", async () => {
  const p: any = sample();
  Object.assign(p.questions[0], {
    answerType: "single-choice",
    closedKey: { correct: 1 },
    publicAnswer: [{
      t: "BulletList",
      c: [[{ t: "Para", c: [{ t: "Str", c: "HTTP" }] }], [{
        t: "Para",
        c: [{ t: "Str", c: "TLS" }],
      }]],
    }],
  });
  const answers = children(
    children(
      quiz(await exportMoodle(p, { defaultGrade: 1, shuffle: false })),
      "question",
    )[0],
    "answer",
  );
  assert(
    answers.filter((a) => a.getAttribute("fraction") === "100").length === 1 &&
      text(answers[1], "text").includes("TLS"),
    "teacher answer mapping lost",
  );
});
Deno.test("restricted statement does not permit private visibility or closed condition markers", () => {
  for (
    const mutate of [
      (p: any) => p.questions[0].visibility = "private",
      (p: any) =>
        p.questions[0].condition.push({
          t: "Div",
          c: [["", ["solution"], []], []],
        }),
      (p: any) =>
        p.questions[0].condition.push({
          t: "Div",
          c: [["", ["correct"], []], []],
        }),
    ]
  ) {
    const p: any = sample();
    mutate(p);
    let refused = false;
    try {
      validatePackage(p);
    } catch (error) {
      refused = String(error).includes("ADAPTER");
    }
    assert(refused, "closed payload accepted");
  }
});

for (const field of ["stage", "theoryTime"] as const) {
  Deno.test(`Moodle direct API exports optional ${field}: undefined`, async () => {
    const p: any = sample();
    if (field === "stage") {
      p.works[0].assignments["course-a/exr-manual"].stage = undefined;
    } else {
      p.works[0].theoryTime = undefined;
    }
    assert(validatePackage(p) === p, "teacher package identity changed");
    const xml = await exportMoodle(p, { defaultGrade: 1, shuffle: false });
    assert(
      xml.includes("Public native condition"),
      "optional field stopped real question export",
    );
  });
}
Deno.test("optional assignment stage and theory time keep strict non-undefined values", () => {
  for (
    const [field, values] of [
      ["stage", [null, [], ["classroom"], "lecture", 0]],
      ["theoryTime", [null, [], [10], 0, -1, Infinity, NaN, "10"]],
    ] as const
  ) {
    for (const value of values) {
      const p: any = sample();
      if (field === "stage") {
        p.works[0].assignments["course-a/exr-manual"].stage = value;
      } else p.works[0].theoryTime = value;
      let refused = false;
      try {
        validatePackage(p);
      } catch (error) {
        refused = String(error).includes("ADAPTER");
      }
      assert(refused, `malformed optional ${field} accepted`);
    }
  }
});
