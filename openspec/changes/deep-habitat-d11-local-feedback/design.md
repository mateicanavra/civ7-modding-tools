# Design: D11 Local Feedback

## Frame

D11 specifies the Local Feedback domain: Habitat's fast, local hook workflow for
commit and push preparation. The product goal is a hook that is helpful,
recoverable, and bounded. It should answer: "What local repo-maintenance issue
blocks this commit or push right now, and what should I do next?" It must not
answer: "Is this ready for CI, review, product/runtime use, Graphite submission,
OpenSpec closure, or safe apply?"

Current code is input. It is not the target model. The current
`hooks.ts` module combines hook orchestration, resource submodule inspection,
staged path discovery, file-layer checks, partial staging policy, Biome
format/check, formatter restaging, Grit/check parsing, Graphite base detection,
Nx affected invocation, human output, reporter events, and trace capture. D11
keeps hook orchestration local but removes ambiguous ownership by consuming D6,
D7, D9, D10, and D3 projections instead of parsing or recomputing their domain
truth.

## Solution Design

- **Frame:** rugged/high-commitment design space. A weak D11 packet lets a hook
  look green after missing diagnostic authority, protected-zone refusal,
  formatter restage drift, partial staging, or affected-target failure.
- **Aspiration threshold:** implementation agents can execute the packet without
  inventing hook states, dependency projections, public compatibility decisions,
  validation oracles, or recovery semantics.
- **Constraint reality:** D0-D10 are accepted for design/specification only.
  D11 may design against their target projections, but source implementation is
  blocked where concrete D0 rows or live D3/D6/D7/D9/D10 projections are absent.
- **Rejected shortcut:** keep `ResourceState.allowPreCommit` and add comments.
  That preserves boolean correlation and lets impossible states compile.
- **Rejected shortcut:** keep the current Grit JSON parse in hooks as target
  behavior. D6 owns diagnostic projection; D11 may render hook-safe results.
- **Rejected shortcut:** add a generic hook stage framework. D11 needs a small,
  explicit hook pipeline and typed outcomes, not generic workflow machinery.

## Domain Boundary

| Concern | D11 owns | D11 does not own |
| --- | --- | --- |
| Hook command | `habitat hook pre-commit`, `habitat hook pre-push`, unsupported-hook refusal, hook-local rendering, and trace capture. | Oclif/global CLI behavior outside hook surfaces. |
| Local feedback scope | Non-claim rendering and local recovery instructions for hook outcomes. | CI, review, OpenSpec, Graphite, runtime/product, apply-safety, or generated-freshness authority. |
| Resource state | Local resource submodule readiness for pre-commit and recovery commands. | Resource publishing implementation, host resource semantics, or submodule content ownership. |
| Staged path workflow | Staged path collection, partial-staging refusal before formatting, formatter-touched restage only. | Structural check truth, generated/protected policy, diagnostic identity, or transaction write safety. |
| Pre-push routing | Local base selection request and affected-target command invocation. | Workspace graph truth, Nx target validity, Graphite stack correctness, or CI target coverage. |

## Target Terms

| Term | Meaning |
| --- | --- |
| `LocalFeedbackTrace` / `HookTrace` | D1-constrained local hook record. Current `HookTrace` may remain a compatibility name until D0 decides export handling. |
| `HookStage` | A named local step in the hook pipeline, such as resource decision, staged scope, structural check projection, formatter, diagnostic projection, or pre-push affected invocation. |
| `HookStageOutcome` | Discriminated stage result: passed, refused, failed, unavailable, not applicable, or skipped because an earlier terminal outcome stopped the hook. |
| `ResourcePreCommitDecision` | D11-owned discriminated resource state; commit allowance is derived from variant. |
| `StagedPathDecision` | D11-owned staged scope classification for formatter and diagnostic stages. |
| `PartialStagingRefusal` | Terminal refusal before formatting/restaging when staged formatter-supported paths also have unstaged changes. |
| `FormatterRestageDecision` | D11-owned decision recording formatter-touched paths and the exact paths eligible for restage. |
| `LocalFeedbackCheckProjection` | D7-owned projection consumed by D11 for structural check outcomes. |
| `StagedDiagnosticProjection` | D6-owned diagnostic projection consumed by D11 directly or carried through D7 with D6 owner metadata. |
| `TransactionLocalFeedbackProjection` | D9-owned transaction state projection consumed by D11 when hook feedback references apply/fix state. |
| `ProtectedMutationLocalFeedback` | D10/D7-carried local feedback for staged protected/generated/forbidden mutation refusals. |
| `AffectedTargetFeedback` | D11 pre-push local rendering of an Nx affected invocation built from D3 graph/base facts. |

