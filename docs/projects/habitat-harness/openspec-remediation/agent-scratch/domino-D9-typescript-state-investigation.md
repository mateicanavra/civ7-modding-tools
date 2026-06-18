# D9 TypeScript State-Space Investigation

## Verdict

D9 is blocked from TypeScript state-space acceptance until the OpenSpec packet specifies a closed transformation-transaction model. The current incomplete packet names dry-run, live write, rollback, formatter handoff, path approval, and recovery, but it does not define the exact discriminated unions, branded identifiers, non-empty collections, module ownership, D0/D1 compatibility citations, or falsifying tests that implementation must follow.

The simpler model is an `ApplyTransactionRecord` union built from separately owned projections: requested mode, D8 apply admission, D10 path/protected-zone approval, Grit adapter observations, write-set approval, live write result, rollback result, formatter handoff, selected gate handoff, refusal, and recovery instruction. Legacy `GritApplyTransactionProof` can remain only as a D0/D1 compatibility wrapper around that record.

## Current Impossible States

Current evidence is `tools/habitat-harness/src/lib/grit-apply.ts`, `tools/habitat-harness/src/lib/command-engine.ts`, `tools/habitat-harness/src/commands/fix.ts`, `tools/habitat-harness/src/index.ts`, and `tools/habitat-harness/test/lib/grit-apply.test.ts`.

| Current shape | Impossible states admitted | Required D9 collapse |
| --- | --- | --- |
| `GritApplyTransactionOptions` with `dryRun?`, `allowDirtyWorktree?`, `rollbackAfterApply?`, and `gateCommands?` | Dry-run request can also request rollback-after-apply; live write can be constructed without D8 admission; dirty-live exception can be set without isolated transaction semantics; arbitrary gate commands can be injected without host/pattern declaration. | Replace with request variants: `DryRunApplyRequest`, `LiveApplyRequest`, `RollbackProbeRequest`, and `FormatterOrGateHandoffRequest`; no optional mode flags. |
| `GritApplyTransactionResult extends SpawnResult` with `ok: boolean`, nullable `failureTag`, and always-present `proof` | `ok: true` with a failure tag is structurally valid; `ok: false` can carry success-looking `exitCode` if manually constructed; command stdout/stderr can imply success while rollback failed. | Replace with `ApplyTransactionOutcome = DryRunOutcome | LiveCommittedOutcome | RefusedOutcome | FailedRolledBackOutcome | FailedRollbackFailedOutcome`; legacy `SpawnResult` projection is derived, not authoritative. |
| `GritApplyTransactionProof` with nullable `dryRunCommand`, `applyCommand`, `biomeCommand`, `rollbackCommand`, `transactionCopyCommand`, optional arrays, and free `appliedDiff` string | Rollback command can exist without a rollback state; live apply command can be absent from live success; dry-run can carry live changed paths; success can carry failed formatter/gate command; applied diff can exist without approved write set. | Replace with state-specific record members. Fields appear only in the state that owns them. |
| `GritApplyRewriteInventoryEntry` with `approvedByPattern`, `classification`, optional `failureTag`, optional `failureReason` | `approvedByPattern: true` with `classification: blocked`; `classification: pre-approved` plus failure tag; `approvedByPattern: false` without refusal reason; `classification: expected` leaking past parsing. | Split parser DTO from approval result: `ParsedRewriteObservation` then `WriteSetApprovalEntry = ApprovedRewrite | RejectedRewrite | BlockedRewrite`. |
| `GritApplyDiffEvidence` with `classification` plus optional failure fields | `pre-approved` diff with failure reason; blocked diff without reason; create/delete approvals are not typed as impossible versus explicitly admitted. | Use `ApprovedModificationDiff` versus `BlockedDiffChange`; create/delete are blocked unless D8 admission explicitly provides a create/delete capability variant. |
| `ParsedInventory` with `ok` boolean | Same boolean-result smell as transaction result; parser failure and zero-match success are not semantically distinct enough for dry-run outcome. | Use `InventoryParseResult = StructuredInventory | ZeroMatchInventory | AmbiguousInventoryRefusal | MalformedInventoryFailure`. |
| `IsolatedCopyApplyProof` with `ok` boolean and repeated evidence fields | Copy command failure, diff approval failure, missing target export, and success all share mostly the same bag of fields. | Use `IsolatedCopyOutcome = CopyProducedApprovedWriteSet | CopyRefusedByPathApproval | CopyRefusedByTargetExport | CopyCommandFailed`. |
| `rollbackApplyTransaction` returns `{ command, failureTag, message }` | Rollback skipped, rollback succeeded, and rollback failed are encoded by nullable fields; a failed rollback can be accidentally ignored by a caller. | Use `RollbackOutcome = NotNeeded | Succeeded | Failed`; failed rollback is its own terminal transaction outcome. |
| `runFix({ dryRun?: boolean })` and `fix --dry-run` | Command mode remains an optional boolean, so command construction can still default into live write. | Command layer must construct one explicit request variant from CLI flags before entering D9 transaction state. |
| `src/index.ts` exports `GritApplyTransactionOptions`, `GritApplyTransactionProof`, and `GritApplyTransactionResult` | Internal transaction mechanics are public package-export candidates; proof-shaped names can become target language accidentally. | D9 must cite D0 package-export rows and D1 legacy wrapper rules before changing or preserving these exports. |

