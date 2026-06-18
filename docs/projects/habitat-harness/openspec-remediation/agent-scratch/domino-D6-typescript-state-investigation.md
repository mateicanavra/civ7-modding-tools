# D6 TypeScript State-Space Investigation

## Verdict

Current D6 is **not acceptable for design/specification**. The source domino packet points in the right direction, but the OpenSpec scaffold still leaves the concrete state model, public type compatibility handling, and validation oracle to the implementation agent.

D6 can become acceptable without source implementation if the packet is repaired to specify the closed diagnostic catalog model, Grit-only diagnostic adapter failure subset, explicit scan-root/cache/probe states, D0 compatibility blockers, and D1/D2 dependency gates below.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/GRAPHITE.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- D6 OpenSpec scaffold under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/`
- D0, D1, and D2 OpenSpec packets and ledgers where D6 depends on public compatibility, command-record vocabulary, and rule metadata projections.
- Code grounding set:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-failures.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-injected-probe.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/habitat-process.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-injected-probe.test.ts`

## Current Smell Inventory

### 1. Boolean success flags and optional result fields

`GritCheckParseResult` in `grit.ts` is an `ok: true | false` union, but the failure side still has optional `commandResult`, broad `failureTag`, and parse status that are not state-owned. `InjectedGritProbeResult` repeats the same pattern with `ok`, optional git states, and probe success fields.

State-space cost: consumers must remember which fields are meaningful for each `ok` value. This admits accidental states such as "failure with no command projection" and "success shaped like proof output rather than diagnostic probe result".

Target move: replace boolean result flags with discriminated unions keyed by workflow state, for example `kind: "diagnostics-found" | "diagnostics-clean" | "adapter-failed" | "scan-root-refused" | "cache-provenance-missing"`.

### 2. Broad optional DTOs and whole-record leakage

`GritResult`, `GritReport`, `HabitatProcessRequest`, `CommandCachePolicy`, and `HabitatCommandResult` are broad transport records. D6 consumers should not receive whole process records, raw Grit result records, or whole D2 registry records.

Current examples:

- `GritCheckParseResult` carries full `HabitatCommandResult`.
- `projectGritResults()` consumes `HarnessRule` instead of a D2 `ruleGritFacts` projection.
- `runGritRules()` receives whole `HarnessRule[]` and uses `rule.gritPattern ?? rule.id`.
- injected probe validation reads `rules`, `ruleById`, raw `gritPattern`, and whole `HarnessRule`.

State-space cost: the diagnostic catalog becomes coupled to execution process details, command capture, registry metadata, reporting text, and governance/apply fields.

Target move: introduce typed projections:

- `DiagnosticCommandObservation`: command id, adapter kind, bounded output status, exit state, parse source, cache observation, and non-claims only.
- `DiagnosticRuleGritFacts`: rule id, pattern identity, scan metadata, exclusions, hook eligibility if needed, and D2 source citation.
- `DiagnosticFindingProjection`: rule id, pattern identity, path, optional line, message, severity, and baseline state only.

No D6 consumer should receive `HabitatCommandResult`, `HarnessRule`, `RuleRegistryRecord`, or raw `GritReport` unless the packet records a named exception with a smaller-state rationale.

### 3. Mixed failure vocabularies

`grit-failures.ts` defines one `GritAdapterFailureTag` set that mixes diagnostic acquisition failures with apply transaction failures:

- diagnostic adapter failures: `GritToolUnavailable`, `GritCommandFailed`, `GritNoJson`, `GritMalformedJson`, `GritSchemaDrift`, `GritUnexpectedResultShape`, `GritEmptyScanRoots`, `GritPatternProjectionMiss`, `GritUnexpectedPatternIdentity`, `GritCacheProvenanceMissing`, `GritAdapterInternalContractViolation`
- apply failures: `GritApplyDirtyWorktree`, `GritApplyDryRunMismatch`, `GritApplyUnexpectedFile`, `GritApplyMissingTargetExport`, `GritApplyRollbackFailed`

State-space cost: diagnostic code can technically emit apply failure tags, and tests currently require every accepted adapter tag to render through the same formatter.

Target move: D6 must define a closed `DiagnosticAdapterFailureKind` subset and forbid apply tags from diagnostic acquisition, parse, projection, and injected probe states. D9 owns apply failure tags.

### 4. Unbounded failure tags as string protocol

