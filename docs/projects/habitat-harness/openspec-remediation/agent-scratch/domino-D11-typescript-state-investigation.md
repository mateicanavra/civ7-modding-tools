# D11 Local Feedback TypeScript State Investigation

Investigation lane: TypeScript refactoring and state-space collapse.

Verdict: blocking. The current D11 OpenSpec packet is not implementation-ready. Later execution would still have to decide the concrete local hook state model, public compatibility treatment, write set, and validation oracle. Those are design authority decisions, not implementation details.

This document is review input only. It is not acceptance evidence, does not update the packet index, and does not close D11.

## Source Authority Read Register

Read in full:

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
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/heuristics.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/universal.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/axis-3-4-legibility-and-discovery.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/leaflet-software-testing.md`

Repo and project authority read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/README.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/GRAPHITE.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/FRAME.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/dra-takeover-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/recovery-claim-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`

D11 and upstream packet inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/closure-checklist.md`
- D1, D6, D7, D9, and D10 OpenSpec packet directories under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/`

Live implementation inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`

Important authority facts:

- D11 owns local hook feedback only. It does not own CI proof, review proof, OpenSpec acceptance, generated/protected-zone policy, Grit semantics, transformation safety, or Nx graph authority.
- D1 owns canonical target naming, non-claims, and public-surface compatibility routing. D1 names `HookTrace` / `LocalFeedbackTrace` as local feedback traces, not proof artifacts.
- D6 owns diagnostic pattern acquisition/projection. D11 must consume diagnostic outcomes; it must not interpret raw Grit output or message text as semantic authority.
- D7 owns structural enforcement and local-feedback-safe check projection. D11 may decide hook sequencing and staged-file handling, but must consume D7 projection rather than parse D7 human output.
- D9 owns apply/fix transaction semantics. D11 may only consume D9 local-feedback-safe outcomes.
- D10 owns protected/generated-zone mutation authority. D11 must stop before downstream stages when D10-origin file-layer refusal is reported.
- The D0 public compatibility matrix path described by upstream docs was not present in this worktree. Therefore public output and exported DTO changes remain blocked unless D11 requires preserving/facading legacy surfaces or first lands the missing D0 rows.

## Current Code Topology Summary

Current hook source:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`

