---
type: specification-index
component: course-moodle
status: current
updated: 2026-10-08
---

# Индекс спецификаций Moodle

Версия расширения определяется только [course-moodle/_extension.yml](../_extensions/course-moodle/_extension.yml) того же Git ref. На проверенной базе descriptor содержит `0.2.1`; опубликованный `v0.2.1` имеет SHA `2776107c33f837aaca12aa13a5d705f7308942ba`. Изменения `main` после тега являются **unreleased**, даже если descriptor ещё содержит номер предыдущего выпуска. Контракт установленного выпуска читается из того же тега, что и код: [документ `v0.2.1`](https://github.com/Afonenko-Course-Tools/quarto-course-moodle/blob/v0.2.1/README.md). Новый тег до реализации/проверок не объявлен.

`current` означает правила кода на выбранном ref; `accepted-next` — согласованный контракт будущего выпуска, который ещё не реализован. `historical` сохраняет происхождение решений без нормативной силы. У каждого правила один владелец: общую модель задаёт Core, этот репозиторий задаёт только свой экспорт или сопровождение сайта. README, руководство, планы и примеры не образуют отдельного общего контракта.

| Документ | type | component | status | Нормативный владелец и область |
| --- | --- | --- | --- | --- |
| [Подготовка авторства](../docs/authoring-next.md) | authoring-guide | course-moodle | accepted-next | Миграция примеров и граница consumer следующего выпуска |
| [Moodle: действующий контракт](export.md) | specification | course-moodle | current | teacher Body → XML essay/single-choice; binding и ключ ответа |
| [Диагностика](../docs/diagnostics.md) | reference | course-moodle | current | Собственные ID и внешние причины этого адаптера |
| [Body Core](../../quarto-course/docs/body-export.md) | specification | course-core | current | Общий producer transport и selected source input |
| [Следующая авторская модель](../../quarto-course/spec/authoring-model-next.md) | specification | course-core | accepted-next | Банк, условия, решения и назначения следующего выпуска |
| [План владельца](../docs/plans/2026-10-08-implementation.md) | plan | course-moodle | in-progress | Шаги 9 и завершение общего маршрута |
| [Карта сохранённой истории](../docs/history/2026-10-08/README.md) | history | course-moodle | historical | Исходные планы, probes/evidence, refs и provenance |

Новый `exercise-bank`, `statementVisibility`, `assignments`, stage и новая связь решений остаются `accepted-next` до совместного изменения Core и потребителей. Этот индекс не объявляет их поддержанными существующим выпуском. Порядок внедрения — [линейный план](../../quarto-course/docs/plans/2026-10-08-course-tools-implementation.md).
