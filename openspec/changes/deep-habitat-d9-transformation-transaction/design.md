# Design: D9 Transformation Transaction

## Frame

D9 specifies the Transformation Transaction domain: Habitat's closed,
recoverable envelope for executing a D8-admitted structural rewrite. The product
goal is not a general command-record substrate and not another layer of
rewrite logic. The product goal is a reliable apply transaction that an agent
and human can understand, refuse, run, roll back, and recover from without
guessing which owner decided which fact.

Current code is evidence. It is not the target model. The current
`grit-apply.ts` module combines transaction sequencing, Grit invocation, source
root discovery, docs transform invocation, MapGen public-ops validation, Biome
handoff, optional gates, rollback, and a broad exported proof/result DTO. D9's
design reduces that state space by naming one transaction owner, accepting
upstream projections, and making illegal combinations unrepresentable.

## Solution Design

- **Frame:** rugged/high-commitment design space. A bad D9 packet would allow a
  write path to look safe while missing D8 admission, D10/G-HOST authority, or
  rollback recovery.
- **Aspiration threshold:** implementation agents can execute the packet without
  inventing state variants, public contract decisions, path authority,
  vendor boundaries, or validation oracles.
- **Constraint reality:** D0-D8 are accepted for design/specification only; D10
  and G-HOST are still blocking. D9 may design against D10/G-HOST projection
  inputs, but source implementation remains blocked wherever those live inputs
  are absent.
- **Rejected shortcut:** keep `GritApplyTransactionResult` as the target model
  and add more fields. That preserves flag soup, nullable command bags, and
  impossible success/failure combinations.

## Domain Boundary

The single owner is **D9 Transformation Transaction**.

D9 owns:

- explicit command intent, planning, live-write attempt, and rollback-probe
  construction;
- transaction admission after upstream projection inputs are present;
- dry-run inventory observation and classification into transaction states;
- approved write-set composition from D8 apply admission and D10/G-HOST path
  decisions;
- isolated-copy checks as transaction observations;
- live Grit apply orchestration;
- changed-path verification before and after write-capable handoffs;
- rollback after write-stage failures or rollback-probe requests;
- formatter and gate handoff state relation;
- terminal transaction outcome, recovery instructions, and command-facing
  transaction projection.

D9 does not own:

- D6 diagnostic acquisition, diagnostic identity, injected probes, or diagnostic
  adapter state;
- D8 pattern lifecycle, pattern admission, retirement, manifest acceptance, or
  candidate governance;
- D10 generated/protected-zone declaration, guard policy, or next-safe-action
  semantics;
- G-HOST host-specific policy, including Civ7/MapGen public-ops semantics;
- D11 hook sequencing, staged-file behavior, or local feedback rendering;
- D13 candidate generation contracts;
- Grit rewrite semantics or GritQL pattern syntax;
- Biome formatter/linter/import-sort semantics;
- Nx graph, target, scheduling, cache, or inferred-task semantics.

## Target Ontology

Use these target terms:

- `TransformationTransaction`
- `TransformationRequest`
- `DryRunIntent`
- `LiveWriteIntent`
- `LiveWriteAttempt`
- `ApplyAdmissionProjection`
- `TransactionAdmissionDecision`
- `WriteSet`
- `ApprovedWritePath`
- `PathApprovalDecision`
- `DryRunInventory`
- `InventoryParseFailure`
- `IsolatedCopyCheck`
- `LiveWriteAttempt`
- `RollbackAttempt`
- `FormatterHandoff`
- `GateHandoff`
- `TransactionRefusal`
- `TransactionOutcome`
- `RecoveryInstruction`
- `TransactionNonClaim`

Use `ApplyTransactionRecord` as the D1-aligned public meaning. Use `apply` only
for the CLI/native operation and `Transformation Transaction` for the D9 domain.

## Term Disposition

