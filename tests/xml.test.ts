import { children, quiz, text } from "./xml.ts";
import { assert } from "./support.ts";
import { sample } from "./native-sample.ts";
import { exportMoodle } from "../_extensions/course-moodle/application/export.ts";

for (
  const [label, xml] of [
    ["mismatched closing tag", "<quiz><question></wrong></quiz>"],
    ["unclosed question", "<quiz><question></quiz>"],
    ["unclosed root", "<quiz><question/>"],
    ["multiple roots", "<quiz/><quiz/>"],
    ["raw ampersand in text", "<quiz><question>A & B</question></quiz>"],
    ["raw ampersand in attribute", '<quiz title="A & B"/>'],
    ["duplicate attribute", '<quiz title="one" title="two"/>'],
    ["unquoted attribute", "<quiz title=one/>"],
    ["unclosed attribute quote", '<quiz title="one/>'],
    ["undefined named entity", "<quiz>&copy;</quiz>"],
    ["invalid numeric entity", "<quiz>&#0;</quiz>"],
    ["surrogate numeric entity", "<quiz>&#xD800;</quiz>"],
    ["out of range numeric entity", "<quiz>&#x110000;</quiz>"],
    ["malformed numeric entity", "<quiz>&#xGG;</quiz>"],
    ["missing entity semicolon", "<quiz>&amp</quiz>"],
    ["unclosed CDATA", "<quiz><![CDATA[body</quiz>"],
    ["CDATA outside root", "<![CDATA[body]]><quiz/>"],
    ["unclosed comment", "<quiz><!-- body</quiz>"],
    ["invalid comment separator", "<quiz><!-- a--b --></quiz>"],
    ["unclosed processing instruction", "<?probe body<quiz/>"],
    ["unsupported DTD", '<!DOCTYPE quiz [<!ENTITY x "body">]><quiz>&x;</quiz>'],
    ["literal less-than in attribute", '<quiz title="a < b"/>'],
    ["text outside root", "body<quiz/>"],
    ["illegal text character", "<quiz>\u0000</quiz>"],
    ["CDATA close in ordinary text", "<quiz>]]></quiz>"],
  ] as const
) {
  Deno.test(`original Moodle XML refuses ${label} before DOM repair`, () => {
    let rejected = false;
    try {
      quiz(xml);
    } catch {
      rejected = true;
    }
    assert(rejected, `Malformed XML accepted: ${label}`);
  });
}

Deno.test("original XML accepts escaped markup, valid entities and closed lexical constructs", () => {
  const root = quiz(
    '<?xml version="1.0" encoding="UTF-8"?>\n<!--before--><?probe test?><quiz title="&quot;&apos;&amp;&lt;&gt;&#9;&#x1F600;">\n<question><![CDATA[A & B < C]]></question><!--after--></quiz>',
  );
  assert(children(root, "question").length === 1);
});

Deno.test("strict original XML gate accepts a real generated Moodle bank", async () => {
  const xml = await exportMoodle(sample(), { defaultGrade: 1, shuffle: false });
  const questions = children(quiz(xml), "question");
  assert(questions.length === 1);
  assert(text(questions[0], "idnumber") === "course-a/exr-manual");
});