Adapter failure state is projected into diagnostic messages by `renderGritAdapterFailure()` and recovered in `findAdapterFailure()` through regex over message text.

State-space cost: machine state is hidden inside human text, so diagnostic consumers can parse stale strings, miss changed formatting, or confuse a real finding with adapter failure prose.

Target move: adapter failure must be a structured diagnostic projection variant, not a message convention. If D0 requires the current rendered text for compatibility, D6 must keep it as a compatibility projection generated from structured state, never as source authority.

### 5. Cache ambiguity

`GritCheckCacheMode = "workspace" | "fresh"` and `observableCacheStatus = "unknown" | "fresh" | "cache-hit" | "replay"` are not modeled as consumer-specific states. Current code can request observable cache status and then fail with `GritCacheProvenanceMissing`, but the state lives across options, process result, parse result, and diagnostics.

State-space cost: implementation can choose whether "unknown" is acceptable at call sites. The source packet says injected probes must run fresh; current scaffold does not make that a normative type contract.

Target move: closed cache policy:

```ts
type DiagnosticCacheRequirement =
  | { kind: "workspace-cache-allowed"; observable: false }
  | { kind: "fresh-required"; observable: true; cacheDir: "scoped-temp" };

type DiagnosticCacheObservation =
  | { kind: "fresh"; cacheDir: string }
  | { kind: "workspace-unobserved"; allowedBy: "ordinary-current-tree-diagnostic" }
  | { kind: "missing-required-provenance"; failure: "GritCacheProvenanceMissing" };
```

Injected probes and any proof-class validation path must require `fresh-required`. Ordinary current-tree diagnostics may use `workspace-cache-allowed`, but that must be an explicit consumer contract, not a fallback default.

### 6. Scan-root ambiguity

`validateScanRoots()` returns `string | null`, and `effectiveGritScanRoots()` expands ignored test directory roots to exact files. Probe mirror roots are allowed by an option flag. The target states are hidden in booleans and string messages.

State-space cost: implementation can conflate empty roots, missing roots, generated roots, protected roots, unapproved roots, and injected-probe roots as one generic command failure.

Target move:

```ts
type DiagnosticScanRootDecision =
  | { kind: "accepted"; roots: readonly DiagnosticScanRoot[]; source: "d2-rule-grit-facts" | "caller-override-for-test" }
  | { kind: "expanded-test-files"; requestedRoots: readonly string[]; effectiveRoots: readonly DiagnosticScanRoot[] }
  | { kind: "refused"; reason: "empty" | "outside-repo" | "missing" | "generated-output" | "protected-root" | "not-approved"; root?: string }
  | { kind: "accepted-injected-probe-root"; roots: readonly DiagnosticScanRoot[]; probeOnly: true };
```

No D6 implementation may return raw strings from scan-root validation as the authoritative state.

### 7. Probe result ambiguity and proof/evidence language

`InjectedGritProbeResult` includes `proofClass: "injected-violation"` and broad `nonClaims`; failures use the same broad Grit adapter tag union; success returns all diagnostics. D1 classifies proof-shaped names as compatibility facts unless target-retained, and D6 has not yet done that classification.

State-space cost: injected probe can be read as Pattern Authority proof, apply safety, or full structural cleanliness. It is only a diagnostic adapter validation.

Target move:

```ts
type InjectedDiagnosticProbeResult =
  | {
      kind: "probe-diagnostic-observed";
      ruleId: string;
      patternIdentity: string;
      matchingProbe: DiagnosticProbePath;
      outsideScopeControl: DiagnosticProbePath;
      observedFinding: DiagnosticFindingProjection;
      cleanup: "restored" | "dirty-refused";
      validationClass: "injected-violation-diagnostic";
      nonClaims: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "probe-refused" | "probe-adapter-failed" | "probe-projection-missed" | "probe-control-matched" | "probe-cleanup-failed";
      failure: DiagnosticAdapterFailure | DiagnosticProbeFailure;
      beforeGitState?: HabitatGitState;
      afterGitState?: HabitatGitState;
    };
```

If `proofClass` remains in exported or command-visible types, D6 must classify it through D0 and D1 as a compatibility wrapper. It must not be target D6 language.

### 8. Adapter/apply conflation

The shared failure module and non-claims include apply transaction concepts inside Grit diagnostic code. D6 must not own apply safety, dirty worktree live apply refusal, dry-run mismatch, rollback, formatter handoff, or changed path semantics.

