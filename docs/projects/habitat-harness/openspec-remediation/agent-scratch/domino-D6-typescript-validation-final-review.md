# D6 TypeScript State-Space And Validation Final Review

## Verdict

D6 is not yet acceptable as a design/specification packet. It has the correct high-level aim, but it still leaves the later implementation agent to invent the TypeScript state model, public compatibility posture, dependency gates, and falsifying validation oracle.

Accept D6 only as a blocked design packet after repair. Do not implement TypeScript source from the current scaffold. Source implementation remains blocked by missing concrete D0 public-surface rows, accepted-but-not-live D1 receipt/non-claim family decisions, and absent live D2 `ruleGritFacts` projections for Grit identity and scan metadata.

## Sources Read

Mandatory skills read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`

Repo and D6 sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- D6 OpenSpec files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/`
- Existing D6 scratch files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/`
- D0/D1/D2 source packets:
  - `D0-scenario-public-contract-inventory.md`
  - `D1-proof-contract-boundary.md`
  - `D2-rule-registry-metadata-contract.md`
- Current Habitat code and tests:
  - `tools/habitat-harness/src/lib/grit.ts`
  - `tools/habitat-harness/src/lib/grit-failures.ts`
  - `tools/habitat-harness/src/lib/grit-injected-probe.ts`
  - `tools/habitat-harness/src/lib/diagnostics.ts`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - `tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
  - `tools/habitat-harness/test/grit/grit-patterns.test.ts`
  - `tools/habitat-harness/test/commands/habitat-commands.test.ts`

## Smell Inventory

1. `ok` plus optional payloads encode too many states. `GritCheckParseResult` and `InjectedGritProbeResult` use `ok` with separately meaningful fields such as `failureTag`, `parseStatus`, `commandResult`, git states, proof class, and diagnostics. D6 should collapse these into discriminated unions whose variants own their fields.

2. Whole-record leakage keeps the state space open. `runGritRules()` and `projectGritResults()` consume whole `HarnessRule` rows and fall back through `rule.gritPattern ?? rule.id`. D6 must design against D2 `ruleGritFacts`, not registry rows.

3. Diagnostic and apply failures share one tag family. `GritAdapterFailureTag` includes D6 diagnostic failures and D9 apply transaction failures. This allows a diagnostic acquisition path to represent states outside its domain.

4. Machine state is hidden in message text. `renderGritAdapterFailure()` formats failure state into diagnostic prose and `findAdapterFailure()` recovers it by regex. D6 must specify structured failure projections, with text rendering only as D0 compatibility output.

5. Scan-root decisions are string returns and option flags. `validateScanRoots()` returns `string | null`, while injected probe allowance, docs-root allowance, test-root expansion, protected roots, generated roots, and missing roots are not closed variant states.

6. Cache/freshness state is spread across options and process results. `cacheMode`, `requireObservableCacheStatus`, and `observableStatus` leave proof/probe freshness as a convention. Injected probes require fresh observable execution by type, not by caller discipline.

7. Probe results overclaim through proof language. `proofClass: "injected-violation"` and "Injected proof" wording can be misread as governance admission, current-tree cleanliness, or apply safety. The D6 target language should be injected diagnostic probe result / validation class.

8. Current tests include real gates but also preserve broad states. `grit-adapter.test.ts` verifies all broad `gritAdapterFailureTags`, including apply tags. That is useful compatibility evidence but not a D6 diagnostic-domain oracle.

## Target State Families

D6 should specify these closed TypeScript model families before any implementation:

- `DiagnosticCatalogEntry`: `grit-diagnostic` and `native-diagnostic` entries that bind `ruleId`, `diagnosticCatalogEntryId`, detector identity, limitations, and projection contract. No governance status, baseline authority, or apply eligibility.
- `DiagnosticRuleGritFacts`: D2-owned projection consumed by D6. Required for `ruleId`, `patternIdentity`, scan metadata, hook eligibility where relevant, and malformed-facet refusal.
- `PatternIdentity`: native Grit identity from `local_name` or `check_id`, with explicit precedence and mismatch handling. Missing identity must be refusal, not fallback to `ruleId`.
- `DiagnosticScanRootDecision`: accepted, expanded-test-files, refused with exact reason, and accepted-injected-probe-root. Refusal reasons must include empty, outside repo, missing, generated output, protected root, unapproved root, and injected probe root without probe mode.
- `NativeGritCheckRequest`: bounded command request with command id, executable, argv, cwd, scan roots, environment subset, cache requirement, and non-claims.
- `GritDiagnosticAcquisition`: tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected shape/truncated output, parsed report.
- `DiagnosticAdapterFailureKind`: D6-only subset: `GritToolUnavailable`, `GritCommandFailed`, `GritNoJson`, `GritMalformedJson`, `GritSchemaDrift`, `GritUnexpectedResultShape`, `GritEmptyScanRoots`, `GritPatternProjectionMiss`, `GritUnexpectedPatternIdentity`, `GritCacheProvenanceMissing`, `GritAdapterInternalContractViolation`. D9 apply tags are forbidden in D6 states.
- `DiagnosticProjection`: native result to Habitat diagnostic mapping with structured adapter-failure projection and no message parsing.
- `DiagnosticRunResult`: clean, findings, adapter-failed, scan-root-refused, cache-provenance-missing, projection-missed, unexpected-pattern-identity.
- `DiagnosticCacheRequirement` and `DiagnosticCacheObservation`: ordinary workspace cache allowed vs fresh required; observed fresh vs workspace unobserved vs missing required provenance.
- `InjectedDiagnosticProbeResult`: probe observed, probe refused, adapter failed, projection missed, control matched, cleanup/final-status failed. Any retained `proofClass` is a compatibility facade, not the target model.
- `DiagnosticConsumerProjection`: narrow DTO for D7/D8/D9/D11/D15 containing identities, outcome kind, diagnostics/failure projection, limitations, freshness decision, and optional probe outcome.

## Task Slicing Recommendations

The repaired packet should slice later implementation like this:

1. Block source edits until D0 rows classify affected command JSON, human output, package exports, test helper exports, proof-shaped names, and exact adapter failure text.
2. Block source edits until D2 publishes live `ruleGritFacts`/projection facts for Grit rules. Do not implement against `HarnessRule` fallback.
3. Define D6 model types in one canonical diagnostic owner module, preserving old exported types only through D0-backed facades.
4. Split the D6 diagnostic adapter failure subset from D9 apply transaction failures.
5. Introduce structured adapter failure projections before changing rendering.
6. Replace parse/acquisition `ok` states with `GritDiagnosticAcquisition`.
7. Replace scan-root string validation with `DiagnosticScanRootDecision`.
8. Replace cache flags with `DiagnosticCacheRequirement` and `DiagnosticCacheObservation`, making injected probes fresh-only.
9. Migrate projection from whole `HarnessRule[]` to D2 `ruleGritFacts`; delete `gritPattern ?? rule.id`.
10. Migrate injected probes to `InjectedDiagnosticProbeResult`; map legacy `proofClass` only at public compatibility boundaries.
11. Add tests one state family at a time. A slice that only moves code without deleting fallback, optional, or boolean states does not satisfy D6.

## Validation Matrix

