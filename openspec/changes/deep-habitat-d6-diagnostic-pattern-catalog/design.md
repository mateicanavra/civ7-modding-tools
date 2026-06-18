# Design: D6 Diagnostic Pattern Catalog

## Frame

D6 is the Diagnostic Pattern Catalog packet. Its purpose is to make Grit/native
diagnostics trustworthy as diagnostic capability and diagnostic run outcomes,
while preventing governance, baseline, apply, hook, and substrate decisions from
leaking into the diagnostic domain.

Solution-design position:

- Problem character: rugged and high-commitment because D6 feeds D7, D8, D9,
  D11, and D15.
- Intervention type: reshape constraints by defining one diagnostic owner and
  closed state models before implementation.
- Reversibility: low for public command/export changes, so source work is
  blocked behind D0 rows and live D1/D2 facts.
- Satisficing threshold: accepted design/specification only when implementation
  has no product/domain/type-state decisions to invent.

## Current-State Diagnosis

Current code is useful input, but it mixes domains:

- `tools/habitat-harness/src/lib/grit.ts` owns native Grit invocation, scan-root
  validation, JSON/text parsing, docs dry-run projection, result projection, and
  cache/freshness options.
- `tools/habitat-harness/src/lib/grit-failures.ts` mixes diagnostic adapter
  failures with D9 apply transaction failures.
- `tools/habitat-harness/src/lib/grit-injected-probe.ts` models injected probes
  with proof-shaped language and broad adapter failure tags.
- `tools/habitat-harness/src/rules/architecture.ts` and `rules.json` currently
  pass whole `HarnessRule` rows into Grit execution.
- Current tests already cover many target families, but the packet must specify
  which states those tests protect and which future bad cases must be added.

TypeScript refactoring diagnosis:

- Boolean/optional result shapes keep too many reachable states alive.
- Whole-record leakage couples diagnostics to registry rows and process
  capture internals.
- Message parsing hides adapter state inside human text.
- A broad `GritAdapterFailureTag` admits D9 apply states inside D6.
- Fallback `rule.gritPattern ?? rule.id` hides malformed metadata.

The later implementation move is state-space collapse, not a file rearrangement.

## Domain Boundary

D6 owns:

- diagnostic catalog entry identity and limitations;
- D2 `ruleGritFacts` consumption for diagnostic capability;
- scan-root decisions for diagnostic runs;
- native Grit/native diagnostic command request shape;
- diagnostic adapter outcomes and diagnostic adapter failure subset;
- parsed native report projection into Habitat diagnostics;
- cache/freshness observations needed by diagnostic runs;
- injected diagnostic probe input and outcome;
- D6 consumer projections for downstream packets.

D6 does not own:

- rule metadata declaration, selector vocabulary, or malformed registry output
  families: D2 owns them;
- baseline debt, baseline growth/shrink, or baseline application: D5 owns them;
- final check report assembly and enforcement status: D7 owns them;
- pattern candidate/registered/admission/refusal/retirement lifecycle: D8 owns
  it;
- apply/fix transaction safety and rollback: D9 owns it;
- hook sequencing and staged-file behavior: D11 owns it;
- shared execution substrate migration: D15 owns it only when triggered.

## Identity Model

D6 target identity terms:

- `ruleId`: D2-owned Habitat rule identity.
- `patternIdentity`: native Grit diagnostic pattern identity. D6 resolves this
  from D2 `ruleGritFacts`, never from an implementation fallback.
- `diagnosticCatalogEntryId`: D6-owned identity binding one `ruleId` to one
  `DiagnosticIdentity` and one diagnostic capability contract.
- `observedDiagnosticIdentity`: raw identity evidence observed in native output,
  using `local_name`, parsed `check_id` pattern segment, or native D6 rule
  identity before it is matched to an accepted catalog identity.
- `diagnosticFindingId`: derived only for reporting/finding correlation; it is
  not Pattern Governance identity.

Resolution rules:

- D6 accepts a catalog entry only when D2 supplies a valid Grit facet.
- Missing or contradicted `patternIdentity` is a D2/D6 contract refusal, not a
  fallback to `ruleId`.
- Observed diagnostic identity evidence must match the selected
  `DiagnosticIdentity` during projection.
- When native output contains both `local_name` and parsed `check_id`, matching
  values create one observed Grit identity; disagreement creates an observed
  mismatch state and must not project as a diagnostic finding.