Target move: D6 owns diagnostic acquisition and projection only. D9 owns Grit apply transaction states. Shared command execution primitives may be consumed only as projections; if D6 cannot model command provenance locally without editing shared substrate, D15 must be explicitly triggered.

### 9. Proof/evidence-oriented code smells

Current names and test language include `proofClass`, "injected proof", "native sample proof", "current-tree wrapper proof", and "proof paths". D1 permits proof-shaped terms only as compatibility facts unless a concrete invariant requires target retention.

Target move: D6 packet language should use `validation class`, `diagnostic sample`, `current-tree diagnostic run`, `injected diagnostic probe`, `adapter command observation`, and `non-claim`. Keep "proof" only when citing legacy compatibility rows or historical source packet text.

## Target State Models

### Diagnostic catalog ownership

Diagnostic Pattern Catalog owns:

- diagnostic detector identity and limitations;
- Grit/native diagnostic acquisition states;
- scan-root acceptance/refusal states;
- diagnostic adapter parse/projection states;
- current-tree diagnostic projection;
- injected diagnostic probe validation;
- D6-specific non-claims and validation classes.

Forbidden owners:

- D8 Pattern Governance owns rule admission and lifecycle.
- D9 Transformation Transaction owns apply/fix writes, dry-run/live apply, rollback, dirty-worktree apply refusal, and apply failure tags.
- D7 Structural Enforcement owns final check/report assembly and enforcement pipeline interpretation.
- D1 owns command-record families and canonical non-claim vocabulary.
- D2 owns registry metadata projections such as `ruleGritFacts`, not D6.

### Catalog entry model

```ts
type DiagnosticCatalogEntry =
  | {
      kind: "grit-diagnostic";
      ruleId: string;
      detectorId: string;
      patternIdentity: string;
      patternSource: "d2-rule-grit-facts";
      scanContract: DiagnosticScanContract;
      projectionContract: DiagnosticProjectionContract;
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "native-diagnostic";
      ruleId: string;
      detectorId: string;
      acquisitionContract: NativeDiagnosticAcquisitionContract;
      projectionContract: DiagnosticProjectionContract;
      limitations: readonly DiagnosticNonClaim[];
    };
```

D6 should not define governance status, baseline authority, or apply eligibility on catalog entries. If a later consumer needs those, it consumes D5, D8, or D9 separately.

### Grit diagnostic acquisition model

```ts
type GritDiagnosticAcquisition =
  | { kind: "tool-unavailable"; failure: DiagnosticAdapterFailure }
  | { kind: "command-failed"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailure }
  | { kind: "no-json"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailure }
  | { kind: "malformed-json"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailure }
  | { kind: "schema-drift"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailure }
  | { kind: "unsupported-output"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailure }
  | { kind: "parsed"; command: DiagnosticCommandObservation; report: ParsedGritDiagnosticReport };
```

This replaces `ok`, `parseStatus`, and optional `commandResult` as separate state axes. `parseStatus` may remain only as a D0-compatible projection field if a public JSON or export row requires it.

### Diagnostic run result model

```ts
type DiagnosticRunResult =
  | { kind: "clean"; catalogEntry: DiagnosticCatalogEntry; diagnostics: readonly [] }
  | { kind: "findings"; catalogEntry: DiagnosticCatalogEntry; diagnostics: readonly DiagnosticFindingProjection[] }
  | { kind: "adapter-failed"; catalogEntry: DiagnosticCatalogEntry; failure: DiagnosticAdapterFailureProjection }
  | { kind: "scan-root-refused"; catalogEntry: DiagnosticCatalogEntry; decision: Extract<DiagnosticScanRootDecision, { kind: "refused" }> }
  | { kind: "cache-provenance-missing"; catalogEntry: DiagnosticCatalogEntry; observation: Extract<DiagnosticCacheObservation, { kind: "missing-required-provenance" }> }
  | { kind: "projection-missed"; catalogEntry: DiagnosticCatalogEntry; expectedPatternIdentity: string }
  | { kind: "unexpected-pattern-identity"; catalogEntry: DiagnosticCatalogEntry; unexpectedPatternIdentity: string };
```

`clean` and `adapter-failed` must be disjoint. A command failure cannot be projected as a structural pass.

### Diagnostic adapter failure subset