| Current term | Target disposition |
| --- | --- |
| `GritApplyTransactionOptions` | Removed package export. Target construction uses request variants. |
| `dryRun?: boolean` | Removed option flag. Target is `DryRunIntent` or `LiveWriteIntent`, followed by a D9-produced `LiveWriteAttempt` only after planning approves a write set. |
| `allowDirtyWorktree?: boolean` | Removed escape hatch. Target is explicit dirty-worktree state: dry-run allowed, live refused, isolated copy allowed. |
| `rollbackAfterApply?: boolean` | Removed test/probe flag. Target is rollback policy plus rollback outcome. |
| `gateCommands?: HabitatProcessRequest[]` | Compatibility injection seam. Target is declared `GateHandoff` input from pattern/host policy. |
| `GritApplyTransactionResult extends SpawnResult` | Removed output wrapper. Target is `ApplyTransactionRecord` / `TransactionOutcome`; process projection is derived. |
| `ok: boolean` | Rejected target shape. Use discriminated terminal outcomes. |
| `proof` / `GritApplyTransactionProof` | Removed proof language. Target is transaction record, outcome, command observation, recovery record, and non-claim. |
| `diffEvidence` | Compatibility detail. Target is isolated-copy diff observation or write-set diff observation. |
| `fileDigests` | Observation detail for rollback/recovery, not transaction identity. |
| `transactionCopyCommand` | Removed process-shaped name. Target is `IsolatedCopyCheck`. |
| `biomeCommand` | Removed process-shaped field. Target is `FormatterHandoff`. |
| `GritApplyDirtyWorktree` | Compatibility failure tag. Target is `dirty-worktree-refusal`. |
| `GritApplyDryRunMismatch` | Compatibility failure tag. Target distinguishes inventory parse failure, dry-run/copy mismatch, and unapproved inventory refusal. |
| `GritApplyUnexpectedFile` | Compatibility failure tag. Target distinguishes outside root, protected-zone refusal, create/delete not admitted, and unexpected live path. |
| `GritApplyMissingTargetExport` | Removed host/MapGen gate tag. Target is a G-HOST-declared apply gate failure/refusal. |
| `GritApplyRollbackFailed` | Compatibility failure tag. Target is `rollback-failed` with residual path and recovery state. |
| `HABITAT_REWRITE` | Current structured dry-run inventory protocol. Target is a pattern-owned inventory observation contract. |
| `approvedByPattern` | Removed field. Target consumes D8 apply admission and D9/D10 path decisions. |
| `classification: expected/pre-approved/rejected/blocked` | Removed labels. Target uses parsed observation, approved write, blocked write, or refusal states. |
| `mods/mod-swooper-maps/**` and `@mapgen/domain/**/ops` validation | Host-specific current evidence. Target consumes G-HOST/D10 gate declarations. |

## TypeScript State-Space Reduction

D9 collapses these smells from the TypeScript refactoring skill:

- flag/boolean soup in transaction options;
- optional-property soup in the proof/result bag;
- primitive obsession for pattern paths, repo paths, digests, command ids, D0
  surface ids, and non-claim ids;
- repeated branch logic for "command failed -> rollback -> transactionFailure";
- divergent change in the large `grit-apply.ts` module;
- inappropriate intimacy with MapGen public-ops semantics;
- whole-record leakage through exported proof-shaped DTOs.

Required safe moves:

- define the closed discriminated state model before extracting modules;
- parse native/vendor output at the boundary into observations;
- consume D8/D10/G-HOST projections instead of whole manifests or host paths;
- introduce branded ids for public/authority boundaries;
- use non-empty arrays for live write sets, blocked writes, recovery
  instructions, rollback paths, and D0 citations;
- remove old transaction exports;
- compile exhaustively with `never` guards in command rendering and downstream
  projection.

## Target State Families

### Request And Lifecycle

D9 separates user/CLI intent from the internal live-write attempt. The command
layer may construct only intent. D9 owns producing an approved write set from
D8 admission, dry-run/copy observations, and D10/G-HOST path decisions before
it constructs a live-write attempt.

```ts
type TransformationRequest =
  | DryRunIntent
  | LiveWriteIntent
  | LiveWriteAttempt
  | RollbackProbeRequest;

type DryRunIntent = {
  kind: "dry-run-intent";
  invocation: FixCommandInvocation;
  admission: ApplyAdmissionProjection;
  worktree: WorktreeObservation;
};

type LiveWriteIntent = {
  kind: "live-write-intent";
  invocation: FixCommandInvocation;
  admission: ApplyAdmissionProjection;
  worktree: WorktreeObservation;
};

type LiveWriteAttempt = {
  kind: "live-write-attempt";
  invocation: FixCommandInvocation;
  admission: ApplyAdmissionProjection;
  worktree: CleanWorktreeObservation;
  writeSetApproval: ApprovedWriteSet;
  rollbackPolicy: RollbackRequired;
  handoffPolicy: FormatterAndGateHandoffPolicy;
};

type RollbackProbeRequest = {
  kind: "rollback-probe";
  invocation: FixCommandInvocation;
  writeSetApproval: ApprovedWriteSet;
  rollbackPolicy: RollbackRequired;
};
```

