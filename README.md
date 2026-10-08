---
type: documentation
component: course-moodle
status: current
updated: 2026-10-08
---

# Quarto Course Moodle

[Индекс спецификаций](spec/index.md) описывает контракт текущего Git ref.
Версия определяется descriptor этого ref; код и документация устанавливаемого
выпуска читаются из одного тега. Изменения main после выпущенного тега —
**unreleased**. Минимум — Quarto 1.11.5 и CUE 0.17.1.

Moodle создаёт XML-банк вопросов из актуального teacher-пакета Core
`course-body-package-v1`. Сначала вызовите
`collectExport(courseRoot, {book, work, profiles})`, затем
`buildBodies(result, {projectRoot, courseId, work, includeClosed:true})`.
Передайте Moodle результат `package`; Print использует `publicPackage`.
Идентификатор курса объявляется один раз в корне. Полный сбор исходников
включает контрольные QMD, скрытые в student HTML, и не требует полного HTML-рендера.

```sh
quarto add Afonenko-Course-Tools/quarto-course-moodle@v0.3.0 --no-prompt
deno run --allow-read --allow-write --allow-run=quarto --allow-env \
  _extensions/Afonenko-Course-Tools/course-moodle/entrypoints/export.ts \
  teacher-package.json binding.json bank.xml
```

Команда показывает путь установки с GitHub. Локальная установка может создать
`_extensions/course-moodle`: используйте фактический путь Quarto.
В binding обязательны положительное конечное число `defaultGrade` и boolean
`shuffle`. Вопросы `manual` становятся essay. Для `single-choice` требуются
не менее двух native вариантов и целый допустимый `closedKey.correct`;
доли оценки составляют 100/0. Типы `numeric`, `multipart` и `matching`
не поддерживаются и отклоняются с `ADAPTER`. Старый экспериментальный P0-контракт
не поддерживается. См. [справочник диагностики](docs/diagnostics.md).

В XML попадают только публичное условие и публичные варианты ответа. Решения
и заметки преподавателя не рендерятся. Вложения выбираются по точным текущим
Image/Link target, проверяются по хешу и владельцу и используют `@@PLUGINFILE@@`.
Допустимы относительные target и абсолютный producer effectiveBase; адаптер
не открывает исходные файлы повторно. Исходные и служебные пути, обход каталогов,
алиасы и коллизии target, повреждённые ключи, raw-разметка, сложные якоря,
цитирования и неподдерживаемые узлы отклоняются до записи XML.
Это банк вопросов; создание тестов/заданий, права доступа и соединение с LMS
не входят в экспорт. Локальные проверки не подтверждают импорт в реальный Moodle.

```sh
CORE=../quarto-course bash tools/check.sh
CORE=../quarto-course bash tools/check-demo.sh
```

Проверка устанавливает фактические payload, рендерит native full/student примеры,
создаёт текущие Body-пакеты и проверяет разобранный XML, байты вложений,
оценивание и ошибочные пути установленного CLI. Поддерживаемые проверочные
версии — Quarto 1.11.5 и CUE 0.17.1. Встроенный XML writer не требует
npm или сети во время работы; его пересборка — отдельная задача сопровождения.

## Установка выпуска

Версия определяется descriptor того же Git ref. Код, descriptor и документация
установленного выпуска читаются из того же точного тега, что указан в команде.
Сохраните `_extensions` в Git курса; при обновлении просмотрите diff и выполните
проверки курса. Опубликованные теги неизменяемы; исправления получают новый тег.

## Общие назначения заданий

Работа `lab|seminar|practical|test` объединяет один или несколько списков
`.task-items`. Body сохраняет qualified `items` и обязательную карту
`assignments` с теми же ключами: `{stage?, requirement, workMode}`. В test/practical
все назначенные условия restricted. Moodle получает teacher `package` для
ключа single-choice; Print получает отдельный participant `publicPackage`.
Решения и gradingNotes не становятся текстом вопроса. Дополнительные задания
не заменяют обязательные; метаданные работы не создают activity и не превращают
общую обязательность в правило оценивания LMS. Полные правила —
[контракт экспорта](spec/export.md). См. [самостоятельную демонстрацию](examples/questions/README.md).
