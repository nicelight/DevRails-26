# Greenfield Manual + Autopilot Workflow

Эта Mermaid-схема показывает happy path для greenfield проекта: сначала ручная подготовка Memory Bank и JSON task queue, затем выбор между ручным исполнением задач и `/autopilot`.

```mermaid
flowchart TD
  idea["Идея / черновик"] --> brief["/analysis или /brief"]
  brief --> constitution["/constitution"]
  constitution --> writePrd["/write-prd"]
  writePrd --> specInit["/spec-init"]
  specInit --> prd["/prd"]
  prd --> reviewFeat{"High-risk / large work?"}
  reviewFeat -- "да" --> reviewFeatPlan["/review-feat-plan"]
  reviewFeat -- "нет" --> specDesign["/spec-design"]
  reviewFeatPlan --> specDesign

  specDesign --> foundation{"Нужен executable baseline?"}
  foundation -- "да" --> foundationTasks["/foundation-to-tasks"]
  foundationTasks --> foundationDoctor["/mb-doctor<br/>foundation/task-queue"]
  foundationDoctor --> foundationExec["/execute + /verify<br/>FT-000 до final gate done"]
  foundationExec --> tasking["/prd-to-tasks FT-001"]
  foundation -- "нет" --> tasking

  tasking --> reviewTasks["/review-tasks-plan"]
  reviewTasks --> doctor["/mb-doctor<br/>feature/task-queue"]
  doctor --> mode{"Как выполнять JSON task queue?"}

  mode -- "Manual" --> exec["/execute<br/>TASK-NNN-FT-NNN-W-N"]
  exec --> verify["/verify<br/>TASK-NNN-FT-NNN-W-N"]
  verify --> redTask{"Нужен semantic pass?"}
  redTask -- "T3 task" --> redVerify["/red-verify<br/>TASK-NNN-FT-NNN-W-N"]
  redTask -- "T2 feature completion" --> redFeature["/red-verify --feature<br/>FT-NNN"]
  redTask -- "нет" --> sync["/mb-sync"]
  redVerify --> sync
  redFeature --> sync
  sync --> more{"Еще tasks/features?"}
  more -- "следующая task" --> exec
  more -- "следующая feature" --> tasking
  more -- "нет" --> done["Готово"]

  mode -- "Autopilot" --> autopilot["/autopilot"]
  autopilot --> scheduler["Scheduler loop:<br/>packet gate -> execute -> verify -> red-verify для T3 -> mb-sync"]
  scheduler --> terminal{"Queue terminal?"}
  terminal -- "done" --> done
  terminal -- "blocked / failed" --> repair["Исправить findings:<br/>task records / packets / specs"]
  repair --> reviewTasks
```
