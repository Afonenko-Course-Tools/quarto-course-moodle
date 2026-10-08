import { assert } from "./support.ts";
if (import.meta.main) {
  assert(
    Deno.args.length === 1,
    "usage: student-package-cli.ts public-package.json",
  );
  const p = JSON.parse(await Deno.readTextFile(Deno.args[0]));
  assert(
    p.questions[1].answerType === "single-choice",
    "student answer type changed",
  );
  assert(
    p.questions.every((q: any) =>
      q.visibility === "public" && q.statementVisibility === "restricted"
    ),
    "restricted delivery policy changed",
  );
  const studentRoot = "_site-student";
  for (
    const file of [
      "corpus.html",
      "work-one.html",
      "work-two.html",
      "search.json",
    ]
  ) {
    const content = await Deno.readTextFile(`${studentRoot}/${file}`);
    for (
      const marker of [
        "TEACHER_SECRET",
        "GRADING_SECRET",
        "Explain securely",
        "Choose the secure protocol",
        "exr-manual",
        "exr-choice",
      ]
    ) {
      assert(
        !content.includes(marker),
        `${file}: restricted website content ${marker}`,
      );
    }
  }
  for (const resource of ["data.txt", "dot.png"]) {
    try {
      await Deno.stat(`${studentRoot}/${resource}`);
      throw Error(`restricted website resource remains: ${resource}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }
  assert(
    (await Deno.readTextFile(`${studentRoot}/work-one.html`)).includes(
      "PREVIEW_MUST_NOT_EXPORT",
    ),
    "student preview missing",
  );
  for (const secret of ["TEACHER_SECRET", "GRADING_SECRET", "closedKey"]) {
    assert(
      !JSON.stringify(p).includes(secret),
      `${secret} leaked into student package`,
    );
  }
}