| Gate | Oracle | Bad case |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts` | Parser/acquisition distinguishes parsed report, no JSON, malformed JSON, command failure, schema drift, unexpected shape, truncated output, projection miss, unexpected identity, scan-root refusal, and cache provenance missing. | `ok: true` with failure fields, malformed wrapper text treated as clean, or apply failure tag accepted as diagnostic state. |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-injected-probe.test.ts` | Probe run requires fresh observable cache, exact matching probe, outside-scope control, cleanup/final-status state, and diagnostic-only validation class. | Control path matching succeeds, missing cache provenance passes, dirty final status is not represented, or proof wording is treated as governance. |
| New D6 diagnostic failure subset test | D6 acquisition/projection/probe states cannot contain `GritApply*` tags. | Any apply tag is accepted by diagnostic acquisition or injected probe failure. |
| New D2 projection integration test | D6 consumes `ruleGritFacts`; missing or malformed Grit identity fails before native command execution. | `gritPattern ?? rule.id` fallback survives. |
| New structured adapter projection test | Adapter failure is structured data first and rendered text second. | `findAdapterFailure()`-style regex over diagnostic messages is required for machine behavior. |
| New scan-root decision test | Every scan-root family has a closed accepted/refused state. | Empty, outside, missing, generated, protected, unapproved, docs, test expansion, and injected mirror roots collapse into generic command failure text. |
| `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts` | Native Grit fixture samples pass and stay distinct from Habitat wrapper/current-tree diagnostic runs. | Native fixture success is claimed as wrapper proof or structural cleanliness. |
| `bun run habitat check --tool grit-check --json` | D0/D1-compatible check JSON shows diagnostic findings/failures without adapter failure becoming structural pass. | Adapter failure yields `ok: true`, or D6 emits new JSON fields without D0 disposition. |
| `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict` and `bun run openspec:validate` | Packet validates and includes scenarios for every D6 state family above. | Spec has only broad "diagnostic runs" / "diagnostic cannot run" scenarios. |
| `git diff --check` and `git status --short --branch` | Formatting is clean; probe tests leave no source-tree residue. | Probe cleanup leaves tracked or untracked files. |

## Findings

### P1: The OpenSpec scaffold does not specify the TypeScript state collapse

`spec.md` has one broad requirement and two scenarios. It does not define the closed state families needed to replace `ok`, option flags, optional fields, raw strings, fallback identities, and broad failure tags.

Repair: add normative requirements and scenarios for every target state family in this review. `design.md` should include the model families, state ownership, rejected alternatives, and D15 trigger posture. `tasks.md` should map implementation slices to those models.

### P1: D0 public compatibility is a hard implementation blocker

D6 can affect `habitat check --tool grit-check --json`, `CheckReport`, `HabitatDiagnostic.message`, package exports from `src/index.ts`, exported Grit adapter/probe types, exact adapter failure text, command request/provenance fields, and proof-shaped names. The current D6 packet only says compatibility is governed by D0; it does not enumerate required row classes.

Repair: add a D0 blocker table to D6 listing every affected surface and accepted handling states: preserve, version, facade, deprecate, refuse, document-only, or generated-only. Until those rows exist, source work stays blocked.

### P1: D6 depends on D2 facts that are absent in current code

Current source still passes whole `HarnessRule` objects and uses `rule.gritPattern ?? rule.id`. D2 says consumers should use projections and that Grit facets should be typed.

Repair: D6 must state live D2 `ruleGritFacts` as an implementation prerequisite. Missing pattern identity is a D2/D6 refusal before Grit execution, never a fallback.

### P1: Diagnostic failures and apply transaction failures are conflated

The current broad `GritAdapterFailureTag` contains D6 diagnostic failures and D9 apply failures. Current adapter tests assert all tags render, which is compatibility coverage, not proof that D6 should own all tags.

Repair: define the closed D6 diagnostic failure subset and explicitly forbid `GritApplyDirtyWorktree`, `GritApplyDryRunMismatch`, `GritApplyUnexpectedFile`, `GritApplyMissingTargetExport`, and `GritApplyRollbackFailed` in D6 acquisition, projection, and probe states.

### P2: Adapter failure parsing from diagnostic text is not an acceptable target model

`findAdapterFailure()` recovers adapter state from rendered message text. This is fragile and prevents downstream consumers from distinguishing findings from infrastructure failure without string parsing.

Repair: require structured adapter failure projection in `DiagnosticRunResult` and `DiagnosticConsumerProjection`. Keep `renderGritAdapterFailure()` only as D0-backed human/legacy JSON compatibility output.