Current hook tests:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`

The source is a single 878-line hook module. The tests are a single 834-line hook test module. The source currently mixes these concerns:

- public hook entrypoints: `runHook`, `runPreCommit`, `runPrePush`
- command execution abstraction: `HookRuntime`, `HookCommandRecord`, `runCommandRecord`
- reporter abstraction: `HookReporter`, `createStdoutReporter`, `createMemoryReporter`
- resource publishing abstraction: `ResourcePublisher`, `createResourcePublisher`
- resource submodule classification: `classifyResourcesState`, `readGitmodules`, `submoduleStatus`, `detectUnstagedGitlink`, `detectStagedGitlink`, `resourceFailure`
- local pre-commit sequencing: staged path discovery, file-layer check, partial staging detection, Biome format/check, formatter restage, Grit check
- Grit/CheckReport interpretation: `parseCheckReport`, `hasGritAdapterParseFailure`
- pre-push base and affected target behavior: `resolvePrePushBase`, `graphiteParent`, `mergeBase`, `prePushTargets`
- trace construction: `PreCommitTrace`, `PrePushTrace`, `HookTrace`

The tests already characterize several critical behaviors:

- clean resources pass pre-commit
- dirty resources fail before file-layer, Biome, Grit, or resource publishing
- missing or uninitialized resource submodule states refuse pre-commit
- staged resource gitlink is allowed
- dirty submodule state takes precedence over staged gitlink state
- `not-configured` resources are allowed
- pre-commit does not invoke resource publishing implicitly
- generated/protected file-layer failure stops before Biome/Grit/publish
- partial staging refuses before format/restage/Grit
- formatter restage stages only formatter-touched paths
- malformed Grit JSON and Grit findings fail closed
- pre-push chooses explicit base, Graphite parent, merge-base fallback, or literal `main`
- Nx affected failures propagate
- trace and reporter injection are characterized

Those tests are valuable characterization tests. They are not enough to make D11 implementation-ready, because the packet does not yet define the target state model or compatibility facade that the implementation should converge toward.

## TypeScript Smell Catalog Against Current Symbols

### P1: Correlated Flag And Kind

Current symbols:

- `type ResourceStateKind`
- `interface ResourceState`
- `ResourceState.allowPreCommit`
- `classifyResourcesState`
- `resourceFailure`
- `runPreCommit`

Current shape:

```ts
interface ResourceState {
  readonly kind: ResourceStateKind;
  readonly allowPreCommit: boolean;
  readonly detail: string;
  readonly remediation: readonly string[];
}
```

The smell is correlated boolean plus kind. A value can represent impossible states such as `{ kind: "dirty-submodule", allowPreCommit: true }` or `{ kind: "clean", allowPreCommit: false }`. The constructors currently avoid some contradictions by convention, but the type permits them. D11 must collapse this state space with a discriminated union and derive commit allowance from the variant.

Safe move: introduce a target resource gate union with constructors, then adapt to the legacy `ResourceState` shape only if public compatibility requires it.

### P1: Optional Property Soup In Trace DTOs

Current symbols:

- `interface PreCommitTrace`
- `interface PrePushTrace`
- `export type HookTrace`
- `PreCommitOutcome`
- `PrePushOutcome`

Current traces store terminal outcome as a separate union while many fields are optional or meaningful only for some outcomes:

- `preState?`
- `postState?`
- `endedAtMs?`
- `durationMs?`
- `resourceState?`
- `base?`
- arrays whose meaning depends on `outcome`

The smell is temporal optional state. The type does not encode which fields exist at each lifecycle point or which stage produced a refusal/failure. D11 should define a closed local feedback trace with stage results, terminal state, and D1 non-claims. If the existing exported shape is public, D11 must require a compatibility projection rather than mutate it without D0 authority.

### P1: Hook Code Reinterprets Upstream Authority

Current symbols:

- `parseCheckReport`
- `hasGritAdapterParseFailure`
- `runPreCommit`
- `CheckReport`
- `DiagnosticSummary`

The current code parses `CheckReport` and identifies malformed Grit output by regex over diagnostic messages:

```ts
message: /native Grit emitted malformed JSON/i
message: /native Grit did not emit JSON/i
message: /Failed to parse native Grit JSON/i
```

This is a D6/D7 authority leak. It makes D11 local hook behavior depend on diagnostic wording rather than accepted diagnostic/check projections. D11 should specify that hooks consume typed D6/D7 projection outcomes and only preserve this regex path as a temporary compatibility bridge if upstream projection implementation is not yet available.

### P1: Target Contract Versus Legacy Public Compatibility Is Undecided

Current symbols:

- `export type HookCommandPhase`
- `export type PreCommitOutcome`
- `export type PrePushOutcome`
- `export interface HookCommandRecord`
- `export interface PreCommitTrace`
- `export interface PrePushTrace`
- `export type HookTrace`
- `localHookProofNotice`

D1 identifies `HookTrace` / `LocalFeedbackTrace` as a target family, and D0 controls public compatibility. The D11 packet does not yet decide whether current exported types are target contracts, legacy public compatibility, or implementation internals. It also does not cite D0 rows for changing the human output string:

```ts
hook proof: local feedback only; CI remains authoritative.
```

The word "proof" is target-hostile even though D1 records it as an existing compatibility phrase. D11 must not silently change it without D0 authority, but it also must not bless it as target terminology.

### P2: Repeated Branching Instead Of Stage Model

Current symbols:

- `runPreCommit`
- `runPrePush`
- `HookCommandPhase`
- `PreCommitOutcome`
- `PrePushOutcome`

The current pre-commit function is a long procedural pipeline that manually pushes commands, mutates trace arrays, and returns terminal outcomes at many points. This is the "repeated branch means missing model" smell. D11 should not replace it with generic artifact machinery. It should define small local result records for each hook stage.

Safe move: extract behavior-preserving stage functions only after each stage has a discriminated result type and tests.

### P2: Inspection Failure Overloaded As Uninitialized Resource State

Current symbols:

- `ResourceStateKind`
- `classifyResourcesState`
- `resourceFailure`

Several inspection failures are represented as `kind: "uninitialized"`:

- missing resource root
- non-worktree resource root
- wrong top-level
- `git-dir` inspection failure
- submodule status command failure
- unstaged/staged gitlink inspection command failure

The source domino names an inspection-failure refused state. D11 should separate actual initialization problems from inspection failures. This reduces state ambiguity and improves recovery messages without changing the hook authority boundary.

### P2: Pre-Push Base Is String-Only

Current symbols:

- `resolvePrePushBase`
- `graphiteParent`
- `mergeBase`
- `PrePushTrace.base`
- `PrePushTrace.commands`

Current behavior chooses explicit base, Graphite parent, merge-base fallback, or literal `main`, but the target trace only preserves the chosen base string and command records. D11 needs a typed base decision:

- explicit base
- Graphite parent
- merge-base with candidate provenance
- literal `main` fallback
- affected command failure surfaced separately

D11 must also state how D3/Nx graph failures are surfaced. Literal `main` fallback is acceptable only as a local-feedback fallback with non-claims; it must not hide affected-target failures or graph authority gaps.

### P2: Embedded Target List Can Become False Authority

Current symbol:

- `const prePushTargets = ["biome:ci", "boundaries", "grit:check", "habitat:check", "test"]`

D11 can define that pre-push runs a local affected feedback command, but it should not become the canonical owner of Nx target availability or graph dependency truth. That authority belongs to D3/Nx workspace integration and owning package targets. The D11 packet should require target selection to be consumed from accepted upstream graph/command contracts or explicitly mark this list as local hook configuration, not proof of graph coverage.

### P3: Proof-Shaped Names In Local Feedback Code

Current symbol:

- `localHookProofNotice`

This is a naming smell. D11 target language should use "local feedback notice" or "local non-claim notice." If the emitted string is public compatibility, keep it through a facade until D0 permits renaming.

## Target State Model

D11 should specify target state as discriminated unions with constructors. Allowed behavior should be derived, never stored as a mutable or independently-set boolean.

### Resource Gate

Target internal model:

```ts
type ResourcePreCommitGate =
  | {
      readonly kind: "allowed";
      readonly state: "clean" | "not-configured" | "staged-gitlink";
      readonly detail: string;
      readonly remediation: readonly [];
    }
  | {
      readonly kind: "refused";
      readonly state:
        | "uninitialized"
        | "locked"
        | "dirty-submodule"
        | "unstaged-gitlink"
        | "inspection-failed";
      readonly detail: string;
      readonly remediation: NonEmptyReadonlyArray<ResourceRecoveryInstruction>;
    };

