# Greenfield Manual + Autopilot Workflow

Эта Mermaid-схема показывает happy path для greenfield проекта: сначала ручная подготовка Memory Bank и JSON task queue, затем выбор между ручным исполнением задач и `/autopilot`.

```mermaid
flowchart TD
  idea["Идея / черновик"] --> brief["/brainstorm или /brief"]
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
  foundationTasks --> foundationDoctor["/mb-doctor --strict<br/>foundation/task-queue"]
  foundationDoctor --> foundationExec["/execute + /verify<br/>FT-000 до final gate done"]
  foundationExec --> tasking["/prd-to-tasks FT-001"]
  foundation -- "нет" --> tasking

  tasking --> reviewTasks["/review-tasks-plan<br/>FT-001<br/>contract readiness"]
  reviewTasks --> doctorNeeded{"T3, autonomous/autopilot handoff,<br/>or complex T2/foundation/dependency/<br/>stale-doc/risky-link?"}
  doctorNeeded -- "да" --> doctor["/mb-doctor<br/>feature/task-queue"]
  doctorNeeded -- "нет" --> mode
  doctor --> mode{"Как выполнять JSON task queue?"}

  mode -- "Manual" --> exec["/execute<br/>TASK-NNN-TN-FT-NNN-WN"]
  exec --> fastLane{"T0/T1 fast-lane?<br/>explicit owner + compact evidence"}
  fastLane -- "да" --> localDone["Task done<br/>compact evidence / no-runnable-check note"]
  fastLane -- "нет / T2-T3 / uncertainty" --> verify["/verify<br/>TASK-NNN-TN-FT-NNN-WN"]
  localDone --> more
  verify --> redTask{"Нужен semantic pass?"}
  redTask -- "T3 task" --> redVerify["/red-verify<br/>TASK-NNN-TN-FT-NNN-WN"]
  redTask -- "T2 feature completion" --> redFeature["/red-verify --feature<br/>FT-NNN"]
  redTask -- "нет" --> sync["/mb-sync<br/>boundary when needed"]
  redVerify --> sync
  redFeature --> sync
  sync --> more{"Еще tasks/features?"}
  more -- "следующая task" --> exec
  more -- "следующая feature" --> tasking
  more -- "нет" --> done["Готово"]

  mode -- "Autopilot" --> autopilot["/autopilot"]
  autopilot --> scheduler["Scheduler loop:<br/>strict readiness -> execute -> verify -> red-verify для T3 -> mb-sync"]
  scheduler --> terminal{"Queue terminal?"}
  terminal -- "done" --> done
  terminal -- "blocked / failed" --> repair["Исправить findings:<br/>task records / specs"]
  repair --> reviewTasks
```