Named TypeScript smells from the refactoring skill:

- Flag/boolean soup and long parameter list: `dryRun`, `allowDirtyWorktree`, `rollbackAfterApply`, `gateCommands`.
- Optional-property soup and temporary fields: nullable command members in the proof bag.
- Primitive obsession: raw strings for pattern paths, roots, changed paths, command ids, digests, non-claim identifiers, and failure reasons.
- Switch/missing model: repeated `if command failed -> rollback -> transactionFailure` branches instead of a closed transaction transition model.
- Large module/divergent change: `grit-apply.ts` owns adapter invocation, write-set approval, MapGen export validation, docs rewrite handling, formatter handoff, gates, rollback, command result rendering, and legacy proof construction.
- Feature envy/inappropriate intimacy: transaction code validates MapGen public ops exports directly instead of consuming a host/pattern gate projection.
- Broad proof DTO and whole-record leakage: `GritApplyTransactionProof` is exported and always present, so consumers can depend on internals that should be state-specific projections.

Safe refactor moves D9 must require:

- Replace type code/flags with discriminated unions plus `never` exhaustiveness.
- Introduce branded identifiers for pattern ids, pattern paths, repo-relative paths, approved write-set ids, command ids, SHA-256 digests, D0 surface ids, and D1 non-claim ids.
- Introduce non-empty arrays for values that are only valid when present: approved writes, blocked writes, gate handoffs, recovery actions, rollback changed paths, and D0 citations.
- Extract modules by responsibility after the type model exists.
- Parse at the boundary: Grit stdout becomes observations, D8/D10 projections become typed authority inputs, and process results become handoff records.
- Keep legacy public names only as D0/D1 compatibility facades.

## Required Target Type-State Model

The packet should require these target names or equally explicit aliases. Implementation may choose file names, but may not collapse these states back into nullable fields.

