# Moodle: план владельца

Статус: следующий этап, реализация не начата. Выполнять пункт 9 и затем
пункты 12–13/17–18 [линейного плана](../../../quarto-course/docs/plans/2026-10-08-course-tools-implementation.md).
[Целевой контракт Core](../../../quarto-course/spec/authoring-model-next.md)
задаёт поля банка/работ/назначений. Quarto 1.11.5 / CUE 0.17.1;
широкую Windows CI matrix не добавлять.

## Изменения, документация и проверки

Согласовать `_extensions/course-moodle/infrastructure/transport.ts` (сейчас скопированный public shape/старые kinds) и `_extensions/course-moodle/application/export.ts` с новым Core teacher Body. Moodle сохраняет своё право читать closedKey для single-choice mapping; teacher validation не объединяется с Print participant validation. Экспорт только выбранных назначений/условий/answer fields/resources; page preview и page prose не становятся XML questiontext. Не создавать assessment, настройки доступа или новые question types.

Создать `_extensions/course-moodle/infrastructure/{process,diagnostics}.ts`, обновить `_extensions/course-moodle/entrypoints/export.ts`; только command IO вынести из transport. ADAPTER сохраняется с Moodle/question/source/binding field/resource; MOODLE.INPUT_INVALID только для CLI input. Pandoc nonzero/cause/stdout/stderr сохраняются; XML записывается после полного успеха. Обновить `README.md`, создать `docs/diagnostics.md`, owner plan, `tests/{native,export,xml}.test.ts`, native-sample/native-course/package/student/installed fixtures и `examples/questions` configs/QMD/build.ts/bindings.

Проверки: `deno test --no-config --no-lock --no-npm --cached-only --deny-net --allow-read --allow-write --allow-run --allow-env tests/process.test.ts`; затем `CORE=/home/tolya/course-tools/quarto-course bash tools/check.sh` и `CORE=/home/tolya/course-tools/quarto-course bash tools/check-demo.sh`. Проверить malformed binding/defaultGrade/shuffle/answer type/choice/hash, корректный well-formed XML и отсутствие нового XML при Pandoc nonzero. Успешный XML не означает подтверждённый импорт в настоящую LMS.

## Завершение

Оформить актуальный индекс спецификаций, README и собственный справочник
диагностик; примеры показывают правильную русскую авторскую разметку.
Старые plans/probes сохранить в Git до удаления из активной ветки.

Сверить свежие required checks и owner PR, слить в main и проверить merged SHA.
Выпустить новую версию с точными уже выпущенными зависимостями; готовую группу
демо, если она есть, выпускать отдельным проверенным asset. Старые Releases
не заменять. Финальная очистка веток только после общего маршрута:
main + служебная gh-pages, если используется, + heads OPEN automatic PR.
Здесь сохранить commit/PR/tag/SHA, фактические проверки и ссылки на готовые assets.