const allowsPreCommit = (gate: ResourcePreCommitGate): gate is Extract<ResourcePreCommitGate, { kind: "allowed" }> =>
  gate.kind === "allowed";
```

Compatibility projection if current `ResourceState` is public:

```ts
type LegacyResourceState = {
  readonly kind: ResourceStateKind;
  readonly allowPreCommit: boolean;
  readonly detail: string;
  readonly remediation: readonly string[];
};

const toLegacyResourceState = (gate: ResourcePreCommitGate): LegacyResourceState => ({
  kind: gate.state,
  allowPreCommit: gate.kind === "allowed",
  detail: gate.detail,
  remediation: gate.remediation,
});
```

D11 must decide whether `ResourceState` remains exported as legacy compatibility, is versioned, or is replaced by the target union. Without a D0 row, the safe packet requirement is: keep the old export as a facade and use the target union internally.

### Hook Terminal State

Target local hook terminal state:

```ts
type LocalFeedbackTerminal =
  | {
      readonly kind: "pass";
      readonly nonClaims: NonEmptyReadonlyArray<D1NonClaimId>;
    }
  | {
      readonly kind: "refused";
      readonly reason: LocalFeedbackRefusalReason;
      readonly recovery: NonEmptyReadonlyArray<RecoveryInstruction>;
      readonly nonClaims: NonEmptyReadonlyArray<D1NonClaimId>;
    }
  | {
      readonly kind: "failed";
      readonly stage: LocalFeedbackStageId;
      readonly command?: HookCommandRecord;
      readonly recovery: readonly RecoveryInstruction[];
      readonly nonClaims: NonEmptyReadonlyArray<D1NonClaimId>;
    }
  | {
      readonly kind: "skipped";
      readonly reason: LocalFeedbackSkipReason;
      readonly nonClaims: NonEmptyReadonlyArray<D1NonClaimId>;
    };
