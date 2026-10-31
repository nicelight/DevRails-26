---
description: Conditional rendered-web review guidance for existing verification commands.
status: active
---
# Semantic pack: web-design-reviewer

## Purpose

Provide optional rendered-interface evidence when it adds value beyond source
inspection and ordinary functional tests. The calling command retains its
existing verdict, output, gate, lifecycle, and handoff contracts.

## Activation

Apply `.memory-bank/workflows/autonomy-policy.md`. Use this lens only within
selected verification work. It does not enable a disabled participant or launch
a browser reviewer; DSH host settings and permissions govern assignments.

The pack is available when a running UI, relevant route, browser capability,
and safe test state are already accessible. The verifier may load it when
direct rendered observation would materially strengthen the existing evidence.
Otherwise return to the calling command's selected evidence path; do not create
a mandatory report, synthetic pass, or new gate from this lens.

Select concerns grounded in the accepted outcome, supported user path, actual
change surface, or a directly affected adjacent surface. Findings rely on
direct browser observation and a material usability, accessibility, or
accepted-interface consequence.

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
reproduction, expected and observed behavior, and redacted evidence.

Use existing project-native browser tooling. Playwright CLI is an optional
bounded probe when already available. Tool use follows the calling command's
permissions and safe-state boundary; retain evidence in the caller's selected outputs and actual result, without a
required screenshot/report bundle. Return common structured feedback through
the caller; additional consultation follows the shared decision flow.
