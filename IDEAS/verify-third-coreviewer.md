# Handoff: третий co-reviewer для `/verify`

Рассматривается идея Добавить к `/verify` опционального третьего co-reviewer-а, который запускается
через переписанный `skills/_shared/agents/review-code.md`.

Цель — получать task-relevant implementation-quality findings, не расширяя
логику основного `/verify`: основной verifier сохраняет единственный verdict,
самостоятельно распоряжается findings и не управляет отдельными focus-ами или
условиями запуска трёх co-reviewer-ов. Третий reviewer может иногда запускаться
не по существу или не запускаться; это не должно блокировать verification.

`review-code.md` должен стать read-only co-reviewer prompt и возвращать только
evidence-backed candidate findings по фактическому change surface. Он не создаёт
отдельный verdict, artifact, lifecycle или новый contract и не подменяет
`/verify` либо `/red-verify`.

Сохранить source-only packaging. Проверить поведение после установки в isolated
target и отсутствие generated `shared-*` файлов в source tree.


 окей, можно добавить третьего co-reviewer. Но только так чтобы не перегружать логику работы основого /verify.
  Не нужно придумывать кучу `if` в `/verify`. Не страшно, если иногда третий co-reviewer запустится не в тему или
  не запустится. Внимание основного /reviewer` не должно распыляться на логику запуска трех `co-reviewers`
 отдельный контракт тоже создавать не надо, лучше переписать `reviewer-code` как скилл для отдельного третьего
  co-reviewer и запускать его тупо под этим скиллом.
