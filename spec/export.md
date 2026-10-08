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

Экспорт создаёт банк вопросов. Assessment/access settings, соединение с LMS и подтверждение импорта в настоящий Moodle остаются отдельными действиями. [README](../README.md) содержит установку и CLI, [диагностика](../docs/diagnostics.md) — собственные ID/контекст. Версия определяется descriptor того же ref; документация выпуска читается из того же тега, что и код.

## Общая модель и состав выбранной работы

Вопрос содержит отдельные `statementVisibility: open|restricted`, boolean
`hasPublicSolution` и необязательный `purpose` из
`demonstration|discussion|independent-study|control`. Body `visibility: public`
означает безопасную выдачу участнику, включая выбранное restricted условие.
Teacher-пакет дополнительно содержит проверенные `closedKey`, `solution`,
`gradingNotes`; публичная часть проверяется отдельно. Moodle читает ключ
single-choice для долей 100/0 и не рендерит решение или заметки преподавателя.

Работа имеет `kind: lab|seminar|practical|test`, qualified `items` в авторском
порядке и обязательную карту `assignments` с точно теми же ключами. Значение:
`requirement: required|optional`, `workMode: individual|pair|group`,
необязательный `stage: demonstration|classroom|homework`. Назначение demonstration
требует open, purpose demonstration и hasPublicSolution true. Все вопросы
`test`/`practical` restricted. Необязательный `theoryTime` — положительное
конечное число минут, включая дробное; адаптер не рассчитывает время работы.
Local ID вместо qualified ключа, неизвестные поля и неверные enum отклоняются.

Producer включает только назначенные условия и поля ответа. Внутренние заголовки
условия сохраняются; `.assessment-preview`, внешние заголовки работы,
окружающая проза и неназначенные задачи не входят в XML. Optional/required
не создают платформенное правило оценивания. [Демонстрация](../examples/questions/README.md)
показывает открытый разбор и два варианта restricted вопросов.
