import { assertWellFormed } from "./xml-wellformed.ts";
import { create } from "../_extensions/course-moodle/vendor/xmlbuilder2.js";
import { assert } from "./support.ts";

/** Parse using the XML DOM already bundled with the adapter, without npm or Python. */
export function quiz(xml: string): any {
  assertWellFormed(xml);
  const root = create(xml).node.documentElement;
  assert(root?.tagName === "quiz", "XML root is not quiz");
  return root;
}
export function children(node: any, tag: string): any[] {
  return Array.from(node.childNodes as any[]).filter((child: any) =>
    child.nodeType === 1 && child.tagName === tag
  );
}
export function text(node: any, tag: string): string {
  const matches = children(node, tag);
  assert(matches.length === 1, `expected one ${tag}`);
  return matches[0].textContent;
}
export function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value.trim()), (c) => c.charCodeAt(0));
}