No command parser may construct `LiveWriteAttempt` directly. No D9 constructor
may produce `LiveWriteAttempt` without D8 apply admission, D10/G-HOST path
decision where touched, a dry-run inventory precondition, approved write set,
and rollback policy.

### Admission

```ts
type TransactionAdmissionDecision =
  | { kind: "admitted-dry-run-intent"; request: DryRunIntent }
  | { kind: "admitted-live-write-intent"; request: LiveWriteIntent }
  | { kind: "admitted-live-write-attempt"; request: LiveWriteAttempt }
  | { kind: "refused"; refusal: TransactionRefusal };
```

Closed refusal reasons:

- `missing-apply-admission`
- `apply-admission-refused`
- `diagnostic-admission-only`
- `missing-transaction-input`
- `dirty-worktree`
- `invalid-request-mode`
- `missing-protected-zone-decision`
- `protected-zone-refused`
- `missing-host-policy`
- `host-apply-gate-refused`
- `write-path-outside-approved-set`
- `write-action-not-admitted`
- `formatter-handoff-not-declared`
- `gate-handoff-not-declared`
- `public-surface-compatibility-missing`

### Dry-Run Inventory

```ts
type DryRunInventoryOutcome =
  | { kind: "no-planned-edits"; observation: NativeApplyDryRunObservation }
  | { kind: "planned-approved-write-set"; inventory: DryRunInventory; writeSet: PlannedWriteSet }
  | { kind: "inventory-parse-failed"; failure: InventoryParseFailure }
  | { kind: "dry-run-command-failed"; observation: NativeApplyDryRunObservation }
  | { kind: "dry-run-interrupted"; observation: NativeApplyDryRunObservation }
  | { kind: "dry-run-copy-mismatch"; dryRun: NativeApplyDryRunObservation; copy: IsolatedCopyCheck }
  | { kind: "isolated-copy-refused"; copy: IsolatedCopyCheck; refusal: TransactionRefusal };
```

Dry-run success does not imply live-write success. Native Grit output is an
observation that D9 classifies after D8 admission and D10/G-HOST path authority
are present.

### Write Set And Path Decision

```ts
type WriteSetApproval =
  | { kind: "approved"; id: ApprovedWriteSetId; entries: NonEmptyArray<ApprovedRewrite>; paths: NonEmptyArray<ApprovedWritePath>; source: "structured-inventory" | "isolated-copy" | "docs-dry-run"; admission: ApplyAdmissionProjection; pathDecision: PathApprovalProjection }
  | { kind: "empty"; reason: "zero-matches" | "docs-no-matches" }
  | { kind: "refused"; refusal: TransactionRefusal; blocked: NonEmptyArray<BlockedRewrite | BlockedDiffChange> };

type PathApprovalDecision =
  | { kind: "approved"; path: ApprovedWritePath; action: "modify" | "create" | "delete"; source: "apply-admission-and-zone-policy" }
  | { kind: "refused"; path: RepoRelativePath; reason: PathRefusalReason };
```

Create/delete are refused unless D8 admission explicitly includes create/delete
capability and D9 specifies cleanup/rollback mechanics for that capability.

### Live Write

```ts
type LiveWriteOutcome =
  | { kind: "not-run"; reason: "dry-run-only" | "no-planned-edits" | "admission-refused" }
  | { kind: "write-succeeded"; changedPaths: NonEmptyArray<ApprovedWritePath> }
  | { kind: "write-failed-before-observable-change"; observation: NativeApplyObservation }
  | { kind: "write-failed-after-observable-change"; observation: NativeApplyObservation; rollback: RollbackOutcome }
  | { kind: "unexpected-path-after-write"; changedPaths: NonEmptyArray<RepoRelativePath>; rollback: RollbackOutcome };
```

D9 must verify changed paths after native apply and after each write-capable
handoff. A path drift after Biome is still a transaction failure.

### Formatter And Gate Handoffs

```ts
type FormatterHandoffOutcome =
  | { kind: "not-run"; reason: "no-changed-paths" | "live-write-not-run" }
  | { kind: "succeeded"; formatter: "biome"; observation: FormatterCommandObservation; nonClaims: NonEmptyArray<TransactionNonClaim> }
  | { kind: "failed"; formatter: "biome"; observation: FormatterCommandObservation; rollback: RollbackOutcome };

type GateHandoffOutcome =
  | { kind: "not-run"; reason: "no-declared-gates" | "live-write-not-run" }
  | { kind: "succeeded"; gateId: GateId; owner: "host-policy" | "pattern-governance" | "transaction"; observation: GateCommandObservation; nonClaims: NonEmptyArray<TransactionNonClaim> }
  | { kind: "failed"; gateId: GateId; owner: "host-policy" | "pattern-governance" | "transaction"; observation: GateCommandObservation; rollback: RollbackOutcome };
```

