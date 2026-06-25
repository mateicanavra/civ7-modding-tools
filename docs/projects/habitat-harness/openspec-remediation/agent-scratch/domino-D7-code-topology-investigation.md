# D7 Code/Topology Investigation

Status: BLOCKING

## Blocking Reason

The current code is traceable enough to describe present `habitat check` behavior, but it does not support a complete D7 implementation packet, write set, and validation matrix yet.

Missing evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/design.md` is still requires the executor to first provide the concrete write set, protected path list, verification gates, and D0 compatibility disposition.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/tasks.md` still has the design intake tasks open, including recording the concrete write set and protected paths.
- D7 says it consumes D0/D1/D2/D3/D5/D6/D10 authority, but the current D6 diagnostic-projection and D10 generated/protected-zone authority are not present as accepted source contracts in code. Current code has present behavior, not the target consumer projection that D7 says it must consume.
- Current report validation checks structural presence and does not enforce `CheckReport.ok`/rule-status consistency, which is one of the D7 packet stop-condition risks.

This report therefore records current topology and a candidate D7 write set, but D7 should remain blocked until the missing authority and validation matrix are made explicit.

## Current `habitat check` Path

`habitat check` enters through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/check.ts`.

The command parses these flags today: `--json`, `--output`, `--owner`, `--rule`, `--tool`, `--staged`, `--expand-baseline`, and `--base`. `--expand-baseline` bypasses report generation and calls baseline expansion. Normal execution calls `createCheckReport`, renders with `renderCheckReport`, logs or writes the result, and exits `0` when `report.ok` is true and `1` otherwise.

`createCheckReport` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts` currently owns the full orchestration:

1. Select rules with `selectRules`.
2. Return a synthetic `rule-selection-integrity` failure report on invalid selectors.
3. Reduce selected rules for staged execution with `rulesForExecution`.
4. Execute selected rules with `executeSelectedRules`.
5. Load and apply baselines per rule.
6. Convert diagnostics and baseline failures into `RuleReport.status`.
7. Append a built-in `baseline-integrity` report.
8. Construct `CheckReport.ok` from `reports.every((report) => report.status !== "fail")`.

Rule execution branches today:

- `grit-check` rules are grouped and executed by `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts`.
- `file-layer` rules are executed by `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/generated-zones.ts`.
- Other native/wrapped rules run through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/architecture.ts`.

Baseline application is in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts`. It mutates matching diagnostics with `baselined: true`, rejects parser-owned baselining for explicit baseline files, returns contract-failure diagnostics, and checks baseline integrity against the base registry.

Human output is rendered by `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/messages.ts`. JSON output is `JSON.stringify(report, null, 2)` after `validateCheckReport`.