```

The terminal state should map to D1 closed feedback states: `pass`, `failed`, `refused`, and `skipped`. Current `PreCommitOutcome` and `PrePushOutcome` may remain compatibility enums, but the target contract should be terminal state plus stage result.

### Pre-Commit Stage Results

D11 should specify small local stage records, not a generic artifact framework:

```ts
type ResourceGateResult = ResourcePreCommitGate;

type StagedPathSelection =
  | { readonly kind: "none"; readonly stagedPaths: readonly [] }
  | {
      readonly kind: "selected";
      readonly stagedPaths: NonEmptyReadonlyArray<string>;
      readonly biomePaths: readonly string[];
      readonly gritScanRoots: readonly string[];
    };

type FileLayerFeedbackResult =
  | { readonly kind: "pass"; readonly projection: D7LocalFeedbackCheckProjection }
  | { readonly kind: "refused"; readonly projection: D7LocalFeedbackCheckProjection }
  | { readonly kind: "failed"; readonly command: HookCommandRecord; readonly projection?: D7LocalFeedbackCheckProjection };

type PartialStagingDecision =
  | { readonly kind: "clean"; readonly checkedPaths: readonly string[] }
  | { readonly kind: "refused"; readonly partiallyStagedPaths: NonEmptyReadonlyArray<string> };

type FormatterRestageDecision =
  | { readonly kind: "no-candidates" }
  | { readonly kind: "format-failed"; readonly command: HookCommandRecord }
  | {
      readonly kind: "restaged";
      readonly formatterTouchedPaths: readonly string[];
      readonly restagedPaths: readonly string[];
    }
  | { readonly kind: "restage-failed"; readonly command: HookCommandRecord; readonly attemptedPaths: readonly string[] }
  | { readonly kind: "check-failed"; readonly command: HookCommandRecord }
  | { readonly kind: "pass"; readonly formatterTouchedPaths: readonly string[] };

type DiagnosticFeedbackResult =
  | { readonly kind: "not-applicable"; readonly reason: "no-approved-scan-roots" }
  | { readonly kind: "pass"; readonly projection: D6DiagnosticProjection | D7LocalFeedbackCheckProjection }
  | { readonly kind: "findings"; readonly projection: D6DiagnosticProjection | D7LocalFeedbackCheckProjection }
  | { readonly kind: "adapter-failed"; readonly projection: D6DiagnosticProjection | D7LocalFeedbackCheckProjection }
  | { readonly kind: "parse-failed"; readonly projection: D6DiagnosticProjection | D7LocalFeedbackCheckProjection }
  | { readonly kind: "command-failed"; readonly command: HookCommandRecord };
```

The exact imported names can differ, but the authority boundary cannot. D11 should say these records consume accepted upstream projections and do not derive protected-zone, diagnostic, or apply semantics locally.

### Pre-Push Base And Affected Result

Target pre-push base model:

```ts
type PrePushBaseDecision =
  | { readonly kind: "explicit-base"; readonly base: string }
  | { readonly kind: "graphite-parent"; readonly base: string; readonly command: HookCommandRecord }
  | {
      readonly kind: "merge-base";
      readonly candidate: "main" | "origin/main";
      readonly base: string;
      readonly command: HookCommandRecord;
    }
  | {
      readonly kind: "literal-main-fallback";
      readonly base: "main";
      readonly failedCandidates: readonly HookCommandRecord[];
      readonly nonClaims: NonEmptyReadonlyArray<D1NonClaimId>;
    };

