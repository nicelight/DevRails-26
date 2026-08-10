---
description: Conditional rendered-web review guidance for existing verification commands.
status: active
---
# Semantic pack: web-design-reviewer

## Purpose

Strengthen an existing verification when source inspection and ordinary
functional tests cannot settle the applicable quality of a real rendered web
interface. This pack is an internal evidence lens: the calling command retains
its verdict, output, gate, lifecycle, and handoff contracts.

## Applicability boundary

Use only concerns grounded in the accepted outcome, supported user path,
actual change surface, or a directly affected adjacent surface. Do not turn the
review into a site-wide audit, infer new design requirements, or report taste,
style preferences, optional polish, and hypothetical device failures as
defects.

Inspect the rendered interface when the relevant state can be reached safely.
Source inspection, component snapshots, and passing functional tests do not by
themselves prove rendered behavior. If the runtime, route, browser capability,
or safe state setup required for applicable coverage is unavailable, return the
gap through the calling command's existing evidence or blocker semantics.

## Rendered evidence lens

Select only applicable concerns:

- responsive behavior at the product's supported or representative main
  viewports;
- overflow, overlap, clipping, unintended wrapping, and obscured controls;
- reachable loading, error, empty, and success states;
- keyboard navigation, visible focus, focus order, and focus retention;
- accessible names or labels and rendered foreground/background contrast;
- touch targets on applicable touch viewports;
- visual consistency with accepted project tokens and adjacent established
  patterns;
- layout stability during load, interaction, and state transitions;
- visual regressions in directly adjacent or shared surfaces affected by the
  reviewed change.

For every admitted finding, identify the route and state, viewport/device,
reproduction, expected and observed behavior, and redacted evidence. A finding
must show a material usability, accessibility, or accepted-interface defect;
missing optional polish is not a finding.

Use existing project-native browser tooling when available. Playwright CLI may
be used or proposed as a bounded probe, but this pack does not authorize
installing dependencies, mutating external state, or expanding the review
surface. Record evidence only in artifacts already owned by the calling
command; do not create a pack-specific report, status, or verdict.
