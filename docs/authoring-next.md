---
type: authoring-guide
component: course-moodle
status: accepted-next
updated: 2026-10-08
---

# Назначенные вопросы в Moodle

Это подготовка согласованного следующего выпуска, а не обещание опубликованной версии. [Целевой контракт Core](../../quarto-course/spec/authoring-model-next.md) задаёт общую модель; [план владельца](plans/2026-10-08-implementation.md) фиксирует порядок внедрения и свежие проверки. Существующие публичные API владельца сохраняются. После реализации и проверки эти правила переносятся в действующий контракт и README. Минимум следующего выпуска — Quarto 1.11.5, CUE 0.17.1.

Moodle получает teacher результат `buildBodies(...).package`, а participant потребители получают `publicPackage`. Право Moodle прочитать `closedKey.correct` для single-choice сохраняется; решение и grading notes не становятся `questiontext`. Публичные guards остаются отдельными от teacher capability.

`statementVisibility: open|restricted` отдельно описывает сайт. Participant-safe Body `visibility: public` сохраняет своё значение даже у restricted условия. Выбранный teacher пакет может содержать такую задачу для выдачи участнику через Moodle. Опубликованный каталог или full источник сами по себе не разрешают выдавать ключи.

Body сохраняет `schema: course-body-package-v1`. Работа имеет `kind: lab|seminar|practical|test`, `items` с qualified ключами `owner/exr-ID` и обязательную карту `assignments` с точно теми же ключами. Каждое значение содержит `requirement: required|optional`, `workMode: individual|pair|group` и необязательный `stage: demonstration|classroom|homework`. Local ID карты или дополнительное поле отклоняются самостоятельным API. В `test` и `practical` допускаются только restricted вопросы.

В XML входят назначенное условие, поддерживаемые native поля ответа и проверенные вложения. Внутренние заголовки условия сохраняются; preview страницы, внешние заголовки занятия и окружающая проза не экспортируются. `manual` остаётся essay; `single-choice` получает один 100% вариант из teacher ключа, остальные — 0%. Optional/required не превращаются в правило оценивания LMS.

Binding `defaultGrade`/`shuffle`, безопасные targets, bytes/hash и write-after-success остаются прежними. Экспорт создаёт банк вопросов; activity, доступ, серверный импорт и соединение с LMS требуют отдельной платформенной настройки. `examples/questions` показывает открытый разбор и два варианта restricted вопросов.

Сейчас release pins ещё указывают на последние опубликованные теги. Новые install/demo/source refs появятся только после решения о версиях и успешных releases; новый URL до этого не выдумывается. Готовый asset должен содержать точный producer commit и фактические зависимости в `BUILD.json`. Эта подготовка не подтверждает render, CI или выпуск.