## Rejected Or Compatibility Terms

| Current term/phrase | D11 handling |
| --- | --- |
| Legacy hook human output | D0/D1 compatibility phrase. Target text is local feedback only. |
| `allowPreCommit` | Rejected as target state. Replace with variant-derived allowance. |
| Raw `Grit` result in hooks | Rejected as target D11 input. Consume D6 projection or D7 projection carrying D6-origin labels. |
| Legacy authority wording in hook output | Rejected target language unless a D0 row preserves a legacy human-output surface. |
| `dry-run` hook gate | Not current public behavior. Adding it requires D0/D1 compatibility and explicit D11 command contract. |

## State Model

### Resource Pre-Commit Decision

Target model:

```ts
type ResourcePreCommitDecision =
  | { kind: "not-configured"; commit: "allowed"; detail: string }
  | { kind: "clean"; commit: "allowed"; detail: string }
  | { kind: "staged-gitlink"; commit: "allowed"; detail: string }
  | { kind: "uninitialized"; commit: "refused"; detail: string; recovery: NonEmptyReadonlyArray<string> }
  | { kind: "locked"; commit: "refused"; detail: string; recovery: NonEmptyReadonlyArray<string> }
  | { kind: "dirty-submodule"; commit: "refused"; detail: string; recovery: NonEmptyReadonlyArray<string> }
  | { kind: "unstaged-gitlink"; commit: "refused"; detail: string; recovery: NonEmptyReadonlyArray<string> }
  | { kind: "inspection-failed"; commit: "refused"; detail: string; recovery: NonEmptyReadonlyArray<string>; command: HookCommandRecord };
```

The implementation may choose equivalent names, but it must preserve the
invariant: no boolean may contradict the variant. `commit` is a derived tag or
encoded in separate allowed/refused union branches; it must not be an
independent mutable flag.

### Pre-Commit Stage Outcomes

```ts
type PreCommitLocalFeedbackOutcome =
  | { kind: "resource-refused"; decision: ResourcePreCommitDecision }
  | { kind: "structural-check-refused"; projection: LocalFeedbackCheckProjection }
  | { kind: "protected-mutation-refused"; projection: ProtectedMutationLocalFeedback }
  | { kind: "partial-staging-refused"; refusal: PartialStagingRefusal }
  | { kind: "formatter-failed"; command: HookCommandRecord }
  | { kind: "formatter-restage-failed"; command: HookCommandRecord; attemptedPaths: NonEmptyReadonlyArray<RepoRelativePath> }
  | { kind: "format-check-failed"; command: HookCommandRecord }
  | { kind: "diagnostic-unavailable"; projection: StagedDiagnosticProjection }
  | { kind: "diagnostic-findings"; projection: StagedDiagnosticProjection }
  | { kind: "passed"; trace: LocalFeedbackTrace };
```

The design permits D7 to carry D6-origin diagnostic labels through
`LocalFeedbackCheckProjection`, but the trace must retain the owner relation so
D11 cannot infer diagnostic truth locally.

### Pre-Push Stage Outcomes

```ts
type PrePushLocalFeedbackOutcome =
  | { kind: "base-selected"; base: string; source: "explicit" | "graphite-parent" | "merge-base-main" | "merge-base-origin-main" | "literal-main-fallback" }
  | { kind: "graph-unavailable"; graphRefusal: D3GraphRefusal }
  | { kind: "affected-target-unavailable"; targetRefusal: D3TargetRefusal }
  | { kind: "affected-command-failed"; base: string; command: HookCommandRecord }
  | { kind: "passed"; base: string; command: HookCommandRecord; trace: LocalFeedbackTrace };
```

Literal `main` fallback remains a local fallback state, not graph truth. If D3
later publishes a stricter graph/base refusal, D11 consumes it and must not run
`nx affected` as a no-op wrapper.

## Hook Pipeline

### Pre-Commit

1. Render local-feedback scope and capture initial repo snapshot.
2. Build `ResourcePreCommitDecision`.
3. Stop on refused resource state before file-layer, Biome, Grit, resource
   publish, or restage commands.
4. Collect staged paths from Git and normalize to repo-relative paths.
5. Consume D7 `LocalFeedbackCheckProjection` for staged structural checks.
6. If the D7 projection carries D10-origin protected/generated/forbidden
   refusal, render it and stop before Biome, Grit, publish, or restage.
7. Classify formatter-supported staged paths and refuse partial staging before
   formatting.
8. Run Biome format/check only for formatter-supported staged paths, with
   Biome's no-unmatched behavior where applicable.
