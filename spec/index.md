---
type: specification-index
component: course-moodle
status: current
updated: 2026-10-08
---

# Индекс спецификаций Moodle

Версия расширения определяется [descriptor](../_extensions/course-moodle/_extension.yml) того же Git ref.
Код, descriptor и документация выпуска читаются из одного точного тега. Изменения main после выпущенного тега — **unreleased**.

`current` означает правила кода на выбранном ref; `accepted-next` — согласованный контракт будущего выпуска, который ещё не реализован. `historical` сохраняет происхождение решений без нормативной силы. У каждого правила один владелец: общую модель задаёт Core, этот репозиторий задаёт только свой экспорт или сопровождение сайта. README, руководство, планы и примеры не образуют отдельного общего контракта.

| Документ | type | component | status | Нормативный владелец и область |
| --- | --- | --- | --- | --- |
| [Moodle: действующий контракт](export.md) | specification | course-moodle | current | teacher Body → XML essay/single-choice; binding и ключ ответа |
| [Диагностика](../docs/diagnostics.md) | reference | course-moodle | current | Собственные ID и внешние причины этого адаптера |
| [Body Core](../../quarto-course/docs/body-export.md) | specification | course-core | current | Общий producer transport и selected source input |
| [Авторская модель Core](../../quarto-course/spec/index.md) | specification/index | course-core | current | Банк, условия, решения и назначения |
| [План владельца](../docs/plans/2026-10-08-implementation.md) | plan | course-moodle | in-progress | Шаги 9 и завершение общего маршрута |
| [Карта сохранённой истории](../docs/history/2026-10-08/README.md) | history | course-moodle | historical | Исходные планы, probes/evidence, refs и provenance |

Банк и назначения принадлежат текущему Core; этот адаптер проверяет свой вход
на собственной границе. Порядок выпуска и финальные проверки сохраняются в
[плане владельца](../docs/plans/2026-10-08-implementation.md).
