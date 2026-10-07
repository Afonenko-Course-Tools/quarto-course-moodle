export interface DiagnosticContext {
  source?: string;
  id?: string;
  field?: string;
  related?: { source?: string; id?: string; field?: string }[];
  hint?: string;
}
export function diagnostic(
  code: string,
  message: string,
  context: DiagnosticContext = {},
  cause?: unknown,
): Error & { code: string } {
  const location = (c: Omit<DiagnosticContext, "related" | "hint">) =>
    [
      c.source && `источник: ${c.source}`,
      c.id && `объект: ${c.id}`,
      c.field && `поле: ${c.field}`,
    ].filter(Boolean).join(", ");
  const parts = [`${code}: Moodle: ${message}`, location(context)];
  for (const related of context.related ?? []) {
    parts.push("Связано: " + location(related));
  }
  if (context.hint) parts.push("Подсказка: " + context.hint);
  const error = Object.assign(
    new Error(
      parts.filter(Boolean).join("\n"),
      cause === undefined ? undefined : { cause },
    ),
    { code },
  );
  error.name = "ExtensionDiagnostic";
  return error;
}
/** Retain only available author provenance, never invented temporary line numbers. */
export function objectContext(
  value: unknown,
  field: string,
): DiagnosticContext {
  const v = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  return {
    ...(typeof v.source === "string" ? { source: v.source } : {}),
    ...(typeof v.key === "string"
      ? { id: v.key }
      : typeof v.id === "string"
      ? { id: v.id }
      : typeof v.target === "string"
      ? { id: v.target }
      : {}),
    field,
  };
}
