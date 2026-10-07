---
type: specification
component: course-moodle
status: current
updated: 2026-10-08
---

# Контракт экспорта Moodle

Moodle принимает teacher-пакет `course-body-package-v1`, собранный текущим Core для выбранных назначений, и явный binding. Producer Body и отбор native источников принадлежат [Core](../../quarto-course/docs/body-export.md). Правила этого документа относятся к Moodle XML, `exportMoodle(package, binding)` и собственным входным guards; они не меняют общую модель банка.

`manual` экспортируется как essay. Для `single-choice` требуются не менее двух native вариантов, допустимый целый `closedKey.correct`, положительное конечное `defaultGrade` и boolean `shuffle`; доли оценки — 100/0. `numeric`, `multipart` и `matching` отклоняются. Moodle вправе читать ключ single-choice из teacher payload; решение и grading notes не включаются в XML questiontext.

Вложения выбираются по текущим Image/Link slots, проверяются по владельцу, hash и безопасному target и используют `@@PLUGINFILE@@`. Адаптер не открывает повторно файлы по producer effectiveBase. Обход каталогов, source/service paths, aliases, коллизии, повреждённые ключи и неподдерживаемые AST отклоняются до записи XML. Готовый XML записывается только после успешного преобразования всех вопросов; отказ Pandoc сохраняет tool/exit/stdout/stderr/cause.

Экспорт создаёт банк вопросов. Assessment/access settings, соединение с LMS и подтверждение импорта в настоящий Moodle остаются отдельными действиями. [README](../README.md) содержит установку и CLI, [диагностика](../docs/diagnostics.md) — собственные ID/контекст. [Индекс](index.md) связывает `accepted-next`; restricted publication, новый состав назначений и исключение page preview внедряются совместно с Core в следующем шаге, существующий выпуск их пока не обещает.
