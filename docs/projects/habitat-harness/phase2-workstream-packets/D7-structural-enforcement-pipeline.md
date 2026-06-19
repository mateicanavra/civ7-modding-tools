# D7 Structural Enforcement Pipeline

## Intent

Refactor structural checking into a pipeline with clear rule selection,
execution, diagnostics, baseline application, report construction, and rendering
without changing public check behavior accidentally.

## Product Scenario

An agent runs `habitat check` or a selector such as `--owner`, `--rule`, or
`--tool` and receives a trustworthy structural report with selector failures,
baseline state, enforced/advisory separation, and explicit non-goals.

## Domain Owner

Structural Enforcement owner.

Forbidden owners:

- Baseline Authority owns baseline state and growth rules.
- Diagnostic Pattern Catalog owns Grit acquisition.
- Rule Registry Metadata owns selector and scope facts.
- Receipt Contract owns receipt labels.

## Consumers

`habitat check`, `habitat verify`, hooks, Nx targets, tests, DRA handoff receipt.

## Contract

Define:

- selector input and selector failure states;
- selected rule set;
- rule execution result;
- normalized diagnostic;
- baseline application result;
- `CheckReport` constructor;
- renderer/stringifier.

## Dependency Order

Blocked by: D1, D2, D5, D6, D10.

Unblocks: D11 and D12.

Parallelism: cannot implement before D5/D6; can be designed while those are in
review if their public contracts are stable.

## Current State-Space Problem

`createCheckReport` in `command-engine.ts` mixes rule selection, rule execution,
Grit/native/wrapped/file-layer execution, baseline load/apply/integrity, status
derivation, report validation, and rendering support. `CheckReport.ok` is a
boolean correlated by convention with rule reports.

## Solution Design

1. Extract pipeline stages by responsibility after D0 preserves public contracts.
2. Use constructors to derive `CheckReport.ok` and rule status from diagnostics
   and lane semantics.
3. Consume baseline and Grit projections rather than reading their internals.
4. Keep selector failures as explicit rule reports with command behavior tests.
5. Preserve human and JSON output truth equivalence.

## TypeScript State-Space Reduction

Replace broad `CheckOptions` optionals with stage-specific inputs:

- selector request,
- execution request,
- baseline request,
- staged check request,
- report render request.

The compiler should prevent staged paths from appearing in non-staged execution
and prevent selector failure reports from being treated as successful rule
execution.

The rejected alternative is "split command-engine.ts by file size." The split
must follow pipeline authority and receipt boundaries.

## Public Surface Impact

`habitat check` behavior should be preserved unless D0/D1 explicitly versions
schema changes. Report field ordering can change only if tests and docs treat it
as non-contractual.

## Receipt Classes

Required design receipt:

- current `CheckReport` field inventory;
- selector scenarios;
- baseline and Grit consumer boundaries.

Later implementation receipt:

- rule selection tests;
- CheckReport schema tests;
- command behavior for clean, failing, advisory, selector failure, staged modes;
- baseline integrity current-tree check;
- injected violation receipt for representative rule paths.

Non-claims:

- check does not prove affected Nx targets.
- check does not prove runtime/product behavior.
- check does not prove apply safety.

## Review Lanes

- Enforcement pipeline review.
- API/JSON compatibility review.
- Baseline consumer review.
- Grit consumer review.
- Receipt/non-goal review.

## Downstream Realignment

Update:

- enforcement compatibility matrix;
- command examples;
- verify packet assumptions;
- hook packet assumptions;
- recovery claim ledger rows that cite check behavior.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/enforcement-surface.test.ts test/lib/rule-selection.test.ts`:
  expected exit 0; command, report-shape, and selector receipt.
- `bun run habitat check --json`: expected exit 0 after current-tree receipt risks
  are fixed or explicitly non-goaled.
- `bun run habitat check --rule workspace-entrypoints --json`: expected exit 0;
  exact single-rule command behavior receipt.
- Cache stance: command receipt must record whether wrapped Nx targets were
  cached and whether current-tree checks ran fresh.
- Injected bad case: include invalid selector JSON and a staged generated-zone
  violation from D10; prove neither can pass as baseline-only receipt.
- Non-claim: this packet does not own baselines, diagnostics, or generated-zone
  policy; it consumes D5, D6, and D10.

## Graphite/OpenSpec Closure

Use OpenSpec for any check schema or command behavior change. Commit as one
pipeline layer or split into facade-preserving sublayers only if each sublayer
is independently green and behavior-preserving.

## Stop Conditions

Stop if:

- `CheckReport.ok` can contradict rule statuses;
- selector failures are indistinguishable from rule failures;
- baseline or Grit internals leak into enforcement stages;
- command behavior changes without D0/D1 compatibility disposition.
