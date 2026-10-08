---
type: implementation-report
component: quarto-course-moodle
status: completed
updated: 2026-10-08
---

# Moodle: внедрение 8 октября 2026

Это отчёт проверенных операций. Нормативные правила принадлежат
[текущим спецификациям](../../spec/index.md) того же ref; контракт выпуска
читается по точному immutable тегу.

Выпущен [v0.3.0](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/releases/tag/v0.3.0), source SHA
`60ce53d0d52a93e66ca545f2a6cd96f97f09d1e6`, immutable Release ID `406378560`.
[PR #8](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/pull/8)
прошёл проверки и слит с сохранением истории; дерево merged main равно tested PR head.
[Main CI](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/actions/runs/37722395672)
завершился SUCCESS на указанном source SHA до публикации.

Core `v4.0.0`, Moodle `v0.3.0`; Quarto 1.11.5 / CUE 0.17.1.
Штатный remote-tag `quarto add` прошёл: все **17** установленных
пути и bytes совпали с upstream `_extensions` этого Git object, без overlay
и лишних файлов. Draft assets были скачаны и сверены до immutable публикации.

Frozen integration: 84 tests / 0 failed, installed CLI и student → full → student. Настоящие XML вариантов разобраны: два вопроса, teacher key используется только для выбранного single-choice, правильная доля 100/0; solution/notes не выдаются как условие.

Готовые группы выпущены в отдельном immutable
[demo-20261008](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/releases/tag/demo-20261008)
на том же producer SHA; `BUILD.sourceDirty:false`. Native build, HTML, resources,
sourceLinks и actual outputs прошли; полный ready map совпал с downloaded archive.

| Группа | Asset | Файлов | Archive SHA-256 |
| --- | --- | ---: | --- |
| moodle | `moodle-questions.tar.gz` | 21 | `8c441aab45c3b2e30ff10c3ceaea301aea9fb5f7a832a7a6ced3afbdb9513030` |

Native sourceRef — собственный tool tag, catalog source — demo tag; оба
указывают на тот же source SHA. Старые immutable tags/assets сохранены.

Live импорт в Moodle, тест/расписание/попытки/права LMS не проверялись и не создавались.

Нативный Windows прогон не заявляется. Узкие path/CUE-TEMP исправления Core 4.0.0
подтверждены fixtures; чужие warning streams сохраняются с фактическим exit.
Подробные receipts и общий результат — [центральный отчёт Core](https://github.com/Afonenko-Course-Tools/quarto-course/blob/main/docs/releases/2026-10-08-implementation.md).

Первый сохранённый owner history checkpoint: `95bd32d6c723868377480b7ef6add79d1e2d7694`.
Шаг 17 выполнен; actual before/after receipt: `3 LOCAL / 1 REMOTE; main, all tags/Releases, serving gh-pages и API-confirmed OPEN bot heads сохранены`.
Более поздний docs/history main не переименовывает опубликованный source SHA.

Восстановление финальных снимков: [SOURCE-MAP](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/blob/95bd32d6c723868377480b7ef6add79d1e2d7694/docs/history/2026-10-08-completion/SOURCE-MAP.json). После проверки exact Git blobs только этот новый датированный snapshot-каталог удаляется из active docs; архивный commit остаётся reachable. Последние планы и cleanup receipts: [Git checkpoint](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/blob/5c1609a2c79ae1f14a75fa9db4bdf012b409b72c/docs/history/2026-10-08-completion/final-journals/2026-10-08-implementation.md); [общая квитанция](https://github.com/Afonenko-Course-Tools/quarto-course/blob/35ab45a60d3859c4aa584499e4a49c5b8b6f14bf/docs/history/2026-10-08-completion/final-cleanup/03-verified-cleanup.json).