- Unexpected native identity is a diagnostic projection failure, not a pass.

## Target State Models

### Diagnostic Catalog Entry

```ts
type DiagnosticCatalogEntry =
  | {
      kind: "grit-diagnostic";
      diagnosticCatalogEntryId: string;
      ruleId: string;
      diagnosticIdentity: Extract<DiagnosticIdentity, { kind: "grit-pattern" }>;
      source: "d2-rule-grit-facts";
      scanContract: DiagnosticScanContract;
      projectionContract: DiagnosticProjectionContract;
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "native-diagnostic";
      diagnosticCatalogEntryId: string;
      ruleId: string;
      diagnosticIdentity: Extract<DiagnosticIdentity, { kind: "native-rule" }>;
      source: "native-habitat-rule";
      acquisitionContract: NativeDiagnosticAcquisitionContract;
      projectionContract: DiagnosticProjectionContract;
      limitations: readonly DiagnosticNonClaim[];
    };
```

Catalog entries must not contain governance status, baseline status, apply
eligibility, hook admission, or transaction state.

```ts
type DiagnosticIdentity =
  | {
      kind: "grit-pattern";
      patternIdentity: string;
      source: "d2-rule-grit-facts";
    }
  | {
      kind: "native-rule";
      nativeDiagnosticIdentity: "docs-local-checkout-paths" | "docs-proof-evidence-vocabulary";
      source: "native-habitat-rule";
    };

type ObservedDiagnosticIdentity =
  | {
      kind: "observed-grit-pattern";
      observedPatternIdentity: string;
      source: "local_name" | "parsed-check-id" | "local-name-and-check-id";
    }
  | {
      kind: "observed-native-rule";
      observedNativeDiagnosticIdentity: "docs-local-checkout-paths" | "docs-proof-evidence-vocabulary";
      source: "native-habitat-rule";
    }
  | {
      kind: "observed-identity-mismatch";
      localName: string;
      parsedCheckId: string;
    };

type DiagnosticScanContract =
  | { kind: "d2-grit-scan-roots"; requiredFacet: "ruleGritFacts" }
  | { kind: "native-docs-scan-roots"; requiredScope: "docs-markdown" };

type DiagnosticProjectionContract =
  | { kind: "grit-pattern-projection"; identity: Extract<DiagnosticIdentity, { kind: "grit-pattern" }> }
  | { kind: "native-rule-projection"; identity: Extract<DiagnosticIdentity, { kind: "native-rule" }> };

type NativeDiagnosticAcquisitionContract =
  | { kind: "docs-text-diagnostic"; outputContract: "standard-text-report" };

type DiagnosticNonClaim =
  | "not-pattern-governance-admission"
  | "not-baseline-authority"
  | "not-apply-safety"
  | "not-hook-sequencing"
  | "not-full-current-tree-cleanliness"
  | "native-fixture-not-current-tree-outcome"
  | "workspace-cache-not-fresh-observation";
```

`DiagnosticIdentity` is the authority for matching native output to selected
entries. Grit diagnostics use D2-owned pattern identity. Native diagnostics use
a D6-owned native diagnostic identity and never require `patternIdentity`.

### Scan-Root Decision

```ts
type DiagnosticScanRootDecision =
  | { kind: "accepted"; roots: readonly string[]; source: "d2-rule-grit-facts" }
  | { kind: "expanded-test-files"; requestedRoots: readonly string[]; effectiveRoots: readonly string[] }
  | { kind: "accepted-injected-probe-root"; roots: readonly string[]; probeOnly: true }
  | {
      kind: "refused";
      reason:
        | "empty"
        | "outside-repo"
        | "missing"
        | "generated-output"
        | "protected-root"
        | "not-approved"
        | "injected-probe-root-without-probe-mode";
      root?: string;
    };
```

Every refusal reason must remain distinguishable through D6 projections and
tests. Raw string messages are renderers, not source authority.

### Native Command Request And Observation