### P2: Scan-root and cache/freshness gates are too broad

Current tests cover many scan-root cases and fresh proof mode, but the packet does not make those closed requirements. `allowInjectedProbeRoot`, `allowDocsRoot`, `requireObservableCacheStatus`, and `cacheMode` are independent flags rather than state-owning variants.

Repair: specify `DiagnosticScanRootDecision`, `DiagnosticCacheRequirement`, and `DiagnosticCacheObservation`, including injected-probe-only mirror roots and fresh-only probe execution.

### P2: Validation commands omit or mis-scope D6 oracles

The scaffold names `test/lib/diagnostics.test.ts`, but that file is absent in this worktree. It also drops `test/lib/grit-injected-probe.test.ts` and `test/grit/grit-patterns.test.ts` from some D6 gates, and uses broad `habitat check --json` rather than the product scenario `habitat check --tool grit-check --json`.

Repair: replace the gate list with the validation matrix above. Keep broad `habitat check --json` as a D7/compatibility smoke only, not D6 semantic proof.

### P2: D6 consumer projections are not specified

D7, D8, D9, D11, and D15 are named consumers, but no DTO says what they receive or what they must not infer.

Repair: define `DiagnosticConsumerProjection`. D7 receives diagnostic run outcomes for report assembly; D8 receives diagnostic capability/result references without admission; D9 receives limitations only and cannot infer apply safety; D11 receives staged local feedback only; D15 receives only a trigger when local DTOs cannot represent provenance.

### P3: `Diagnostic Pattern Catalog` remains a risky name

The slug can stay, but internal target language should prefer `diagnostic catalog entry` or `diagnostic capability catalog`. `pattern catalog entry` is too close to D8 Pattern Authority.

Repair: define "catalog" as diagnostic capability inventory, not governance or apply catalog.

### P3: Target language should retire proof/evidence names in D6

The source packet and code use "native sample proof", "current-tree wrapper proof", "injected-violation proof", and `proofClass`. D1 allows proof-shaped terms only with explicit compatibility handling.

Repair: use `native Grit fixture result`, `current-tree diagnostic run outcome`, `injected diagnostic probe result`, `validationClass`, and `nonClaims`. If `proofClass` remains public, classify it via D0/D1 and project it from target language.

## Exact Repair Recommendations

1. Rewrite `design.md` to include smell diagnosis, target state families, D0/D1/D2 blockers, safe refactor sequence, D15 trigger rule, and rejected alternatives for governance ownership, apply ownership, whole-record leakage, identity fallback, message-parsed failures, and default provenance substrate migration.
2. Expand `specs/habitat-harness/spec.md` into separate SHALL requirements for catalog entry identity, D2 `ruleGritFacts` consumption, scan-root decision, native Grit command request, diagnostic acquisition, adapter failure subset, projection, cache/freshness observation, injected probe result, prohibited inferences, and downstream consumer projection.
3. Replace `tasks.md` placeholders with ordered design/implementation slices and explicit stop lines before source work: D0 rows present, D1 family decisions accepted where command/proof names are touched, and D2 projections live.
4. Update `workstream/phase-record.md` to say D6 is design/specification only, branch/worktree facts match this pass, `test/lib/diagnostics.test.ts` is absent, and validation must use the matrix above.
5. Update `workstream/review-disposition-ledger.md` with this review as blocking until all P1/P2 repairs are dispositioned.
6. Update `workstream/downstream-realignment-ledger.md` with per-consumer contracts for D7, D8, D9, D11, and D15.
7. Update `workstream/closure-checklist.md` so closure requires closed model families, identity mapping, D0 blocker enumeration, D1/D2 dependency gates, and validation oracles with bad cases.
8. Do not authorize TypeScript source implementation from D6 until repaired OpenSpec validation passes and the review ledger has no unresolved accepted P1/P2 findings.

Skills used: domain-design, information-design, solution-design, testing-design, typescript-refactoring.