type AffectedFeedbackResult =
  | { readonly kind: "pass"; readonly command: HookCommandRecord }
  | { readonly kind: "failed"; readonly command: HookCommandRecord }
  | {
      readonly kind: "blocked";
      readonly reason: "graph-facts-unavailable" | "target-contract-unavailable";
      readonly recovery: NonEmptyReadonlyArray<RecoveryInstruction>;
    };
```

D11 should allow explicit base, Graphite parent, merge-base fallback, and literal `main` fallback only as local feedback. Nx affected command failure must stay visible as `failed` or `blocked`; D11 must not turn graph failures into a successful local hook signal.

### Hook Trace And Compatibility

D11 should separate target trace from compatibility DTOs:

- Target contract: `LocalFeedbackTrace`, with terminal state, ordered stage results, command records, D1 non-claims, and schema authority.
- Legacy compatibility: existing `HookTrace`, `PreCommitTrace`, `PrePushTrace`, `PreCommitOutcome`, `PrePushOutcome`, and `HookCommandPhase`, unless D0 explicitly allows changing them.

Recommended D11 rule:

- If no D0 row exists for an exported hook type or human output line, implementation must preserve the old shape through a facade and build it from the target internal model.
- If D0 rows are added, D11 may require versioning or deprecation, but not silent replacement.
- The string currently named `localHookProofNotice` is legacy compatibility, not target language.

## Behavior-Preserving Refactor Slices

D11 should require these slices in order. Each slice has a compiler/test gate before the next slice starts.

1. Public surface inventory and D0 check.
   - Identify exported hook types, CLI output, JSON trace records, Husky hook entrypoints, docs examples, and package exports.
   - Gate: no code behavior changes. D11 remains blocked if D0 rows are absent and the implementation would change public shape or text.

2. Introduce internal resource gate union and constructors.
   - Add target constructors for allowed/refused resource states.
   - Keep existing `ResourceState` facade if public compatibility is unresolved.
   - Replace direct construction in `classifyResourcesState`.
   - Gate: hook tests, type check, and a new constructor/exhaustiveness test.

3. Derive commit permission.
   - Replace `resources.allowPreCommit` decisions with `allowsPreCommit(resourceGate)`.
   - Keep `allowPreCommit` only in the legacy projection if required.
   - Gate: hook tests prove no behavior drift for clean, staged gitlink, dirty submodule, unstaged gitlink, locked, uninitialized, and not-configured states.

4. Add target local feedback trace builder.
   - Build stage results and terminal state internally.
   - Project to existing `HookTrace` until D0 authorizes a public shape change.
   - Gate: existing trace tests plus new terminal-state/non-claim tests.

5. Extract stage-local functions after stage result types exist.
   - Extract staged path selection, file-layer feedback, partial staging decision, formatter restage decision, diagnostic feedback, and pre-push base decision.
   - Do not create generic artifact or stage framework.
   - Gate: hook tests after each extraction or tightly grouped pair.

6. Replace D6/D7 semantic reinterpretation.
   - Consume typed D6/D7 projections for Grit/check outcomes.
   - Keep regex message interpretation only as a temporary bridge if upstream projection implementation does not exist, and mark that bridge as a D11 blocker for final closure.
   - Gate: malformed Grit, Grit findings, adapter failure, projection-missed, and command failure tests.

7. Introduce pre-push base decision union.
   - Preserve current behavior but expose explicit provenance internally.
   - Gate: explicit base, Graphite parent, merge-base `main`, merge-base `origin/main`, literal `main`, and Nx affected failure tests.

8. Delete compatibility-only shapes only after D0 permits it.
   - Remove `allowPreCommit` from target code, proof-shaped names, and legacy optional DTO fields only when public compatibility has a documented preserve/version/facade/deprecate decision.
   - Gate: D0 rows plus hook tests plus OpenSpec validation.

## Allowed Write And Protected Path Recommendations

This investigation wrote only:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D11-typescript-state-investigation.md`

