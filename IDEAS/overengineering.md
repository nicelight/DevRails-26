# Проблема
 В целом я вижу основную проблему, в runtime ты(агент) сильно скатываешься в enterprise level engineering и в какой то степени это нормально но не для меня. Поэтому нам надо
  понять какие правила для тебя придумать чтобы ты старался придерживаться KISS и ни при каких обстоятельствах не позволял себе overengineering если я не дал
  тебе прямых инструкций сделать что то , что будет overengineer.
   Вижу 2 проблемы:
  Первая проблема не такая уж серьезная: ты склонен скатываться в то чтобы создавать более сложный код чем указано в требованиях, условиях, спецификациях.
  Вторая проблема куда серьезнее: при обсуждении проекта ты склонен создавать overengineering спецификации, требования условия либо же при ревью моих
  предложений, включающих в себя overengineering ты с радостью их проглатываешь, критически не размышляя.

## Нужда 
  
  Мое главное требование: мы не должны проектировать системы в которых будут дорогие по реализации решения  ради закрытия малозначимых, не существенных
  потенциальных проблем. Лучше СПРОЕКТИРОВАТЬ и сделать более простой продукт, не увеличивать комплексность, чем пытаться закрыть все потенциальные проблемы.
  Во время анализа и внутренних размышлений нейронной сети (агента) каждая, выявляемаяя агентом, потенциальная проблема должна быть **глубже проанализирована** и взвешена на серьезность и
  на сложность реализации ее устранения, и если проблема выглядит серьезной, то должна быть сформулирована простыми словами в запросе к  оператору: пытаться
  ли закрыть эту пороблему или нет, с коротким пояснением как дорого будет стоить закрытие проблемы.
  
  
  
# предлагаемый вариант решения 

## стратегия решения 
 вариант: отдельный ROLE: ARCHITECT получает полный complexity protocol, а основной агент — только короткие предохранители и правило маршрутизации.

  
## правила для основного runtime файла AGENTS.md 
 
 ```md
 ## KISS / Complexity and Requirement Gate

  - Use the simplest implementation that satisfies current accepted requirements.
  - A discovered risk, edge case or possible failure is not automatically a new
    requirement.
  - Do not expand requirements, specifications or implementation scope merely to
    prevent a theoretically possible problem.

  Before promoting a problem into a requirement or design decision, perform a
  brief internal assessment:

  - verify that the scenario is realistic in the current deployment;
  - estimate its likelihood, consequence and recoverability;
  - check whether restart, retry, re-upload, manual rerun or maintenance is enough;
  - compare the expected problem cost with implementation, testing, operational
    and maintenance cost of the remedy.

  Decision rule:

  - remedy cost materially exceeds expected problem cost:
    accept or defer the risk and do not generate a requirement;
  - problem is covered by an accepted requirement:
    implement the cheapest sufficient remedy;
  - serious problem is not covered by an accepted requirement:
    do not expand the target; route it to ROLE: ARCHITECT or ask the operator;
  - small local safeguard with negligible cost and no new state/lifecycle:
    implementation discretion is allowed.

  An accepted requirement authorizes the required outcome, not an unnecessarily
  complex mechanism.

  Agent-generated reviews, specifications, brainstorm results and best-practice
  recommendations cannot authorize their own complexity.

  Architecture, specification or review candidates that introduce material
  complexity are routed to ROLE: ARCHITECT. Minor rejected candidates are not
  reported or escalated.
```