```ts
type ApplyTransactionRequest =
  | DryRunApplyRequest
  | LiveApplyRequest
  | RollbackProbeRequest;

type DryRunApplyRequest = {
  kind: "dry-run";
  invocation: FixCommandInvocation;
  admission: ApplyAdmissionProjection;
  worktree: WorktreeObservation;
};

type LiveApplyRequest = {
  kind: "live";
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

`allowDirtyWorktree` is not a boolean option. Dirty worktree states are:

- `DryRunDirtyWorktreeAllowed`: dry-run may proceed and remains non-writing.
- `LiveDirtyWorktreeRefusal`: live apply refuses before Grit.
- `IsolatedCopyDirtyWorktreeAllowed`: isolated copy may run because it does not mutate the source tree.

The dry-run outcome union:

```ts
type DryRunOutcome =
  | { kind: "no-matches"; dryRun: GritDryRunObservation; docsDryRun?: DocsDryRunObservation; nonClaims: NonEmptyArray<NonClaimId> }
  | { kind: "planned-approved-writes"; dryRun: GritDryRunObservation; writeSetApproval: ApprovedWriteSet; isolatedCopy: IsolatedCopyApproved; nonClaims: NonEmptyArray<NonClaimId> }
  | { kind: "parse-refusal"; refusal: InventoryParseRefusal; recovery: NonEmptyArray<RecoveryInstruction> }
  | { kind: "approval-refusal"; refusal: WriteSetRefusal; recovery: NonEmptyArray<RecoveryInstruction> };
```

The live outcome union:

```ts
type LiveTransactionOutcome =
  | { kind: "committed"; writeSet: AppliedWriteSet; formatter: FormatterHandoffSucceeded | FormatterHandoffSkipped; gates: GateHandoffSucceeded | GateHandoffSkipped; postState: DirtyPostApplyObservation; nonClaims: NonEmptyArray<NonClaimId> }
  | { kind: "failed-rolled-back"; failure: ApplyFailure | FormatterFailure | GateFailure | UnexpectedPathFailure; rollback: RollbackSucceeded; recovery: NonEmptyArray<RecoveryInstruction> }
  | { kind: "failed-rollback-failed"; failure: ApplyFailure | FormatterFailure | GateFailure | UnexpectedPathFailure; rollback: RollbackFailed; recovery: NonEmptyArray<RecoveryInstruction> }
  | { kind: "refused-before-write"; refusal: DirtyWorktreeRefusal | ProtectedPathRefusal | AdmissionRefusal | EmptyWriteSetRefusal; recovery: NonEmptyArray<RecoveryInstruction> };
```

Write-set approval:

```ts
type WriteSetApproval =
  | { kind: "approved"; id: ApprovedWriteSetId; entries: NonEmptyArray<ApprovedRewrite>; paths: NonEmptyArray<ApprovedRepoPath>; source: "structured-inventory" | "isolated-copy" | "docs-dry-run"; d8Admission: ApplyAdmissionProjection; d10PathDecision: PathApprovalProjection }
  | { kind: "empty"; reason: "zero-matches" | "docs-no-matches" }
  | { kind: "refused"; refusal: WriteSetRefusal; blocked: NonEmptyArray<BlockedRewrite | BlockedDiffChange> };
```

Rollback outcome:

```ts
type RollbackOutcome =
  | { kind: "not-needed"; reason: "no-source-write" | "no-changed-paths" }
  | { kind: "succeeded"; command: CommandExecutionRecord; revertedPaths: NonEmptyArray<ApprovedRepoPath>; postState: CleanWorktreeObservation }
  | { kind: "failed"; command: CommandExecutionRecord; dirtyPaths: NonEmptyArray<RepoRelativePath>; recovery: NonEmptyArray<RecoveryInstruction> };
```

Formatter/gate handoff outcome:

```ts
type FormatterHandoffOutcome =
  | { kind: "skipped"; reason: "no-changed-paths" }
  | { kind: "succeeded"; command: CommandExecutionRecord; formattedPaths: NonEmptyArray<ApprovedRepoPath>; nonClaims: NonEmptyArray<NonClaimId> }
  | { kind: "failed"; command: CommandExecutionRecord; rollback: RollbackOutcome; recovery: NonEmptyArray<RecoveryInstruction> };

type GateHandoffOutcome =
  | { kind: "skipped"; reason: "no-selected-gates" }
  | { kind: "succeeded"; commands: NonEmptyArray<CommandExecutionRecord>; nonClaims: NonEmptyArray<NonClaimId> }
  | { kind: "failed"; failedGate: CommandExecutionRecord; completedBeforeFailure: readonly CommandExecutionRecord[]; rollback: RollbackOutcome; recovery: NonEmptyArray<RecoveryInstruction> };