```ts
type DiagnosticAdapterFailureKind =
  | "GritToolUnavailable"
  | "GritCommandFailed"
  | "GritNoJson"
  | "GritMalformedJson"
  | "GritSchemaDrift"
  | "GritUnexpectedResultShape"
  | "GritEmptyScanRoots"
  | "GritPatternProjectionMiss"
  | "GritUnexpectedPatternIdentity"
  | "GritCacheProvenanceMissing"
  | "GritAdapterInternalContractViolation";
```

Explicitly forbidden in D6: `GritApplyDirtyWorktree`, `GritApplyDryRunMismatch`, `GritApplyUnexpectedFile`, `GritApplyMissingTargetExport`, and `GritApplyRollbackFailed`.

### Consumer contracts

Required D6 consumer projections:

| Consumer | Receives | Must not receive |
| --- | --- | --- |
| D7 Structural Enforcement | `DiagnosticRunResult`, normalized findings, adapter failure projections | raw `GritReport`, full `HabitatCommandResult`, apply failure tags |
| D8 Pattern Governance | diagnostic sample/validation status and limitations | admission decision, apply safety, baseline authority |
| D9 Transformation Transaction | diagnostic catalog identity and limitation facts only | governance admission, apply validation result, diagnostic command process records |
| D11 Local Feedback | hook-eligible diagnostic projection after D2/D11 facts | D6-owned hook behavior |
| tests/DRA matrices | validation class, bad case, command/cache stance, non-claims | proof/evidence product terms unless D0/D1 compatibility row requires them |

## Safe Refactor Sequence For Later Implementation

No source implementation is authorized by this investigation. If D6 is repaired and later implemented, the safe sequence should be:

1. Block on D0 rows and live D2 facts. Do not edit source until D0 matrix rows exist for every affected command JSON, package export, human-output message, docs example, and test-facing public surface, and until D2 has live `ruleGritFacts`/projection implementation for Grit rules.
2. Introduce D6-owned diagnostic model types in a new canonical owner module. Keep compatibility facades for current exported names only where D0 rows require `preserve`, `version`, or `facade`.
3. Split diagnostic adapter failure subset from apply transaction failure tags. Keep the old broad `GritAdapterFailureTag` only behind compatibility wrappers if D0 classifies it as exported/public.
4. Add structured adapter failure projection before changing rendering. `renderGritAdapterFailure()` becomes a renderer from structured state, not a parser source.
5. Replace `GritCheckParseResult` `ok` union with `GritDiagnosticAcquisition`. Delete `parseStatus`/`failureTag` cross-product states from internal core; preserve public projection fields only if D0 requires them.
6. Replace scan-root `string | null` validation with `DiagnosticScanRootDecision`. Keep current message text as renderer output only.
7. Replace cache options with `DiagnosticCacheRequirement` and `DiagnosticCacheObservation`. Make injected probes fresh-only by type.
8. Migrate `runGritRules()` and `projectGritResults()` from `HarnessRule[]` to D2 `ruleGritFacts`/report projections. Delete `rule.gritPattern ?? rule.id`; missing pattern identity is a D2/D6 contract failure, never fallback.
9. Migrate `grit-injected-probe.ts` to `InjectedDiagnosticProbeResult` and remove target proof language. If public compatibility requires `proofClass`, map it from `validationClass` at the boundary.
10. Update tests one behavior family at a time: parser/acquisition, scan-root decisions, cache provenance, projection identity, injected probe success/failure, and compatibility renderers.
11. Delete compatibility-only paths that D0/D1/D2 mark removable. Do not leave dual target paths or fallback defaults.

Every slice must keep TypeScript and focused tests green before the next slice. A slice that only moves code without deleting boolean/optional/fallback states does not satisfy D6.

## Public Type Compatibility Blockers

D0 matrix file is currently missing at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/public-surface-compatibility-matrix.md`. Therefore D6 source implementation is blocked.

D6 packet must require concrete D0 rows for at least:

- `GritCheckParseResult`, `GritReport`, `GritResult`, `GritCheckOptions`, `GritCheckRequestOptions`, `GritProjectionOptions`, `GritCheckCacheMode`, `GritScanRootValidationOptions`, and exported functions in `tools/habitat-harness/src/lib/grit.ts`.
- `GritAdapterFailureTag`, `GritAdapterFailure`, `createGritAdapterFailure`, `isGritAdapterFailureTag`, and `renderGritAdapterFailure` in `tools/habitat-harness/src/lib/grit-failures.ts`.
- `InjectedGritProbeInput`, `InjectedGritProbeResult`, `InjectedGritProbeFailure`, `InjectedProbeScope`, and `runInjectedGritProbe` in `tools/habitat-harness/src/lib/grit-injected-probe.ts`.
- `HabitatCommandResult`, `HabitatProcessRequest`, `GritParseStatus`, `CommandCachePolicy`, and `HabitatCommandKind` only to the extent D6 changes their package-export or command-JSON meaning.
- `habitat check --json` command JSON fields that expose diagnostics, adapter failure text, parse status, rule status, `ok`, and non-claims.
- human output lines containing `--- grit adapter failure (...) ---` if any docs/tests/users rely on exact wording.
- docs/examples and tests that use proof-shaped names such as `proofClass` or "injected proof".

Closed handling allowed through D0 only: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`. D6 must not use "internal", "no change", "later", "compat TBD", or "downstream-owned" as compatibility handling.