Formatter and gate outcomes are handoffs. They do not prove apply safety,
current-tree cleanliness, runtime behavior, or vendor semantics beyond the
specific command result.

### Rollback And Recovery

```ts
type RollbackOutcome =
  | { kind: "not-needed"; reason: "no-source-write" | "no-changed-paths" }
  | { kind: "succeeded"; command: CommandExecutionRecord; revertedPaths: NonEmptyArray<ApprovedWritePath>; postState: CleanWorktreeObservation }
  | { kind: "failed"; command: CommandExecutionRecord; dirtyPaths: NonEmptyArray<RepoRelativePath>; recovery: NonEmptyArray<RecoveryInstruction> };

type RecoveryInstruction =
  | { kind: "restore-worktree"; command: "git status --short --branch" | "git checkout -- <paths>"; paths?: NonEmptyArray<RepoRelativePath> }
  | { kind: "rerun-dry-run"; command: "bun run habitat fix --dry-run" }
  | { kind: "repair-pattern-authority"; target: ApplyAdmissionProjectionId }
  | { kind: "repair-protected-zone-decision"; target: D10ProtectedZoneDecisionId }
  | { kind: "run-gate-manually"; commandId: CommandId };
```

Rollback failure is terminal and visible. Current rollback uses Git tracked-file
checkout; D9 must not claim filesystem transaction cleanup for untracked create
or delete effects unless that capability is separately designed.

### Terminal Outcome

```ts
type TransactionOutcome =
  | { kind: "dry-run-clean"; inventory: Extract<DryRunInventoryOutcome, { kind: "no-planned-edits" }>; nonClaims: NonEmptyArray<TransactionNonClaim> }
  | { kind: "dry-run-planned"; inventory: Extract<DryRunInventoryOutcome, { kind: "planned-approved-write-set" }>; nonClaims: NonEmptyArray<TransactionNonClaim> }
  | { kind: "refused"; refusal: TransactionRefusal; recovery: NonEmptyArray<RecoveryInstruction> }
  | { kind: "applied"; live: Extract<LiveWriteOutcome, { kind: "write-succeeded" }>; formatter: FormatterHandoffOutcome; gates: readonly GateHandoffOutcome[]; nonClaims: NonEmptyArray<TransactionNonClaim> }
  | { kind: "rolled-back"; failedStage: "live-write" | "formatter-handoff" | "gate-handoff"; rollback: Extract<RollbackOutcome, { kind: "succeeded" }>; recovery: NonEmptyArray<RecoveryInstruction> }
  | { kind: "rollback-failed"; failedStage: "live-write" | "formatter-handoff" | "gate-handoff" | "explicit-rollback"; rollback: Extract<RollbackOutcome, { kind: "failed" }>; recovery: NonEmptyArray<RecoveryInstruction> };
```

## Branded Identifiers And Non-Empty Collections

Required brands:

| Brand | Purpose |
| --- | --- |
| `PatternId` | Distinguish D6 diagnostic ids, D8 admitted apply patterns, and raw Grit pattern paths. |
| `GritPatternPath` | Prevent arbitrary repo paths from being passed as apply patterns. |
| `RepoRelativePath` | Keep absolute host paths, copy-root paths, and repo-relative write paths separate. |
| `ApprovedWritePath` | Prevent observed changed paths from being treated as approved before D8/D10/D9 checks. |
| `ApprovedWriteSetId` | Link live writes, formatter handoff, gates, and rollback to one approval. |
| `CommandId` | Prevent free-form gate command ids from becoming behavior selectors. |
| `Sha256Digest` | Keep digests distinct from arbitrary strings. |
| `D0SurfaceId` | Require public contract citation. |
| `D1NonClaimId` | Use canonical non-claims, not prose arrays. |
| `ApplyAdmissionProjectionId` | Consume D8 admission without owning governance. |
| `D10ProtectedZoneDecisionId` | Consume D10 policy without reimplementing it. |

Required non-empty arrays:

- approved writes in a live write set;
- blocked writes in a refusal;
- rollback changed paths;
- recovery instructions for refusals and rollback failures;
- gate command records when gates ran;
- D0 surface ids on package exports, commands, and durable outputs touched by D9.

## Vendor Boundary