```

Recovery/refusal outcome:

```ts
type TransactionRefusal =
  | DirtyWorktreeRefusal
  | InventoryParseRefusal
  | AdmissionRefusal
  | WriteSetRefusal
  | ProtectedPathRefusal
  | MissingTargetExportRefusal
  | HostGateRefusal;

type RecoveryInstruction =
  | { kind: "restore-worktree"; command: "git status --short --branch" | "git checkout -- <paths>"; paths?: NonEmptyArray<RepoRelativePath> }
  | { kind: "rerun-dry-run"; command: "bun run habitat fix --dry-run" }
  | { kind: "repair-pattern-authority"; target: ApplyAdmissionProjectionId }
  | { kind: "repair-protected-zone-decision"; target: D10ProtectedZoneDecisionId }
  | { kind: "run-gate-manually"; commandId: CommandId };
```

Every union must have an exhaustive switch in command rendering and legacy compatibility projection. A compile-time `never` guard is mandatory for those projections.

## Branded Identifiers And Non-Empty Collections

D9 should require these brands so raw strings do not cross authority boundaries:

| Brand | Prevents |
| --- | --- |
| `PatternId` | Confusing a D6 diagnostic pattern, D8 admitted apply pattern, and raw Grit path. |
| `GritPatternPath` | Passing arbitrary repo paths to Grit apply. |
| `RepoRelativePath` | Mixing absolute host paths, copy-root paths, and repo-relative write paths. |
| `ApprovedRepoPath` | Treating observed changed paths as approved write paths before D10/D8 checks. |
| `ApprovedWriteSetId` | Linking rollback/formatter/gates to a concrete approval rather than a loose array. |
| `CommandId` | Free-form gate command ids becoming untyped behavior selectors. |
| `Sha256Digest` | Distinguishing digests from arbitrary strings. |
| `D0SurfaceId` | Public compatibility citation must point at an accepted D0 row. |
| `D1NonClaimId` | Non-claims remain canonical identifiers, not prose blobs. |
| `ApplyAdmissionProjectionId` | D9 consumes D8 admission without owning D8 governance. |
| `D10ProtectedZoneDecisionId` | D9 consumes D10 path/protected-zone authority without reimplementing it. |

Required non-empty arrays:

- `NonEmptyArray<ApprovedRewrite>` for approved live write sets.
- `NonEmptyArray<BlockedRewrite | BlockedDiffChange>` for refusal caused by blocked paths or unapproved pattern output.
- `NonEmptyArray<ApprovedRepoPath>` for live changed paths, rollback paths, formatter paths, and applied write sets.
- `NonEmptyArray<RecoveryInstruction>` for every refusal or failed rollback state.
- `NonEmptyArray<CommandExecutionRecord>` for selected gates that actually ran.
- `NonEmptyArray<D0SurfaceId>` on public compatibility wrappers touched by D9.

Required projections:

- `ApplyAdmissionProjection` from D8: pattern identity, manifest path, admitted apply capability, required dry-run/no-write/diff/rollback/type-test/protected-path inputs, and non-claims.
- `PathApprovalProjection` from D10: allowed roots, protected/generated-zone decision, host-policy reference if applicable, and refusal reason when blocked.
- `GritAdapterObservation` from adapter invocation: command record, stdout/stderr digests, parse status, match count, structured rewrite observations.
- `ApplyTransactionRecord` from D9: the state-specific public command record.
- `LegacyGritApplyTransactionProof` from D1/D0: compatibility projection only; cannot be the source of truth.

## Module Ownership

D9 must specify ownership at module-boundary level before code work:

| Responsibility | Owning module/domain | Must not own |
| --- | --- | --- |
| Transaction lifecycle, state machine, terminal outcomes, rollback relation, recovery instructions | D9 Transformation Transaction, e.g. `apply-transaction.ts` | Grit stdout parsing details, D8 pattern admission, D10 protected-zone policy, Biome semantics. |
| Grit adapter invocation and stdout/stderr parsing | Grit adapter/D6-adjacent adapter module, e.g. `grit-apply-adapter.ts` | Write approval, rollback, formatter/gate success, command public transaction shape. |
| Pattern apply admission | D8 Pattern Governance projection | Live-write safety or rollback behavior. |
| Path approval and protected/generated-zone refusal | D10 Protected Zone Authority projection | Grit invocation or formatter/gate execution. |
| Write-set approval composition | D9, consuming D8 and D10 projections, e.g. `apply-write-set.ts` | Source-specific MapGen validation unless delivered as a host/pattern gate projection. |
| MapGen public ops validation currently inline in `grit-apply.ts` | Host/pattern-specific gate declared by D8/G-HOST/D10, then consumed by D9 as a gate result | Generic transaction module. |
| Biome handoff | Formatter handoff adapter, e.g. `formatter-handoff.ts` | Apply safety or product/runtime proof. Biome returns formatting command outcome only. |
| Selected type/test gates | Gate handoff adapter, e.g. `apply-gates.ts` | Rollback semantics; gate failure hands back to D9 transaction state. |
| CLI flag parsing and exit projection | Command layer (`commands/fix.ts`, `command-engine.ts`) | Transaction authority; it constructs a request variant and renders D9 outcome. |
| Package export compatibility | D0/D1 constrained facade in `src/index.ts` | Target transaction model unless D0 classifies the export as safe to version/rename. |

This is an Extract Module move by responsibility, but extraction is only safe after the DU state model exists. Splitting the current file first would rearrange complexity without deleting it.

## D0/D1 Compatibility Constraints

D9 implementation must cite D0 rows before changing any public or durable surface. Required row families:

- CLI verb and flag rows for `habitat fix` and `habitat fix --dry-run`.
- Command behavior/human output rows for dry-run, refusal, rollback, formatter/gate failure, and success text.
- Command JSON rows if D9 adds or changes JSON output.
- Package-export rows for `GritApplyTransactionOptions`, `GritApplyTransactionProof`, `GritApplyTransactionResult`, `GritApplyRewriteInventoryEntry`, `runGritApplyTransaction`, `parseApplyRewriteInventory`, and `classifyApplyRewriteInventory`.
- Docs-example rows for any command examples or output guidance touched by D9.
- Test-only rows for fixture-only helpers if they are moved or renamed.

D0 design requires every row to carry `surface_id`, `plane`, `contract_state`, closed `compatibility_handling`, and typed relationships. D0 also names proof/evidence-shaped names as compatibility facts, not target language.

D1 already sets the semantic boundary:

- Target object is `ApplyTransactionRecord`.
- `GritApplyTransactionProof` remains only a D0-backed legacy name under `preserve`, `version`, or `facade`.
- D9 owns apply lifecycle and rollback behavior.
- D1 owns shared non-claims, relationships, and compatibility wrapper rules.
- Failed apply states must use `rolled-back-by` when rollback runs.
- Canonical non-claim ids must be used; prose-only non-claims are not enough.

Therefore D9 may define transaction behavior and state shape, but must not create a generic proof substrate, redefine D1 receipt vocabulary, or silently rename exported proof-shaped types without D0/D1 citation.

## Tests That Must Falsify False-Green Transaction States

The packet's validation section should require tests with explicit bad cases, not only green command runs.

| Test/oracle | False green it must catch |
| --- | --- |
| Type-level construction tests for `ApplyTransactionOutcome` and `ApplyTransactionRequest` | `ok: true` plus `failureTag`; live success without apply command; rollback command outside rollback state; dry-run request with rollback-after-apply; live request without D8 admission or D10 approval. |
| Legacy projection test | `GritApplyTransactionProof` wrapper cannot report success if target `ApplyTransactionRecord` is refusal/failure; D0 surface ids are present for compatibility wrappers. |
| Dirty live refusal test | Live apply against dirty worktree refuses before any Grit command. Current test covers this and should be retained against the new request variant. |
| Dirty dry-run test | Dry-run on dirty worktree remains a dry-run outcome, not live apply safety. Current test covers behavior but should assert the new `kind`. |
| Ambiguous dry-run test | Dry-run reports matches but isolated copy produces no diff; outcome is parse/approval refusal, not success with empty changed paths. |
| Unstructured output parse test | Non-empty Grit output that is neither zero-match nor structured inventory fails closed. |
| Unapproved inventory test | Pattern output with `approved=false` cannot become an approved write-set entry and must carry a recovery instruction. |
| Unexpected path test | Live apply changes a path outside the approved write set; rollback runs and terminal state is failure, never committed. |
| D10 protected/generated-zone test | A generated/protected-zone write is refused through D10 projection; D9 does not best-effort skip or self-authorize the path. |
| Create/delete without explicit admission test | Isolated copy create/delete inside an approved root is blocked unless D8 admission explicitly includes create/delete capability. Current tests cover block behavior; packet must require the capability rule. |
| Missing target export / host gate test | Current inline MapGen export validation must become a declared gate or host projection; failure is a gate/refusal outcome, not generic Grit failure. |
| Biome failure test | Biome handoff failure after writes triggers rollback and cannot be reported as apply safety or product proof. Current test covers rollback but should assert formatter-specific state. |
| Selected gate failure test | Gate failure after writes triggers rollback; failed gate identity is preserved and earlier gate successes do not imply transaction success. |
| Rollback succeeded test | Failed apply/formatter/gate with successful rollback reports `failed-rolled-back`, includes `rolled-back-by`, and final clean observation. |
| Rollback failed test | Failed rollback reports `failed-rollback-failed`, includes dirty paths and recovery instructions, and cannot carry success exit projection. |
| Public command projection test | `habitat fix --dry-run` output and exit code are derived from dry-run outcome only; live apply states never appear in dry-run output. |
| Non-claim test | Apply success includes D1 non-claims such as not runtime/product/current-tree clean proof; formatter/gate success cannot erase them. |

The focused suite remains `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`, but D9 should also require command-layer tests for `commands/fix.ts` and export/compatibility tests if `src/index.ts` changes. OpenSpec validation alone is not enough.

## Packet Repairs Required Before Acceptance

The D9 OpenSpec packet should be repaired before any source implementation:

1. Replace the generic target-contract text with the closed request/outcome/approval/rollback/handoff/refusal model above.
2. Add an ownership table that protects D8 admission, D10 path/protected-zone authority, Grit adapter parsing, Biome handoff, and host-specific gates from being redefined inside generic transaction code.
3. Add a D0/D1 compatibility table listing every public surface D9 may touch and requiring concrete D0 `surface_id` citations before source edits.
4. Expand the spec delta beyond two scenarios to cover dirty live refusal, dirty dry-run, no-match dry-run, planned approved dry-run, parse refusal, unapproved path, protected-zone refusal, live committed, apply failure with rollback, rollback failure, formatter failure, gate failure, and legacy compatibility projection.
5. Replace validation gates with falsifying oracles and injected bad cases, including expected terminal state names and non-claims.
6. Record that `GritApplyTransactionProof` is not target language; it is a compatibility projection only if D0/D1 allow it.
7. Block implementation until D8 apply-admission projection and D10 protected-zone projection are concrete enough for D9 to consume.

## Lane Status

D9 is not accepted from the TypeScript state-space lane. The lane is blocked on packet repair, not source code. The current implementation already contains useful behavioral tests and some fail-closed logic, but the OpenSpec packet does not yet prevent the next implementation agent from preserving the existing boolean/nullable proof bag or making design decisions while coding.

Skills used: domain-design, information-design, solution-design, testing-design, typescript-refactoring.
