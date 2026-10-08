---
type: plan
component: course-moodle
status: in-progress
updated: 2026-10-08
---

# Moodle: план владельца

Статус: шаги 1–2 выполнены; runtime следующей модели ещё не реализован. Выполнять пункт 9 и затем
пункты 12–13/17–18 [линейного плана](../../../quarto-course/docs/plans/2026-10-08-course-tools-implementation.md).
[Целевой контракт Core](../../../quarto-course/spec/authoring-model-next.md)
задаёт поля банка/работ/назначений. Quarto 1.11.5 / CUE 0.17.1;
широкую Windows CI matrix не добавлять.

## Изменения, документация и проверки

Согласовать `_extensions/course-moodle/infrastructure/transport.ts` (сейчас скопированный public shape/старые kinds) и `_extensions/course-moodle/application/export.ts` с новым Core teacher Body. Moodle сохраняет своё право читать closedKey для single-choice mapping; teacher validation не объединяется с Print participant validation. Экспорт только выбранных назначений/условий/answer fields/resources; page preview и page prose не становятся XML questiontext. Не создавать assessment, настройки доступа или новые question types.

Свежий main уже содержит `_extensions/course-moodle/infrastructure/{process,diagnostics}.ts` и CLI границу; сверить их, не повторять вынос command IO из transport. ADAPTER сохраняется с Moodle/question/source/binding field/resource; MOODLE.INPUT_INVALID только для CLI input. Pandoc nonzero/cause/stdout/stderr сохраняются; XML записывается после полного успеха. Обновить `README.md`, уточнить существующий `docs/diagnostics.md`, owner plan, `tests/{native,export,xml}.test.ts`, native-sample/native-course/package/student/installed fixtures и `examples/questions` configs/QMD/build.ts/bindings.

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

## Выполнение шагов 1–2 — 8 октября 2026

Общий старт: 02:36 Europe/Minsk; дедлайн: 11:36. Рабочая ветка — `feat/authoring-model-20261008`, создана в существующем checkout; дополнительные репозитории/worktrees не создавались.

- [x] Fresh `git fetch origin --tags`, live remote heads, releases и OPEN PR: сохранены в [inventory/history](../history/2026-10-08/README.md). Открытых PR на момент чтения нет. Все старые refs/tags и пользовательские worktrees оставлены.
- [x] Dirty tracked/untracked owner-планы и выбранные root mixed документы сохранены exact snapshots: `82474c571c0b5aceae2815072a520c7bfb32cfd6`. [Provenance](../history/2026-10-08/provenance.json) содержит исходный путь, mtime, bytes и SHA-256; старые evidence не считаются текущим CI.
- [x] Свежий `origin/main` `6ca11a0d0f9fc442b19bceca2ae0491f3fd96203` объединён в рабочую ветку коммитом `efddae440f9c03350e64728f9a186880603e4ea0`. В адаптерах add/add касается только старого diagnostics-плана; upstream вариант принят после сохранения исходного, оба остаются в Git.
- [x] Добавлен [spec/index.md](../../spec/index.md), type/component/status, links из README, явный main unreleased и accepted-next. Прежний план и historical snapshots удалены из активной ветки после exact Git-byte проверки; карта истории и исходные root файлы сохранены.

Текущая база: выпуск `v0.2.1` (`2776107c33f837aaca12aa13a5d705f7308942ba`), descriptor `0.2.1`, ready demo `demo-20261007-ru2`.

Проверки: exact bytes/SHA-256 всех выбранных root snapshots; Git whitespace check; локальная проверка новых документационных links/меток; diff относительно свежего origin/main ограничен документацией и историей. Runtime suites и CI не запускались: эти шаги не меняют поведение. Meaningful ignored авторских исходников вне известных generated/cache/dependency trees не найдено; BUILD и hashes ready archives учтены, существующие результаты оставлены на диске.

Сохранение истории завершено до cleanup: исходные тексты восстанавливаются по preservation/merge SHA, а active docs/spec содержат действующие документы и dated owner-план. Root источники, runtime, generated результаты и пользовательские worktrees не удалялись.

Ограничение исполнителя: текущий агент наследует настройку родителя; отдельное включение ultra для этой документационной подзадачи через доступные инструменты не выполнялось. Блокеров шагов 1–2 нет; реализация следующего контракта, проверки, новые pins/releases и публикация ожидают последовательных шагов 9/12–18.


## Подготовка документации пункта 9 — 8 октября 2026

Документационный исполнитель работает по принятым Core решениям; модель не
менялась. Добавлена [подготовка авторства](../authoring-next.md) `accepted-next`,
ссылки из README и индекса. Существующие current API/контракты не объявлены
мигрированными до проверки runtime. Примеры на этой ветке предназначены для
следующей модели; native ordinary Quarto сохранён вне bank opt-in.

- Свежая проверка: `git diff --check`; 28 локальных Markdown-ссылок
  README/spec/docs/плана/README примеров существуют; 4 авторских YAML
  файлов успешно прочитаны. Проверка исключает generated/dependency деревья.
- Активные примеры не содержат старых kinds exam/handout, solution `for`,
  fixture sentinel/literal текста и Quarto 1.10.x. Русский lang сохраняется,
  публичные native проекты задают `fail-if-warnings: true`.
- Машинные descriptors/workflows и runtime/tests не изменялись этим исполнителем.
  Старые выпущенные dependency/demo/source pins сохранены как baseline;
  **новые release pins ожидают решения о версиях и фактических Releases**.

- Статически сверены банковские области: `examples/questions/bank` — 5 задач / 2 работ. Для каждой задачи собственные difficulty/time и эффективная open/restricted policy; ID состава существуют, не повторяются, test/practical назначают только restricted. Это проверка разметки, не native AST/render.

Full dependent suites/CI/render против меняющегося Core здесь не запускались.
Следующий runtime исполнитель выполняет команды выше, проверяет текущие
student/full outputs и выбранный экспорт, после чего документальная подготовка
переносится в current README/контракт. Merge/push/release/публикация не выполнены.

Координация runtime: главы работы и контрольного банка теперь входят в shared
native состав student/full. Student должен показывать title/assessment-preview,
но не restricted body/ссылки назначений/их ресурсы/search. Старые demo-profile
assertions отсутствия самой страницы работы требуется заменить проверкой этой
проекции. Добавленный открытый разбор не входит в выбранную delivery/PDF/XML.

Ruling: process/diagnostics/CLI/cleanup уже существуют в свежем main; старое указание создать их заменено сверкой фактической границы.
