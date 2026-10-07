# План рефакторинга диагностики Moodle — 7 октября 2026

Для исполнения: subagent-driven-development либо executing-plans по выбранному
способу. **Цель:** русские ошибки с контекстом вопроса/binding/ресурса и
сохранённая причина Pandoc. **Архитектура:** teacher Body + binding → validation
и hashes → Pandoc HTML → xmlbuilder2 → запись XML после успеха.
**Средства:** текущие Deno/Pandoc/xmlbuilder2; без общего Print/Moodle runtime.
**Основание:** [общий план](../../../specs/course-change-plan.md#исследование-и-план-рефакторинга-7-октября-2026).
База main `42c8709`, подтверждена через GitHub.

Ограничения: только нынешние типы экспорта, неизменные own/foreign ID, широкий
ADAPTER сохраняется; создание Moodle tests/access control не добавляется.
Обычный author strict render и прежний инструментальный CI разделены.
Контрпримеры — только internal tests, документация — русские корректные примеры.
При ревью проверить: malformed binding, choice mapping, неподдержанный answer type,
hash mismatch и Pandoc nonzero без нового XML.

## M1 Внешняя граница отдельно от teacher validation

Создать: `_extensions/course-moodle/infrastructure/process.ts`.
Изменить: `infrastructure/transport.ts`, `application/export.ts`.
Сохранить `command(cmd,args,input?,cwd?) → Promise<string>`, перенести только
исполнение команды. Cause содержит tool/exitCode/stdout/stderr; stderr видим,
а native Pandoc failure не становится общей ADAPTER ошибкой содержимого.
Создать `tests/process.test.ts` для автономной проверки этой IO-границы.
Все runtime-пути плана относительно `_extensions/course-moodle/`;
transport.ts без префикса означает infrastructure/transport.ts.

- [ ] В export/native tests fake Pandoc выдаёт свой marker, оба потока и nonzero:
  они сохранены, XML не записан. stderr при exit 0 не означает отказ.
- [ ] Отделить запуск и обновить импорты, не объединять teacher validator
  с public-only Print: closedKey/solution/gradingNotes имеют другой контракт.
- [ ] Выполнить `deno test --no-config --no-lock --no-npm --cached-only --deny-net --allow-read --allow-write --allow-run --allow-env tests/process.test.ts`;
  полноценный XML regression выполняется M2 с BODY_PACKAGE из tools/check.sh.
  Проверка изменений и коммит.

## M2 Русские guard и узкая CLI-граница

Создать: `infrastructure/diagnostics.ts` с
`diagnostic(code,message,context?,cause?) → Error & {code:string}`.
Изменить: `transport.ts`, `application/export.ts`, `entrypoints/export.ts`.
Public `exportMoodle(p,binding) → Promise<string>` остаётся прежним;
internal fail получает известные source/question/binding field/resource/hint.
ADAPTER сохраняется; `MOODLE.INPUT_INVALID` — только прежние неименованные CLI guards.

- [ ] В export/xml tests закрепить ADAPTER + компонент/вопрос/поле для
  defaultGrade/shuffle/answer type/choice/hash; исправленные inputs проходят.
- [ ] Перевести собственные сообщения, добавить контекст и действие. Catch
  только ожидаемых диагностик; чужие ошибки и неизвестный stack сохраняются.
- [ ] Выполнить `CORE=/home/tolya/course-tools/quarto-course bash tools/check.sh`
  на Quarto 1.10.18/1.11.5: suites и installed full/student paths проходят.
- [ ] Проверка изменений и коммит, убедиться, что после ошибки не создан новый XML.

## M3 Русский справочник и группа

Создать: `docs/diagnostics.md`; изменить: README, `examples/questions/_quarto.yml`,
`examples/questions/bank/_quarto.yml`, index/bank QMD и README группы.
У bank собственный lang и русский book.title; binding keys/IDs не переводятся.

- [ ] Таблица устойчивых ID, смысла и исправления без invalid QMD;
  объяснить границы экспорта и отсутствие подтверждения импорта в реальную LMS.
- [ ] Перевести авторский текст, задать native lang ru и штатные source-ссылки,
  сохранив самостоятельность группы и её ресурсы.
- [ ] Выполнить `CORE=/home/tolya/course-tools/quarto-course bash tools/check-demo.sh`;
  проверить XML и native HTML, проверка изменений и PR. Новый ready release выпускается
  из проверенного merged SHA по общему плану групп, старый asset не заменяется.