## D1 And D2 Dependency Blockers

D1 is accepted for design/specification only and is not implementation-complete. D6 may consume D1 target vocabulary in design, but source changes that alter command output, command JSON, proof-shaped fields, non-claims, adapter artifacts, or diagnostics must wait for concrete D0 rows and D1 family decisions.

D2 is accepted for design/specification only and is not implementation-complete. D6 must consume:

- `ruleGritFacts` for pattern identity, scan metadata, exclusions, hook eligibility, and manifest reference if present;
- D2 malformed metadata output families for missing pattern identity or contradicted Grit facts;
- D2 prohibition on whole-row `HarnessRule` leakage.

Current code does not yet provide live D2 `ruleGritFacts`; it still passes `HarnessRule` and falls back from missing `gritPattern` to `rule.id`. D6 implementation must remain blocked until D2 implementation facts exist or the D6 packet explicitly records that it is design/specification only.

## Findings

### P1: Current D6 scaffold leaves the TypeScript state model to implementation

The spec delta has one broad requirement and two scenarios. It does not define the discriminated unions for diagnostic acquisition, scan-root decisions, cache observations, adapter failure subset, injected probe result, or consumer projections.

Required repair: add the target state models above to `design.md` and corresponding normative requirements to `specs/habitat-harness/spec.md`. D6 remains not acceptable until implementation-time design choices are removed.

### P1: Public compatibility is unresolved and the D0 matrix does not exist

D6 can affect command JSON, package exports, human output, docs examples, and test-facing public vocabulary. The D0 matrix file is absent, so there are no concrete `surface_id` rows or closed compatibility actions to cite.

Required repair: D6 must list required D0 row classes in design/tasks/phase record and state source implementation is blocked until those rows exist. Placeholders may appear only in design artifacts, never as implementation closure evidence.

### P1: D6 currently depends on D2 facts that are not live

D2 requires `ruleGritFacts`, forbids whole-rule leakage, and forbids fallback from missing pattern identity to rule id. Current source still uses `HarnessRule`, `rules`, `ruleById`, raw `gritPattern`, and `gritPattern ?? rule.id`.

Required repair: D6 must make live D2 `ruleGritFacts` an implementation prerequisite and specify migration away from whole `HarnessRule` rows.

### P1: Diagnostic and apply failures share one failure vocabulary

The broad `GritAdapterFailureTag` union includes D9 apply transaction failures. D6 diagnostics can therefore represent states outside the diagnostic domain.

Required repair: define `DiagnosticAdapterFailureKind` as a closed subset and forbid apply tags in D6 acquisition/projection/probe states. If the broad tag remains exported, keep it as a D0-backed compatibility facade only.

### P2: Adapter failure state is encoded in diagnostic message text

`renderGritAdapterFailure()` formats machine state into text, and `findAdapterFailure()` recovers it with a regex. This is message-chain and primitive-obsession state leakage.

Required repair: D6 must require structured adapter failure projections and treat text rendering as compatibility output only.

### P2: Cache and scan-root contracts are option flags instead of state models

`requireObservableCacheStatus`, `cacheMode`, and `allowInjectedProbeRoot` are independent options. `validateScanRoots()` returns strings. This leaves injected freshness, ordinary workspace cache, protected root refusal, generated output refusal, and mirror-root acceptance as implementation judgments.

Required repair: add closed `DiagnosticCacheRequirement`, `DiagnosticCacheObservation`, and `DiagnosticScanRootDecision` models with scenarios for every current test case.

### P2: Injected probe language overclaims

`proofClass: "injected-violation"` and "proof" wording can be read as governance admission, apply safety, or full current-tree proof.

