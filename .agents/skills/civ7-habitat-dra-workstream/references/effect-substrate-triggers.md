# Effect Substrate Triggers

## Decision Standard

Consider Effect when current Habitat code needs typed, composable handling for errors, resources, concurrency, retries, cancellation, transactions, environment services, logging, or structured result channels. The decision is not aesthetic. It is justified when handwritten orchestration is already producing false confidence, unsafe cleanup, hidden side effects, or untyped error paths.

Use `docs/projects/habitat-harness/effect-orchestration-evaluation.md` and current official Effect documentation before changing substrate boundaries.

## Strong Triggers

Effect deserves active design consideration when a workstream needs:

- Grit command execution with typed success/failure and stderr/stdout provenance;
- safe write transactions across generated files, baselines, and source edits;
- cleanup that must run after partial failure;
- retry or timeout behavior with structured errors;
- resource acquisition/release around worktrees, temp directories, process handles, or file locks;
- parallel row execution with bounded concurrency and ordered reporting;
- dependency injection for command runners, file systems, clocks, or logger services;
- structured logs that become proof artifacts;
- a single result algebra shared by CLI, tests, hooks, and generated reports.

## Anti-Drift Tests

If the implementation adds another layer of ad hoc promises, thrown strings, untyped result objects, shell-output parsing, cleanup in scattered `finally` blocks, or command-runner mocks that cannot prove current-tree behavior, stop and require a substrate decision.

If a packet already requires an Effect decision, do not build a parallel control layer and label it complete. Either implement the accepted substrate or record the blocker with evidence.

## Documentation Duties

When Effect is adopted or rejected for a packet, record:

- problem class and current failure evidence;
- Effect capability considered;
- accepted design or rejection rationale;
- proof commands;
- downstream records that now rely on the decision.