Graph/Nx facts exist in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js` and related classify/verify paths. They are not currently consumed by `createCheckReport` when assembling `CheckReport`.

## Current-State Inventory

| Surface | Owner today | Source paths | Side effects | Output fields | Tests |
| --- | --- | --- | --- | --- | --- |
| Check CLI | Oclif command wrapper | `tools/habitat/src/commands/check.ts` | Writes `--output`; exits 0/1; `--expand-baseline` can write baseline files | command flags forwarded into `CheckOptions`; rendered human/JSON output | `tools/habitat/test/commands/habitat-commands.test.ts`; `tools/habitat/test/commands/habitat-entrypoints.test.ts` |
| Report orchestration | `command-engine.ts` | `tools/habitat/src/lib/command-engine.ts` | Runs rule commands; reads baselines; reads git state; invokes Grit/file-layer/native execution | `CheckReport.schemaVersion`, `command`, `startedAt`, `ok`, `rules[]` | `tools/habitat/test/lib/rule-selection.test.ts`; command entrypoint tests |
| Rule selection | `selectRules` and selector failure report | `tools/habitat/src/lib/command-engine.ts`; `tools/habitat/src/rules/architecture.ts`; `tools/habitat/src/rules/rules.json` | No external command on selection failure | selected `HarnessRule[]`, selector failures, synthetic `rule-selection-integrity` report | `tools/habitat/test/lib/rule-selection.test.ts`; `tools/habitat/test/commands/habitat-entrypoints.test.ts` |
| Rule registry metadata | Registry JSON and architecture loader | `tools/habitat/src/rules/rules.json`; `tools/habitat/src/rules/architecture.ts` | None when loaded | `HarnessRule` fields: `id`, `ownerTool`, `ownerProject`, `lane`, `scope`, `forbids`, `why`, `detect`, `remediate`, optional Grit/generated/hook fields | `tools/habitat/test/lib/enforcement-surface.test.ts` |
| Native/wrapped execution | Architecture rule adapter | `tools/habitat/src/rules/architecture.ts` | Spawns `rule.detect` commands from repo root | `RuleRunResult.diagnostics`, duration, coarse or parsed diagnostic messages | `tools/habitat/test/lib/enforcement-surface.test.ts` |
| Grit diagnostics | Grit adapter | `tools/habitat/src/lib/grit.ts`; `tools/habitat/src/lib/grit-failures.ts`; `tools/habitat/src/lib/grit-injected-probe.ts` | Runs `grit`; creates/uses `.grit/cache`; may create temp cache dirs; reads scan roots | Grit diagnostics projected into `HabitatDiagnostic[]`; infrastructure failure diagnostics | `tools/habitat/test/lib/grit-adapter.test.ts`; `tools/habitat/test/lib/grit-injected-probe.test.ts`; `tools/habitat/test/lib/grit-patterns.test.ts` |
| Baseline application | Baseline module | `tools/habitat/src/lib/baseline.ts`; `tools/habitat/baselines/**` | Reads baseline files; reads git base/current registry; `expandBaselines` writes baseline files | diagnostic `baselined` mutation; baseline failure diagnostics; `baseline-integrity` rule report | `tools/habitat/test/lib/baseline.test.ts`; baseline cases in command entrypoint tests |
| Generated/protected file-layer | Generated-zone module | `tools/habitat/src/lib/generated-zones.ts` | Reads real staged paths with `git diff --cached --name-status -z` | file-layer diagnostics for generated zones and forbidden file names | Hook tests exercise staged command behavior; no dedicated generated-zone unit test found |
| Human/JSON rendering | Messages and report validator | `tools/habitat/src/rules/messages.ts`; `tools/habitat/src/lib/diagnostics.ts`; `tools/habitat/src/lib/command-engine.ts` | Writes `--output`; logs to stdout/stderr via command wrapper | human summary/counts/details or serialized `CheckReport` | `tools/habitat/test/lib/rule-selection.test.ts`; `tools/habitat/test/commands/habitat-entrypoints.test.ts` |
| Graph facts | Nx plugin/classify/verify topology | `tools/habitat/src/plugin.js`; `tools/habitat/src/lib/classify.ts`; verify code in `command-engine.ts` | Nx target inference; verify target execution | project targets, owner targets, aggregate targets, verify proof facts | `tools/habitat/test/lib/enforcement-surface.test.ts`; classify/verify command tests |
| Public exports | Package facade | `tools/habitat/src/index.ts` | None | exports `createCheckReport`, `selectRules`, `renderCheckReport`, `stringifyCheckReport`, `CheckReport`, `RuleReport`, `HabitatDiagnostic`, baseline/Grit/rule types | Export changes require D0 compatibility coverage; no dedicated export compatibility test found in this pass |

## Candidate D7 Write Set

This is a candidate write set supported by current topology, not an acceptance-ready D7 write set. It needs D0/D1/D2/D3/D5/D6/D10 authority before implementation.

| Candidate path | Rationale |
| --- | --- |
| `tools/habitat/src/lib/command-engine.ts` | Current `createCheckReport` mixes selector validation, staged rule filtering, execution grouping, baseline application, status derivation, baseline integrity, and report construction. D7's central refactor almost certainly starts here while preserving the public facade. |
| New `tools/habitat/src/lib/check*.ts` or `tools/habitat/src/lib/check/**` modules | D7 needs explicit pipeline boundaries for selection, execution result collection, baseline projection/application, report construction, and rendering/serialization contracts. |
| `tools/habitat/src/lib/diagnostics.ts` | Current `validateCheckReport` is shape-based. D7 likely needs report constructors or invariant validation for `ok`, rule statuses, diagnostics, and selector/baseline failure semantics. Any public shape change requires D0 compatibility disposition. |
| `tools/habitat/src/commands/check.ts` | Edit when command request construction changes. Existing flags and exit behavior are public CLI surface and should stay stable unless D0 says otherwise. |
| `tools/habitat/src/index.ts` | Edit when D7 adds public pipeline exports or replaces existing exported symbols. This is public package surface and requires D0 compatibility coverage. |
| `tools/habitat/test/lib/rule-selection.test.ts` | Existing selector behavior is already pinned here and should remain the first regression surface. |
| `tools/habitat/test/lib/check-pipeline.test.ts` or equivalent new file | Missing focused home for D7 stage and invariant tests. |
| `tools/habitat/test/lib/generated-zones.test.ts` or equivalent new file | D7 needs file-layer/generated-zone validation, but no dedicated unit test exists today. |
| `tools/habitat/test/commands/habitat-entrypoints.test.ts` | Existing JSON/human command behavior and selector/baseline report shape are pinned here. |
| `tools/habitat/test/lib/enforcement-surface.test.ts` | Current owner-tool inventory and graph target inference are pinned here. D7 should avoid changing these without D2/D3 authority. |

## Protected Paths For D7

| Protected path | Rationale |
| --- | --- |
| `tools/habitat/dist/**` | Generated artifact; root AGENTS says generated artifacts are read-only and should be regenerated, not hand-edited. |
| `tools/habitat/baselines/**` | D5 baseline authority. D7 should consume baseline state/application results, not rewrite baseline data except through existing baseline-expansion behavior when explicitly requested. |
| `tools/habitat/src/rules/rules.json` | D2 registry metadata authority. D7 should consume registry facts, not redefine registry schema or rule ownership. |
| `.grit/**` and `.grit/patterns/**` | D6/D8/D9-adjacent diagnostic/pattern authority. D7 should consume diagnostic projections rather than authoring Grit rules or pattern files. |
| `tools/habitat/src/lib/grit.ts`, `tools/habitat/src/lib/grit-failures.ts`, `tools/habitat/src/lib/grit-injected-probe.ts` | Current Grit acquisition/projection internals. D7 should not redefine diagnostic catalog behavior unless D6 exposes the needed consumer surface. |
| `tools/habitat/src/lib/baseline.ts` | D5-owned baseline semantics. D7 can call a stable projection/application API, but should not move baseline authority into the enforcement pipeline. |
| `tools/habitat/src/lib/generated-zones.ts` | D10-owned generated/protected-zone semantics. Current behavior can be documented, but D7 should not hard-code new protected-zone authority before D10 is accepted. |
| `tools/habitat/src/plugin.js` | D3 graph/Nx topology. D7 may consume graph facts if a contract exists, but should not change plugin target topology as part of pipeline separation. |
| Root package scripts, Nx config, public exports | D0 public compatibility surfaces. Any change needs explicit compatibility-matrix disposition. |
| Lockfiles and generated mod/resource outputs | Repo policy treats lockfiles/generated outputs as protected from hand edits. |

## Current False-Green And Ambiguity Paths

### Report invariant weakness

`$HABITAT_TOOL/src/lib/diagnostics.ts` validates structural report fields but not semantic consistency. It checks that `schemaVersion` is `1`, `command` and `startedAt` are strings, `ok` is boolean, `rules` is an array, and each rule has basic `ruleId`, `status`, and `diagnostics` shape.

It does not validate:

- `report.ok === report.rules.every((rule) => rule.status !== "fail")`.
- Advisory lanes cannot produce enforced failures by accident.
- Enforced lanes with unbaselined error diagnostics must fail.
- Baseline failure diagnostics must fail the rule/report.
- `RuleReport` fields such as `ownerTool`, `lane`, `locked`, `durationMs`, `detect`, `message`, and `remediate`.

`createCheckReport` currently computes `RuleReport.status` and `CheckReport.ok` in the same function, but no constructor or validator prevents future contradictions.

### Grit pattern projection can ignore unexpected native output

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts` projects findings with `rule.gritPattern ?? rule.id` and only rejects unexpected `patternIdentity` when `rejectUnexpectedPatternIdentity` is explicitly requested.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/grit-adapter.test.ts` pins the current permissive behavior: findings outside the selected pattern set are ignored by default. This can be false-green for D7/D6 target semantics if all native Grit output is unexpected or if a rule is missing explicit pattern identity.

### Generated-zone checks are staged-mode and internally source staged paths

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/generated-zones.ts` returns pass with no diagnostics when `context.staged` is false. It reads staged files internally through `git diff --cached --name-status -z`.

`CheckOptions.stagedPaths` affects staged Grit scan roots but does not inject file-layer staged paths, because non-Grit execution only receives `{ staged }`. That makes file-layer behavior harder to test and leaves D7 without a clean stage input model for generated/protected-zone decisions.

No dedicated generated-zone unit test was found in this pass.

### Baseline authority leaks into orchestration

`createCheckReport` directly calls `loadBaselineState`, `applyBaseline`, `isBaselineLocked`, `baselineFailureDiagnostic`, and `checkBaselineIntegrity`. This works today, but D7's stated direction is a pipeline that consumes baseline authority rather than recomputing or owning it. Current topology does not yet expose a D5-shaped projection boundary for D7 to consume.

### Grit acquisition/projection leaks into orchestration

`executeSelectedRules` in `command-engine.ts` directly groups Grit rules, computes staged scan roots, and calls `runGritRules`. D7 wants a structural pipeline over diagnostic outcomes, but the current code consumes Grit internals rather than a D6 diagnostic run outcome.

### Graph facts are not part of `habitat check`

`tools/habitat/src/plugin.js` defines aggregate targets, owner targets, rule alias targets, and generated-zone targets, and tests pin parts of that topology. `createCheckReport` does not consume graph facts while constructing a report. If D7's target behavior claims graph facts participate in structural enforcement, the consumer contract is missing.

### Verify summary loses selector request facts

`summarizeVerifyCheckReport` in `command-engine.ts` sets `requestedSelectors: {}` unconditionally. This is not necessarily D7-owned, but it is an adjacent ambiguity for verification proof consumers that need to know what selector context produced a check report.

### Current-tree check is not uniformly green

A direct command probe in this worktree showed:

- `bun run habitat:check -- --json --rule definitely-not-a-rule` exits `1` with a synthetic `rule-selection-integrity` failure report.
- `bun run habitat:check -- --json --rule workspace-entrypoints` exits `1` because `mods/mod-swooper-maps/package.json` currently has a package-local script violation for `migrate:configs`.
- `bun run habitat:check -- --staged --json --tool file-layer` exits `0` with four file-layer pass reports plus `baseline-integrity`.

D7 validation gates that assume broad `habitat check --json` is green need a current-tree failure disposition.

## Existing Tests Relevant To D7

| Test path | Current coverage |
| --- | --- |
| `tools/habitat/test/commands/habitat-commands.test.ts` | Flag forwarding into `createCheckReport`; `renderCheckReport` options; `--expand-baseline`; verify command invocation shape. |
| `tools/habitat/test/commands/habitat-entrypoints.test.ts` | CLI help; invalid selector JSON/human output; selector failure report shape; baseline contract failure reports; invalid baseline expansion selectors. |
| `tools/habitat/test/lib/rule-selection.test.ts` | Owner/rule/tool selector behavior; wrong namespace; unknown selector; empty intersection; selector failure render; staged Grit filtering. |
| `tools/habitat/test/lib/enforcement-surface.test.ts` | Owner-tool inventory; root structural script policy; wrapper dispositions; direct wrapped-script parser policy; plugin target inference. |
| `tools/habitat/test/lib/baseline.test.ts` | Explicit-empty/debt baselines; missing/malformed/duplicate/unsorted/orphan baselines; external exception mismatch; parser-owned baseline bypass rejection; baseline growth refusal. |
| `tools/habitat/test/lib/grit-adapter.test.ts` | Grit JSON/text parsing; infrastructure failure projection; selected-pattern projection; permissive unexpected-pattern default; strict proof modes; scan-root refusals; command request construction; docs apply dry-run. |
| `tools/habitat/test/lib/hooks.test.ts` | Pre-commit staged file-layer command; file-layer failure blocks; staged Grit command behavior; parse/finding failures fail closed. |
| `tools/habitat/test/lib/grit-injected-probe.test.ts` and `tools/habitat/test/lib/grit-patterns.test.ts` | Grit probe/pattern-adjacent behavior relevant to D6 inputs consumed by D7. |

## Missing Tests For D7 Validation

- A report-construction invariant test that proves `CheckReport.ok`, rule statuses, lanes, diagnostics, and baseline failures cannot contradict each other.
- Focused pipeline-stage tests for selection, execution outcome collection, baseline projection/application, report construction, and rendering.
- JSON compatibility tests for the complete `CheckReport` shape, not only structural presence fields.
- Human/JSON equivalence tests for clean, failing, advisory, baselined, selector-failure, and baseline-integrity cases.
- End-to-end tests for mixed `--owner`, `--rule`, `--tool`, and `--staged` selectors with explicit baseline-integrity inclusion/exclusion expectations.
- A generated-zone unit test suite covering staged generated paths, non-staged non-claim/pass behavior, unknown generated-zone metadata, forbidden pnpm filenames, and injectable staged path inputs.
- A Grit projection test at `createCheckReport` level proving unexpected pattern identity and missing `gritPattern` behavior under D6 target semantics.
- A graph-fact test or explicit non-claim test: either `habitat check` consumes graph facts through a stable projection, or D7 must say graph facts are outside current check report construction.
- A public export compatibility test if D7 adds or changes exported pipeline/report types.

## D7 Stop Condition Disposition

The D7 source packet says to stop if the topology does not support a complete packet write set and validation matrix. That stop condition is met.

The current source topology can support a careful refactor of present behavior, but D7's target dependencies are not acceptance-ready:

- Baseline behavior is present but still consumed through D5 internals.
- Grit behavior is present but still consumed through D6 internals, and current projection has known permissive paths.
- Generated/protected-zone behavior is present but staged-mode, internally sourced, and not backed by D10 target authority or dedicated tests.
- Graph facts exist but are not part of `habitat check` report construction.
- Report invariants are conventionally maintained in `createCheckReport`, not enforced by the report schema or constructors.

D7 should remain BLOCKING until the phase record supplies the concrete accepted write set, protected paths, D0 compatibility disposition, D6 diagnostic projection contract, D10 generated/protected-zone contract, and the validation matrix above.