| Owner | D9 relation |
| --- | --- |
| Grit | Owns GritQL/pattern syntax, native matching, native `grit apply`, native output behavior, and pattern fixture tests. D9 selects pattern paths and roots, records command outcomes, and classifies observations. |
| Biome | Owns formatter/linter/import-sort behavior for `biome check --write`. D9 records formatter handoff success/failure and rollback relation. |
| Git | Owns status and checkout command behavior. D9 records worktree observations and rollback command outcome. |
| Nx | Owns graph/target/scheduling/cache semantics. D9 records explicit gate command outcomes only when gates are declared. |
| Habitat D9 | Owns transaction sequencing, write-set approval, changed-path verification, rollback relation, recovery instructions, and public transaction projection. |

## Current Write And Protected Surface Evidence

Current source roots are discovered from `mods/*/src/{recipes,maps}`. The
current source pattern further limits rewrites to TypeScript paths under those
roots. This is present behavior, not permanent generic authority.

Current docs rewrite behavior applies a Grit-owned Markdown pattern to exact
candidate Markdown files under `docs/**/*.md`; D9 should preserve the exact-root
contract and avoid raw `docs/` scans for transform execution.

Current generated/protected risk: `mods/*/src/maps/**` overlaps
`mods/mod-swooper-maps/src/maps/generated/**`. D9 source implementation must
consume D10/G-HOST decisions and refuse generated/protected paths before live
write. This cannot remain an implicit root filter.

Current host-specific risk: `validateAppliedTargetExports()` hard-codes
`@mapgen/domain/**/ops` and `mods/mod-swooper-maps/**` public ops targets inside
generic transaction code. D9 target design requires that behavior to move behind
a G-HOST-declared apply gate or remain source-blocked.

## Public Compatibility Decisions

D9 does not add `habitat fix --json` by default. Current `fix` supports
`--dry-run` only. A JSON output surface is a separate D0-controlled public
contract decision:

- if preserved, D9 keeps human stdout/stderr behavior and exposes any new target
  record only through an explicit D0-backed public surface;
- if versioned or added, D9 must define schema version, terminal `kind` field,
  non-claim ids, recovery shape, and bad-case JSON tests;
- old `GritApplyTransactionProof` remains removed unless a later packet
  explicitly creates a D0-backed replacement;
- if deferred, remove any `--json` validation gate from D9 and record the owner
  of that later decision.

Until D0 rows exist, source implementation remains blocked for changes to
`habitat fix` output/exit behavior and exported `GritApply*` types/functions.

## Module Ownership For Later Implementation

| Responsibility | D9 target module/domain | Must not own |
| --- | --- | --- |
| Transaction lifecycle and terminal outcomes | D9 transaction module, e.g. `apply-transaction.ts` | Grit rewrite semantics, D8 admission, D10 policy, host semantics. |
| Native Grit apply invocation/observation | Grit adapter boundary | Write approval, rollback, formatter/gate state. |
| Pattern apply admission | D8 `ApplyAdmissionProjection` | Live-write safety and rollback. |
| Protected/generated path decision | D10/G-HOST projection | Native apply invocation and formatter/gate execution. |
| Write-set approval composition | D9 write-set module | Host-specific public-ops validation unless declared as a gate. |
| Formatter handoff | Formatter handoff adapter | Transaction success semantics or product correctness. |
| Gate handoff | Gate handoff adapter | Gate declaration ownership. |
| CLI request/rendering | `fix` command / command engine | Transaction authority. |
| Removed transaction exports | D0/D1 removal rows | Target transaction model source of truth. |

## Downstream Projections

D11 may consume only a local-feedback-safe projection:

- transaction unavailable/refused/dry-run/applied/rolled-back/rollback-failed;
- recovery instructions;
- non-claims that hook success is not safe-apply completion, CI, review, or
  runtime/product correctness.

D13 may consume transaction-input prerequisites for future apply-capable
candidate generation, but D13 does not gain write authority.

D15 is not triggered by D9 unless D9 final design records a concrete
contradiction that cannot be represented inside D9-owned transaction records.

## Implementation Readiness

D9 is implementation-ready only after:

- final D9 rereviews record no unresolved P1/P2 findings;
- D0 public contract rows exist for every touched public/durable surface;
- D8 live apply-admission projection exists where D9 consumes apply admission;
- D10/G-HOST live path/host projections exist where D9 touches protected,
  generated, or host-specific surfaces;
- D9 tasks and validation gates are copied into the implementation phase record;
- packet index marks D9 accepted for design/specification only.
