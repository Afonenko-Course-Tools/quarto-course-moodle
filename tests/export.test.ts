import { exportMoodle } from "../_extensions/course-moodle/application/export.ts";
const assert = (x: unknown, m = "assertion failed") => {
  if (!x) throw Error(m);
};
const sample = () => {
  const path = Deno.env.get("P0_PACKAGE");
  if (!path) {
    throw Error(
      "P0_PACKAGE required: run CORE=/path/to/core bash tools/check.sh",
    );
  }
  return JSON.parse(Deno.readTextFileSync(path));
};
const binding = { defaultGrade: 1, shuffle: false };
Deno.test("native manual and single-choice package creates exactly two genuine XML questions", async () => {
  const xml = await exportMoodle(sample(), binding);
  assert(xml.startsWith("<?xml"));
  assert(xml.includes('type="essay"') && xml.includes('type="multichoice"'));
  assert((xml.match(/<question type=/g) || []).length === 2);
  assert(xml.includes('fraction="100"'));
  assert(xml.includes("@@PLUGINFILE@@"));
  assert(xml.includes("{{literal}}"));
  assert(!xml.includes("TEACHER_SECRET") && !xml.includes("GRADING_SECRET"));
  const p = new Deno.Command("python3", {
    args: [
      "-c",
      'import sys,xml.etree.ElementTree as E; r=E.fromstring(sys.argv[1]); assert len(r.findall("question"))==2; assert "TLS" in r.findall("question")[1].findall("answer")[1].find("text").text',
      xml,
    ],
    stdout: "piped",
    stderr: "piped",
  });
  assert((await p.output()).success, "standard XML parser rejected output");
});
Deno.test("unsupported answer binding body and resource collision fail ADAPTER before output", async () => {
  const cases = [
    (p: any) => p.questions[0].answerType = "numeric",
    (p: any) =>
      p.questions[0].condition.push({
        t: "RawBlock",
        c: ["html", "<script>bad</script>"],
      }),
    (p: any) =>
      p.resources.push({ ...p.resources[0], source: "other", sha256: "bad" }),
    (p: any) =>
      p.questions[0].condition.push({ t: "Span", c: [["eq-x", [], []], []] }),
  ];
  for (const mutate of cases) {
    const p = sample();
    mutate(p);
    let rejected = false;
    try {
      await exportMoodle(p, binding);
    } catch (e) {
      rejected = String(e).includes("ADAPTER");
    }
    assert(rejected);
  }
  let missing = false;
  try {
    await exportMoodle(sample(), {});
  } catch (e) {
    missing = String(e).includes("ADAPTER");
  }
  assert(missing);
});
Deno.test("resources used inside answer choices are attached to that question", async () => {
  const p = sample();
  p.questions[1].publicAnswer[0].c[0] = [{
    t: "Para",
    c: [{
      t: "Link",
      c: [["", [], []], [{ t: "Str", c: "Data" }], [p.resources[0].target, ""]],
    }],
  }];
  const xml = await exportMoodle(p, binding);
  const o = await new Deno.Command("python3", {
    args: [
      "-c",
      'import sys,xml.etree.ElementTree as E;r=E.fromstring(sys.argv[1]);assert len(r.findall("question")[1].find("questiontext").findall("file"))==1',
      xml,
    ],
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert(o.success);
});
Deno.test("review: XML attachments select exact native targets not prose or prefix matches", async () => {
  const p = sample();
  for (
    const target of ["resources/course-a/data", "resources/course-a/prose.txt"]
  ) p.resources.push({ ...p.resources[0], target });
  p.questions[0].condition.push({
    t: "Para",
    c: [{ t: "Str", c: "resources/course-a/prose.txt" }],
  });
  const xml = await exportMoodle(p, binding);
  assert(!xml.includes('name="data"') && !xml.includes('name="prose.txt"'));
  assert(xml.includes('name="data.txt"'));
});
Deno.test("review: Moodle rejects destination aliases before XML", async () => {
  for (
    const target of [
      "resources/course-a/./data.txt",
      "resources/course-a/a/../data.txt",
      "resources//course-a/data.txt",
    ]
  ) {
    const p = sample();
    p.resources.push({ ...p.resources[0], target });
    let rejected = false;
    try {
      await exportMoodle(p, binding);
    } catch (e) {
      rejected = String(e).includes("ADAPTER");
    }
    assert(rejected, target);
  }
});