Required repair: rename target language to `validationClass: "injected-violation-diagnostic"` and classify any retained `proofClass` public field through D0/D1 compatibility handling.

### P3: D6 validation gates are too thin for the stated state-space collapse

Current gates mention adapter and injected probe tests, `habitat check --json`, OpenSpec validation, and `git diff --check`, but they do not require bad cases for apply-tag leakage, missing D2 pattern identity, whole-row leakage, structured failure rendering, cache unknown in proof paths, or every scan-root refusal state.

Required repair: add a validation matrix with expected status, oracle, bad case, cache/freshness stance, and non-claims for each target model.

## Required Packet Repairs

Update D6 packet artifacts as follows:

1. `design.md`: add current diagnosis, target state model tables/types, D0 public compatibility dependency inventory, D1/D2 dependency state, implementation write/protected set, safe refactor sequence, rejected alternatives, and D15 trigger rule.
2. `specs/habitat-harness/spec.md`: split the single broad requirement into normative requirements for catalog entries, diagnostic acquisition, adapter failure subset, scan-root decisions, cache observations, projection contracts, injected probe results, D0 compatibility blockers, and D2 `ruleGritFacts` consumption.
3. `tasks.md`: replace broad implementation bullets with ordered slices matching the safe refactor sequence. Add "block until D0 rows and live D2 projections exist" before source edits.
4. `workstream/phase-record.md`: record the current gate as design/specification only, D0 matrix missing, D1/D2 accepted-design-only dependency state, validation result table shape, and exact non-claims.
5. `workstream/review-disposition-ledger.md`: add this investigation as a blocking P1/P2 repair source.
6. `workstream/downstream-realignment-ledger.md`: name D7, D8, D9, D11, and D15 impact precisely, including what each receives and what it must not infer.
7. `workstream/closure-checklist.md`: add explicit checks that no implementation-time design choices remain for concrete state model, public compatibility, or validation oracle.

## Validation Oracle D6 Must Specify

Minimum later implementation validation:

| Gate | Expected | Bad case |
| --- | --- | --- |
| `test/lib/grit-adapter.test.ts` | parser/acquisition states are closed and distinguish clean, findings, parse failures, command failures, projection misses | `ok: true` with failure tag is unrepresentable; malformed wrapper text is structured failure |
| `test/lib/grit-injected-probe.test.ts` | injected probe requires fresh cache, exact matching probe, outside-scope control, cleanup state, and diagnostic-only validation class | control path matching produces `probe-control-matched`; missing cache provenance fails |
| new diagnostic failure subset test | D6 failure subset excludes D9 apply tags | any `GritApply*` tag in diagnostic acquisition/projection fails |
| new D2 projection integration test | Grit diagnostics consume `ruleGritFacts`, not `HarnessRule` | missing pattern identity fails before Grit execution; no fallback to rule id |
| new scan-root decision test | every refusal reason is a structured state | generated/protected/outside/missing/unapproved roots do not become generic command failure |
| `habitat check --json` | D0/D1-compatible check JSON with structured diagnostic adapter failures or compatibility-rendered text | adapter failure cannot produce structural pass |
| OpenSpec validation | D6 packet validates strictly | missing scenario for any target state fails review checklist |

## D15 Trigger Decision

D6 should not trigger D15 by default. Local DTOs are sufficient if D6 uses bounded command projections and does not require shared provenance semantics beyond diagnostic command observation.

D15 becomes triggered only if D6 cannot express cache/freshness, bounded output, git-state cleanup, and command observation through D6-local projections without changing shared `habitat-process.ts` public/exported semantics. If triggered, D6 must stop source implementation and hand the shared substrate decision to the D15 owner rather than adding broad Effect/provenance machinery locally.

## Acceptance Standard

D6 is acceptable for design/specification only when a reviewer can point to:

- one D6-owned diagnostic catalog entry model;
- one D6-owned diagnostic acquisition model;
- one closed diagnostic adapter failure subset;
- one scan-root decision model;
- one cache observation model;
- one injected diagnostic probe result model;
- one D0 compatibility blocker table with required row classes;
- one D1/D2 dependency gate with live-fact requirements;
- one validation matrix with bad cases and non-claims;
- explicit rejected alternatives for governance ownership, apply ownership, whole-record leakage, fallback pattern identity, and default D15 migration.

Until then, D6 remains a draft scaffold, not an implementation authority.