```ts
type NativeGritCommandFamily =
  | "current-tree-json-check"
  | "selected-rule-json-check"
  | "docs-text-check"
  | "docs-apply-dry-run-observation"
  | "injected-probe-json-check";

type NativeGritCheckRequest = {
  commandFamily: NativeGritCommandFamily;
  commandInvocationId: string;
  executable: "grit";
  argv: readonly string[];
  cwd: string;
  scanRoots: readonly string[];
  outputContract: "json-report" | "standard-text-report" | "standard-apply-dry-run";
  cacheRequirement: DiagnosticCacheRequirement;
};

type CompletedDiagnosticCommandObservation = {
  kind: "completed";
  exitCode: number;
  exitInterpretation: "clean" | "findings" | "diagnostic-failure-output";
  interrupted: false;
  cache: DiagnosticCacheObservation;
};

type DiagnosticCommandObservation =
  | { kind: "not-run"; reason: "scan-root-refused" | "invalid-grit-facet" }
  | CompletedDiagnosticCommandObservation
  | { kind: "interrupted"; exitCode: number | null; cache: DiagnosticCacheObservation }
  | { kind: "tool-unavailable"; executable: string; cause: string };
```

D6 keeps command observations bounded. Full `HabitatCommandResult` may be used
inside an adapter boundary, but downstream consumers receive D6 projections.
Parsed acquisition can carry only `CompletedDiagnosticCommandObservation`.
`not-run`, `interrupted`, and `tool-unavailable` observations are failure causes,
not parsed report states.

### Cache/Freshness

```ts
type DiagnosticCacheRequirement =
  | { kind: "workspace-cache-allowed"; observable: false }
  | { kind: "fresh-required"; observable: true; cacheDir: "scoped-temp" | "isolated-workspace" };

type DiagnosticCacheObservation =
  | { kind: "fresh"; cacheDir: string }
  | { kind: "workspace-unobserved"; allowedBy: "ordinary-current-tree-diagnostic" }
  | { kind: "missing-required-observation"; failure: "GritCacheProvenanceMissing" };
```

Injected diagnostic probes require a fresh observable command. Ordinary
current-tree diagnostics may allow workspace cache only when the result carries
that limitation.

### Diagnostic Adapter Outcome

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
  | "GritUnexpectedDiagnosticIdentity"
  | "GritCacheProvenanceMissing"
  | "GritAdapterInternalContractViolation";

type GritDiagnosticAcquisition =
  | { kind: "parsed"; command: CompletedDiagnosticCommandObservation; report: ParsedGritDiagnosticReport }
  | { kind: "adapter-failed"; command: DiagnosticCommandObservation; failure: DiagnosticAdapterFailureKind }
  | { kind: "scan-root-refused"; decision: Extract<DiagnosticScanRootDecision, { kind: "refused" }> };
```

```ts
type ParsedGritDiagnosticReport =
  | { kind: "clean-report"; observedIdentities: readonly ObservedDiagnosticIdentity[] }
  | { kind: "findings-report"; observedIdentities: readonly ObservedDiagnosticIdentity[]; findings: NonEmptyReadonlyArray<NativeDiagnosticFinding> };

type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

type NativeDiagnosticFinding = {
  observedIdentity: ObservedDiagnosticIdentity;
  path: string;
  line?: number;
  message: string;
  severity: "error" | "advisory";
};
```

D6 explicitly forbids these D9-owned apply transaction failures in diagnostic
acquisition/projection/probe target states:

- `GritApplyDirtyWorktree`
- `GritApplyDryRunMismatch`
- `GritApplyUnexpectedFile`
- `GritApplyMissingTargetExport`
- `GritApplyRollbackFailed`

If existing exports require the broad tag set, the later implementation must
keep it behind a D0-classified compatibility facade while D6 internals use the
closed diagnostic subset.

### Diagnostic Projection And Run Outcome

```ts
type DiagnosticFindingProjection = {
  kind: "diagnostic-finding";
  ruleId: string;
  diagnosticCatalogEntryId: string;
  diagnosticIdentity: DiagnosticIdentity;
  path: string;
  line?: number;
  message: string;
  severity: "error" | "advisory";
  baselineState: "unbaselined" | "baseline-covered" | "baseline-owned-by-d5";
};

type DiagnosticRunOutcome =
  | { kind: "clean"; entry: DiagnosticCatalogEntry; diagnostics: readonly [] }
  | { kind: "findings"; entry: DiagnosticCatalogEntry; diagnostics: NonEmptyReadonlyArray<DiagnosticFindingProjection> }
  | { kind: "scan-root-refused"; entry: DiagnosticCatalogEntry; decision: Extract<DiagnosticScanRootDecision, { kind: "refused" }> }
  | { kind: "adapter-failed"; entry: DiagnosticCatalogEntry; failure: DiagnosticAdapterFailureKind }
  | { kind: "projection-missed"; entry: DiagnosticCatalogEntry; expectedIdentity: DiagnosticIdentity }
  | { kind: "unexpected-diagnostic-identity"; entry: DiagnosticCatalogEntry; unexpectedIdentity: ObservedDiagnosticIdentity }
  | { kind: "cache-observation-missing"; entry: DiagnosticCatalogEntry; observation: Extract<DiagnosticCacheObservation, { kind: "missing-required-observation" }> };
