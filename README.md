---
type: documentation
component: course-moodle
status: current
updated: 2026-10-08
---

# Quarto Course Moodle

[Индекс спецификаций](spec/index.md) различает действующий контракт, согласованную следующую модель и историю. Версия на выбранном ref читается из `_extensions/course-moodle/_extension.yml`; `main` после последнего выпуска — **unreleased**.

Moodle создаёт XML-банк вопросов из актуального teacher-пакета Core
`course-body-package-v1`. Сначала вызовите
`collectExport(courseRoot, {book, work, profiles})`, затем
`buildBodies(result, {projectRoot, courseId, work, includeClosed:true})`.
Передайте Moodle результат `package`; Print использует `publicPackage`.
Идентификатор курса объявляется один раз в корне. Полный сбор исходников
включает контрольные QMD, скрытые в student HTML, и не требует полного HTML-рендера.

```sh
quarto add Afonenko-Course-Tools/quarto-course-moodle@v0.2.1 --no-prompt
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
версии — Quarto 1.10.18/1.11.5 и CUE 0.17.1. Встроенный XML writer не требует
npm или сети во время работы; его пересборка — отдельная задача сопровождения.

[Подготовка следующего authoring-контракта](docs/authoring-next.md) содержит правила нового банка и назначения. Они остаются `accepted-next` до проверки совместного runtime; опубликованные pins ниже пока сохраняются.

## Установка выпуска

Выпуск `v0.2.1` соответствует `_extension.yml`. Установите точный тег выше
и сохраните установленные `_extensions` в репозитории курса. Для обновления
установите следующий опубликованный тег через `quarto add`, просмотрите изменения
и выполните проверки курса. Опубликованные теги неизменяемы; исправления получают
новую версию и тег.

## Общие назначения заданий

Работа использует один авторский список `.task-items`. Transport сохраняет
канонические ключи `items` и необязательные `requirements` по локальному ID
`exr-*` со значениями `required` или `optional`. Для lab/test/exam по умолчанию
задание обязательное; handout — неоцениваемая подборка. Дополнительные задания
не заменяют обязательные. Moodle импортирует только вопросы: метаданные работы
не создают активность и не превращают требования в правило платформенного
оценивания. См. [самостоятельную демонстрацию](examples/questions/README.md).