Recommended later implementation write set after D11 repair:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`
- narrowly-scoped hook source files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/` if D11 explicitly permits splitting after deletion/state collapse
- CLI hook command files only if public command behavior is D0-classified first
- adjacent docs/examples only if D11 implementation changes public behavior and D0 permits the documentation update

Protected paths for the D11 repair pass:

- source domino packets under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/`
- upstream D0, D1, D6, D7, D9, and D10 packet authorities, except to add cross-links through the owning process if explicitly requested
- generated outputs such as `dist/`, `mod/`, and generated baselines
- lockfiles and root package manager metadata
- protected-zone/generated-zone source except fixtures designed for tests
- D6/D7/D9/D10 core semantic implementation files unless D11 has a separately accepted dependency repair
- Civ7 runtime/product packages, because D11 is local Habitat feedback only

## Validation And Test Matrix

D11 should require the following validation oracle before implementation starts.

Resource state:

- every allowed variant constructs through the allowed constructor
- every refused variant constructs through the refused constructor
- `allowsPreCommit` is derived from the union tag
- impossible kind/allowance combinations cannot type-check in target code
- dirty submodule takes precedence over staged gitlink
- inspection failure is distinguishable from uninitialized resource state
- legacy `ResourceState.allowPreCommit`, if preserved, is produced only by projection

Partial staging:

- a Biome-supported file that is both staged and unstaged refuses before formatting
- no stash, checkout, reset, or hidden rewrite command is invoked
- refusal occurs before formatter restage, Biome check, Grit check, resource publish, or generated publish
- refusal gives local feedback and D1 non-claims

Formatter restage:

- only hash-changed Biome candidate paths are passed to `git add`
- unchanged Biome paths are not restaged
- foreign staged paths are not restaged
- foreign unstaged paths are not restaged
- formatter-created or formatter-deleted path behavior is explicitly covered
- restage failure reports attempted paths and does not continue into diagnostic checks

File-layer and protected/generated-zone stops:

- D10-origin refusal stops before Biome, Grit, generated publish, resource publish, and restage
- D11 consumes D7/D10 local-feedback-safe projection rather than parsing text
- generated/protected-zone refusal remains local feedback, not CI proof or generated freshness proof

Grit/Biome/Nx command results:

- Biome format failure fails local pre-commit
- Biome check failure fails local pre-commit
- Grit findings fail closed
- malformed Grit output fails closed as parse/adapter failure
- D6 adapter failure is consumed from projection, not regex over human text
- Nx affected failure fails local pre-push and preserves command result
- Nx graph or target contract absence is surfaced as failed/blocked, not hidden as success

Pre-push base:

- explicit base skips Graphite and merge-base probing
- Graphite parent is used when available
- merge-base `main` and `origin/main` fallback provenance is preserved
- literal `main` fallback is represented as a fallback state with non-claims
- affected command receives the chosen base and `HEAD`
- base decision does not claim Graphite readiness or CI equivalence

Trace and public compatibility:

- every terminal state includes D1 non-claims
- target trace stage sequence is closed and exhaustively matched
- compatibility trace, if retained, exactly matches current public tests
- human output does not add new proof claims
- any output text or exported DTO change has a D0 compatibility row

Recommended gates after each logical move:

- `bun test /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`
- root type check or the nearest Habitat Harness type-check target reported by `bun run habitat classify`
- `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`
- root `bun run openspec:validate`
- `git diff --check`

The exact root/package script names should be resolved through `package.json` and `habitat classify` during implementation. The D11 packet should define the oracle, not leave the executor to infer it.

## Findings Against Current D11 Packet

### P1: Target State Model Is Missing

The current D11 packet names local feedback goals but does not define the concrete resource gate, stage result, terminal state, trace, or compatibility model. This leaves implementation to decide whether `ResourceState.allowPreCommit`, `PreCommitOutcome`, `PrePushTrace`, `HookCommandPhase`, and `HookTrace` are target contracts, legacy compatibility, or internals.

Repair:

- Add a D11 design section named "Target State Model."
- Specify `ResourcePreCommitGate`, local terminal states, pre-commit stage results, pre-push base decision, and affected feedback result.
- State that commit allowance is derived from the resource gate union.
- State that current exported trace/outcome types are compatibility facades unless D0 rows authorize replacement.

### P1: Upstream Contract Consumption Is Underspecified

The packet says D11 consumes D7/D9/D10 but does not define the exact boundary. Current code can still parse D7/CheckReport output and infer Grit adapter failures from diagnostic message text.

Repair:

- Add explicit "Consumed Upstream Contracts" tables for D6, D7, D9, and D10.
- For each consumed projection, list the allowed local D11 decisions and forbidden reinterpretations.
- Require D11 to consume typed projection outcomes for diagnostic/check results.
- Mark any message-regex bridge as temporary compatibility and non-closable for final D11 unless upstream projection is unavailable by an accepted dependency deferral.

### P1: Public Compatibility Is Blocked Pending D0

The packet does not inventory hook public surfaces or require D0 rows before changing them. Relevant current surfaces include exported types, trace JSON shape, human output text, hook command entrypoints, and Husky integration.

Repair:

- Add a D0/D1 compatibility section.
- Inventory `HookTrace`, `PreCommitTrace`, `PrePushTrace`, `PreCommitOutcome`, `PrePushOutcome`, `HookCommandPhase`, hook CLI output, and hook command invocation.
- Require preserve/facade behavior until D0 rows exist.
- Treat `localHookProofNotice` as legacy compatibility wording, not target terminology.

### P1: Implementation Write Set And Protected Paths Are Missing

The packet does not constrain the future implementation write set. That leaves later execution free to edit unrelated source, upstream contracts, or packet control files.

Repair:

- Add an "Allowed Writes" section to D11.
- Name `hooks.ts`, `hooks.test.ts`, and narrowly-scoped adjacent hook files as the implementation write set.
- Protect upstream packet authorities, generated outputs, root package manager metadata, and unrelated product/runtime packages.

### P2: Pipeline Design Is Too Vague

The source domino asks for local hook feedback as a consumer of accepted contracts. The current packet does not decide whether the target is a typed pipeline model, stage result union, or smaller local result records.

Repair:

- Choose smaller local result records.
- Forbid generic artifact machinery in D11 unless a later accepted design proves repeated cross-domain need.
- Define stage records for resource gate, staged path selection, file-layer feedback, partial staging, formatter restage, diagnostic feedback, pre-push base, and affected feedback.

### P2: Pre-Push Base Semantics Need Provenance

The packet says Graphite-aware pre-push base resolution but does not define state/refusal implications. Current code can fall back to literal `main`, but the trace target does not encode why.

Repair:

- Define `PrePushBaseDecision`.
- Allow explicit base, Graphite parent, merge-base fallback, and literal `main` fallback as local feedback only.
- Require Nx affected failures to propagate.
- Route any canonical graph-target truth or target availability question to D3/Nx authority.

### P2: Partial Staging And Formatter Restage Need Normative Tests

The current tests cover the important behavior, but the D11 spec does not make it normative.

Repair:

- Add spec scenarios requiring partial staging refusal before formatting/restaging.
- Add spec scenarios requiring formatter restage to include only formatter-touched paths.
- Add a foreign-path restage regression scenario.
- Forbid stash/rewrite hidden behavior.

### P2: Resource Inspection Failure Needs Its Own Variant

The source domino names inspection failure. Current code overloads several inspection failures as `uninitialized`.

Repair:

- Add `inspection-failed` refused resource variant.
- Define which command inspection errors map to it.
- Preserve existing human recovery text only through compatibility projection if needed.

### P3: Phase Record Branch Is Stale

Current D11 phase record names branch `codex/deep-habitat-openspec-remediation`, but the actual active branch is `codex/d11-local-feedback-packet`.

Repair:

- Update D11 phase record only through the packet owner process, not in this scratch-only investigation.

### P3: Dry-Run And Help Gates Are Inconsistent

The source domino mentions a possible dry-run/local feedback behavior. The current D11 proposal validation gate mentions `bun run habitat hook pre-commit -- --help`, while current `HookOptions` only exposes `base?: string` and no dry-run model.

Repair:

- Decide whether dry-run is a public hook command contract.
- If yes, route through D0 and specify behavior.
- If no, remove dry-run expectations and keep help output as compatibility/invocation validation only.

### P3: Tasks Are Not Refactor Slices

Current tasks are broad design statements rather than behavior-preserving refactor moves.

Repair:

- Replace generic tasks with the ordered slices in this investigation.
- Add compiler/test/OpenSpec gates after each logical move.

## Exact Repair Recommendations By Artifact

### `proposal.md`

Add:

- D11 is a state-space collapse and local-feedback contract repair.
- D11 keeps Habitat generic and repo-local.
- D11 does not create proof authority.
- D11 success means later implementation has no remaining decisions about state model, public compatibility, write set, or validation oracle.

### `design.md`

Add:

- Target state model section.
- Consumed upstream contracts section for D1/D6/D7/D9/D10.
- D0/D1 compatibility section for exported types and human output.
- Local result record design, explicitly not generic artifact machinery.
- Pre-push base decision design.
- Partial staging and formatter restage write policy.
- Implementation write set and protected paths.
- Blocking decisions section naming unresolved D0 rows and projection dependencies.

### `tasks.md`

Replace broad tasks with ordered implementation-ready slices:

1. Inventory public hook surfaces and D0 rows.
2. Add resource gate target union and constructors.
3. Project target resource gate to legacy `ResourceState` if needed.
4. Add local feedback trace builder and compatibility facade.
5. Extract resource/staged/file-layer/partial/formatter/diagnostic/base/affected stage records.
6. Replace D6/D7 text parsing with projection consumption.
7. Add pre-push base decision union.
8. Add validation matrix tests.
9. Run and record gates.
10. Delete legacy compatibility only when D0 permits.

### `specs/habitat-harness/spec.md`

Add normative requirements and scenarios for:

- resource gate discriminated union with derived allowance
- no contradictory resource allowance states
- resource inspection failure refused state
- D10-origin refusal stops before downstream stages
- partial staging refused before formatting/restaging
- no stash/rewrite behavior
- formatter restage only formatter-touched paths
- foreign path restage regression
- D6/D7 projection consumption for Grit/check outcomes
- malformed Grit/adapter failure fail closed
- pre-push base provenance
- Nx affected failure propagation
- D1 non-claims in all hook terminal states
- public trace/output compatibility pending D0

### `workstream/phase-record.md`

After packet owner review, fix stale branch metadata and record that the D11 design gate remains blocked until the target state model, D0 compatibility decision, write set, and validation oracle are in the packet.

### `workstream/review-disposition-ledger.md`

Record P1 design blockers from this scratch investigation. Do not mark adversarial review complete until packet repairs address the model and compatibility gaps.

### `workstream/downstream-realignment-ledger.md`

Add downstream rows for:

- D0 public compatibility rows for hook output and trace/exported types
- D6/D7 projection availability for diagnostics/check consumption
- D3/Nx target/base authority for pre-push affected behavior if target list/base semantics exceed local feedback
- later implementation tests for state model and formatter restage

### `workstream/closure-checklist.md`

Do not check design readiness until:

- target state model is explicit
- public compatibility treatment is explicit
- upstream projection consumption is explicit
- write/protected paths are explicit
- validation matrix is explicit

## Stop Condition

D11 remains blocking because later implementation would still have to decide:

- the concrete state model for resource gate, hook terminal states, stage results, and pre-push base
- whether `PreCommitOutcome`, `PrePushTrace`, `HookCommandPhase`, and `HookTrace` are target contracts or legacy public compatibility
- whether and how `localHookProofNotice` can be renamed without violating D0
- the permitted source/test/doc write set
- the validation oracle for state-space collapse, formatter restage, partial staging, and upstream projection consumption
- whether D11 can consume accepted D6/D7/D9/D10 projections now or must carry a temporary compatibility bridge

Until those decisions are in the packet, D11 is not a complete implementation-ready design/specification authority.