9. Restage only files whose hash changed due to the formatter.
10. Consume D6 staged diagnostic projection for diagnostic/Grit feedback, either
    directly or through D7 with D6-owner metadata.
11. Emit pass only when every required stage passes or is explicitly not
    applicable by owner-published state.

### Pre-Push

1. Render local-feedback scope and capture initial repo snapshot.
2. Select base from explicit `--base`, Graphite parent, merge-base with `main`,
   merge-base with `origin/main`, or literal fallback.
3. Consume D3 graph/target availability before treating affected-target
   behavior as runnable once D3 live projections exist.
4. Run Nx affected with explicit base and `HEAD` only when graph/target state is
   runnable.
5. Emit affected failure as local feedback, not CI or review status.

## TypeScript Refactoring Application

| Current smell | Safe refactor move | D11 acceptance condition |
| --- | --- | --- |
| Boolean correlation: `ResourceState.kind` plus `allowPreCommit`. | Replace flag soup with discriminated allowed/refused resource decisions and constructors. | Contradictory resource allowance cannot compile. |
| Whole-output parsing in hook Grit path. | Consume D6/D7 projections and preserve D6 owner relation. | Hook code does not parse raw Grit output as target diagnostic authority. |
| Monolithic hook function mixes policy, shelling, rendering, and trace mutation. | Extract D11-owned stage decision helpers only where they collapse responsibility; keep `runPreCommit`/`runPrePush` orchestration readable. | No generic stage framework or pass-through wrapper layer. |
| Legacy authority-shaped human output. | D0/D1-compatible wording replacement or legacy facade. | Target strings use local feedback/non-claim language. |
| Restage command takes touched paths from hash comparison inside orchestration. | Model `FormatterRestageDecision` and test touched/untouched/foreign paths. | Foreign staged paths cannot be restaged. |
| Pre-push fallback can hide graph/base uncertainty. | Model base source and graph/target availability states. | Affected-target pass cannot mask unavailable graph authority once D3 facts are live. |

## Public Compatibility

Later D11 implementation must cite D0 rows before changing:

- hook command behavior, help, flags, unsupported hook exit/output, and any new
  dry-run behavior;
- `.husky` delegators;
- hook stdout/stderr and current legacy local-feedback notice;
- `runHook` export and any exported trace/resource types;
- docs/examples that describe hooks;
- script/Nx target behavior or generated help.

Current command input:

- `$HABITAT_TOOL/test/lib/hooks.test.ts` passes 28 current tests.
- `bun tools/habitat-harness/bin/dev.ts hook --help` exits 2 while printing
  help because `--help` is treated as a nonexistent flag.
- `bun tools/habitat-harness/bin/dev.ts hook pre-commit --dry-run` exits 2
  because no dry-run flag exists.
- A live pre-push command can exceed an interactive design-check window, so
  later gates need bounded fake-runtime tests or explicit timeout/oracle.

## Validation Design

Design-time validation proves packet shape only:

- strict D11 OpenSpec validation;
- full OpenSpec validation;
- diff hygiene;
- wording audit over active D11 packet/control/scratch;
- fresh D11 final rereviews with no unresolved P1/P2.

Later implementation validation must falsify false-green states:

- resource state matrix;
- staged protected mutation refusal stops before formatter/diagnostics;
- partial staging refusal stops before formatting/restage;
- formatter restages only touched paths;
- D6 diagnostic unavailable/refused/finding cannot pass;
- D7 check dependency/refusal cannot pass;
- D9 transaction unavailable/refused cannot become local success where consumed;
- D10 protected/generated refusal cannot become warning-only;
- D3 graph/target unavailable cannot become affected-target success;
- unsupported hook and command help behavior match D0/D1 decisions;
- no hook test leaves working-tree residue.

## Downstream And Trigger Model

- D12 may rely on D11 only for local-feedback non-claims and hook trace
  boundaries, not verify handoff completion.
- D15 is triggered only if D11 records a concrete local command/state
  observation that cannot be represented through D1 hook trace, D6 diagnostic
  projection, D7 check projection, D9 transaction projection, D10 path
  projection, or D3 graph projection.
- No downstream packet may cite D11 hook pass as CI, review, product, Graphite,
  OpenSpec, apply-safety, or runtime readiness.

## Wording Discipline

D11 active artifacts should avoid target-language use of legacy authority
wording except when classifying current compatibility surfaces or historical
source wording. Preferred terms: local feedback, trace, command record, diagnostic,
check outcome, transaction projection, guard decision, refusal, recovery
instruction, observation, and validation gate.
