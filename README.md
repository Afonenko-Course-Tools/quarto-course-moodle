# Quarto Course Moodle

Moodle exports an XML question bank from the current native Core `course-body-package-v1` teacher package. Require a successful ordinary Quarto render, load the explicit current NativeRun and call `buildBodies(result, {projectRoot, includeClosed: true})` on full-view results. Pass `package` to Moodle; Print and student downloads receive `publicPackage` instead.

```sh
quarto add Afonenko-Course-Tools/quarto-course-moodle --no-prompt
deno run --allow-read --allow-write --allow-run=quarto --allow-env \
  _extensions/course-moodle/entrypoints/export.ts \
  teacher-package.json binding.json bank.xml
```

The local install path above receives a provider prefix for GitHub installs. Binding requires positive finite numeric `defaultGrade` and boolean `shuffle`. Manual questions export as essays; single-choice questions require at least two native options and one valid integer `closedKey.correct`, exporting 100/0 fractions. Numeric, multipart and matching grading remain unsupported and fail clearly with `ADAPTER`. The old experimental P0 transport is unsupported.

Only public conditions and public answer options become XML. Solutions and grading notes are never rendered. Attachments select exact current Image/Link targets, validate hashes and ownership, and use `@@PLUGINFILE@@`. Project-relative targets and absolute producer effectiveBase contexts are supported; Moodle does not reopen source files. Source/service paths, target traversal/aliases/collisions, malformed keys, raw markup, rich anchors, citations and unsupported nodes fail before output. This creates a question bank, not a Quiz/Assignment or a live Moodle connection.

```sh
CORE=../quarto-course bash tools/check.sh
```

The check installs actual payloads, renders authored native full/student examples, builds current Body packages and validates XML with Python's standard parser, attachment bytes, grading and installed failure paths. Acceptance versions are Quarto 1.10.18/1.11.5 and CUE 0.17.1. The vendored XML writer avoids npm/network at runtime; vendor rebuilding is a separate maintainer task.