```

`clean`, `findings`, and `adapter-failed` are mutually exclusive. Adapter failure
can never produce a structural pass.
Projection converts `ObservedDiagnosticIdentity` into accepted
`DiagnosticIdentity` only after the observed evidence matches the selected
catalog entry. Observed mismatch evidence remains an
`unexpected-diagnostic-identity` outcome and is not coerced into catalog
identity.

### Injected Diagnostic Probe Outcome

```ts
type InjectedProbeOutcome =
  | {
      kind: "probe-diagnostic-observed";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      matchingProbePath: string;
      outsideScopeControlPath: string;
      observedFinding: DiagnosticFindingProjection;
      cleanup: "restored";
      validationClass: "injected-violation-diagnostic";
      limitations: readonly DiagnosticNonClaim[];
    }
  | { kind: "probe-refused"; reason: InjectedProbeRefusalReason }
  | { kind: "probe-adapter-failed"; failure: DiagnosticAdapterFailureKind }
  | { kind: "probe-projection-missed"; expectedIdentity: DiagnosticIdentity }
  | { kind: "probe-control-matched"; controlPath: string }
  | { kind: "probe-cleanup-failed"; observedFinding?: DiagnosticFindingProjection; finalStatus: "dirty" | "not-restored" };

type InjectedProbeRefusalReason =
  | "unregistered-rule"
  | "non-grit-rule"
  | "metadata-missing"
  | "metadata-mismatched"
  | "pattern-identity-mismatch"
  | "probe-path-outside-repo"
  | "probe-path-outside-scan-root"
  | "probe-path-generated"
  | "probe-path-protected"
  | "probe-path-ignored"
  | "probe-path-pre-existing"
  | "missing-habitat-ownership-segment"
  | "same-probe-and-control-path";
```

Target language is "probe", "outcome", "validation class", and "limitation".
Existing `proofClass` fields, if retained, must be D0/D1 compatibility
projections generated from `validationClass`, not core D6 language.

### Consumer Projection

```ts
type DiagnosticConsumerProjection =
  | {
      kind: "clean";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      diagnostics: readonly [];
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "findings";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      diagnostics: NonEmptyReadonlyArray<DiagnosticFindingProjection>;
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "scan-root-refused";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      decision: Extract<DiagnosticScanRootDecision, { kind: "refused" }>;
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "adapter-failed";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      failure: DiagnosticAdapterFailureKind;
      limitations: readonly DiagnosticNonClaim[];
    }
  | {
      kind: "projection-missed" | "unexpected-diagnostic-identity" | "cache-observation-missing";
      ruleId: string;
      diagnosticCatalogEntryId: string;
      diagnosticIdentity: DiagnosticIdentity;
      limitation: DiagnosticNonClaim;
    };
```

Consumer projection is derived from `DiagnosticRunOutcome`; it must not flatten
failure fields into optional properties. Clean projections carry no diagnostics,
findings projections carry at least one diagnostic finding, and adapter-failed
projections carry adapter failure only on that variant.

Consumer rules:

| Consumer | Receives | Must not infer |
| --- | --- | --- |
| D7 Structural Enforcement | `DiagnosticRunOutcome`, finding projections, adapter failure projections | Pattern admission, apply safety, raw Grit internals |
| D8 Pattern Governance | diagnostic capability, native fixture result, injected probe outcome, limitations | D6 admission decision or baseline authority |
| D9 Transformation Transaction | diagnostic identity and limitations only | write safety, rollback safety, formatter safety |
| D11 Local Feedback | hook-eligible diagnostic projection after D11 owns staged flow | hook sequencing from D6 |
| D15 Trigger | exact local representation gap only | default substrate migration |

## Public And Durable Surface Blockers

D6 source implementation requires concrete D0 rows before touching:

- `habitat check --tool grit-check --json` and selected `--rule` Grit command JSON.
- `CheckReport`, `RuleReport`, `HabitatDiagnostic`, statuses, messages, and
  adapter failure rendering.
- `tools/habitat-harness/src/index.ts` exports for Grit adapter/process/probe
  types and functions.
- Public/test-facing types and functions in `src/lib/grit.ts`,
  `src/lib/grit-failures.ts`, `src/lib/grit-injected-probe.ts`, and any changed
  command process types from `src/lib/habitat-process.ts`.
- `tools/habitat-harness/src/rules/rules.json` Grit metadata fields:
  `ownerTool`, `gritPattern`, `scope`, `detect`, `lane`, `hookScope`,
  `manifestPath`, and future `ruleGritFacts` projection inputs.
- `.grit/patterns/habitat/checks/**` and native fixture expectations.
- Injected probe root policy and docs/examples that describe injected probe
  results or adapter failures.
- `tools/habitat-harness/docs/CAPABILITIES.md` or other durable docs if D6
  public guidance changes.

D6 implementation is source-blocked until the D0 rows exist and cite closed
compatibility handling.

## Write Set For Later Implementation

D6 may later own:

- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/lib/grit-failures.ts` for diagnostic subset only
- `tools/habitat-harness/src/lib/grit-injected-probe.ts`
- Grit-scoped projections around `tools/habitat-harness/src/lib/habitat-process.ts`
  only if D15 is not triggered
- `tools/habitat-harness/src/index.ts` export compatibility facades where D0
  authorizes them
- `tools/habitat-harness/src/rules/rules.json` only for D6 diagnostic metadata
  fields after D2 live facts exist
- `tools/habitat-harness/test/lib/grit-adapter.test.ts`
- `tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
- `tools/habitat-harness/test/grit/grit-patterns.test.ts`
- D6-specific fixtures/docs required for accepted scenarios

Protected paths:

- D5 baseline authority implementation and baseline JSON except D6-specific
  fixtures approved by D5.
- D7 report assembly/enforcement redesign.
- D8 Pattern Governance lifecycle/admission implementation.
- D9 apply transaction behavior and apply failure taxonomy except compatibility
  references to split ownership.
- D11 hook transaction/local-feedback sequencing.
- D13 generator/manifest creation.
- Generated outputs and lockfiles unless regenerated through repo process.

## Safe Refactor Sequence For Later Implementation

1. Block on concrete D0 rows and live D2 `ruleGritFacts`.
2. Add D6 model types in one canonical module; preserve exported compatibility
   names only where D0 rows require them.
3. Split `DiagnosticAdapterFailureKind` from D9 apply transaction failures.
4. Introduce structured adapter failure projection; render message text from
   structure instead of parsing message text as source authority.
5. Replace `GritCheckParseResult` boolean/optional state with closed
   `GritDiagnosticAcquisition` variants.
6. Replace scan-root string/null validation with `DiagnosticScanRootDecision`.
7. Replace cache option flags with `DiagnosticCacheRequirement` and
   `DiagnosticCacheObservation`.
8. Migrate `runGritRules()` and projection from whole `HarnessRule` rows to D2
   `ruleGritFacts`; delete fallback pattern identity.
9. Migrate injected probe language to `InjectedProbeOutcome`; map compatibility
   `proofClass` only if D0/D1 require it.
10. Add behavior tests per state family before deleting compatibility paths.
11. Delete compatibility-only paths when their D0 actions allow removal.

Each slice must reduce reachable states or delete a compatibility path. A slice
that only relocates code does not satisfy D6.

## D15 Trigger Rule

D6 does not trigger D15 by default. D6-local projections are sufficient if they
can represent command id, argv shape, scan roots, bounded output status,
cache/freshness observation, git cleanup status for probes, adapter outcome, and
limitations.

D15 is triggered only if D6 cannot encode those command observations without
changing shared command-process public semantics or adding broad substrate
machinery outside the D6 owner boundary.

## Rejected Alternatives

- Let D8 own all Grit diagnostic metadata. Rejected because Pattern Governance
  would become a prerequisite for ordinary diagnostics.
- Treat Grit findings as apply safety. Rejected because D9 owns writes and
  transaction safety.
- Keep `rule.gritPattern ?? rule.id` as target behavior. Rejected because it
  hides malformed D2 metadata.
- Keep adapter failure state as text. Rejected because machine state cannot be
  a regex over human output.
- Move directly to shared execution provenance. Rejected because D6-local DTOs
  appear sufficient unless a later implementation slice falsifies that.
