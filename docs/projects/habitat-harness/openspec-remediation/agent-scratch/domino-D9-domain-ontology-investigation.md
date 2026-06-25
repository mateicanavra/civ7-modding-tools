# D9 Domain/Ontology Investigation: Transformation Transaction

## Verdict

D9 is blocked from domain/ontology acceptance.

The controlling D9 source packet has the right instinct: D9 should own the write
transaction, not diagnostics, governance, host policy, protection policy, hook
feedback, formatter semantics, or Grit rewrite semantics. The current OpenSpec
packet does not yet convert that instinct into an authority-grade design. It is
still an incomplete packet with one broad requirement, two scenarios, generic task
phrases, and no closed transaction ontology. A later implementation agent would
still have to invent state names, owner handoffs, refusal families, request
constructors, and compatibility term disposition while editing
`tools/habitat/src/lib/grit-apply.ts`.

## Exact D9 Domain And Single Owner

The exact domain is **Transformation Transaction**.

The single owner is **D9 Transformation Transaction**. Its authority is the
admission and execution envelope for a Habitat-approved structural rewrite:
request construction, dry-run inventory, write-set planning, live write
execution, rollback, formatter handoff, gate handoff, transaction outcome, and
recovery record.

D9 owns the transaction boundary only after upstream owners provide their
inputs. It does not approve patterns, define host policy, define protected
zones, define diagnostics, own formatter semantics, or own native Grit rewrite
semantics.

The D9 domain should be described as:

> A Transformation Transaction is a closed, recoverable attempt to execute a
> D8-admitted structural rewrite against a D10/G-HOST-approved write set, with
> dry-run inventory, path approval, live write, rollback, formatter handoff,
> optional declared gates, refusal states, outcome states, recovery instructions,
> and explicit non-claims.

## Target Language

Target D9 language should use standard engineering terms:

- `TransformationTransaction`
- `TransformationRequest`
- `DryRunRequest`
- `LiveWriteRequest`
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

Habitat-specific terms should be elevated only when they are true invariants:
`ApplyAdmissionProjection` is D8 vocabulary consumed by D9; protected/generated
zone decisions are D10/G-HOST vocabulary consumed by D9; `Grit` is the native
rewrite engine, not the transaction domain.

## Bad Compatibility Facts, Not Target Language

These current names are compatibility facts or implementation evidence. They
should not become D9 target ontology unless the packet explicitly accepts and
defines them.

| Current term | Target disposition |
| --- | --- |
| `GritApplyTransactionOptions` | Compatibility DTO. Target should be closed request variants, not optional mode flags. |
| `dryRun?: boolean` | Compatibility flag. Target should be `DryRunRequest` vs `LiveWriteRequest`. |
| `allowDirtyWorktree?: boolean` | Compatibility escape hatch. Target should be explicit dirty-worktree policy with admitted isolated-copy/live-write variants. |
| `rollbackAfterApply?: boolean` | Compatibility flag. Target should model rollback policy and rollback outcome as transaction state. |
| `gateCommands?: HabitatProcessRequest[]` | Compatibility process list. Target should be declared `GateHandoff` records sourced from D8/G-HOST/D9 transaction inputs. |
| `GritApplyTransactionResult extends SpawnResult` | Compatibility output surface. Target should be `TransactionOutcome`; process result is evidence inside an observation, not the transaction identity. |
| `ok: boolean` plus optional fields | Bad target shape. Target must be a discriminated state model. |
| `proof` / `GritApplyTransactionProof` | Proof-shaped compatibility language. Target should use transaction record, outcome record, recovery record, command observation, or non-claim. |
| `diffEvidence` | Compatibility implementation detail. Target should use write-set diff observation or isolated-copy check observation. |
| `fileDigests` | Compatibility evidence detail. Target should be file digest observation only where required for rollback/recovery. |
| `transactionCopyCommand` | Compatibility name. Target is `IsolatedCopyCheck`. |
| `gateCommands` | Compatibility name. Target is `GateHandoff` with owner, input, output, and non-claim. |
| `biomeCommand` | Compatibility name. Target is `FormatterHandoff`; Biome owns formatter behavior. |
| `GritApplyDirtyWorktree` | D9-owned failure compatibility tag; target should be `dirty-worktree-refusal`. |
| `GritApplyDryRunMismatch` | D9-owned failure compatibility tag; target should distinguish inventory parse failure, dry-run/copy mismatch, and unapproved inventory refusal. |
| `GritApplyUnexpectedFile` | D9-owned failure compatibility tag; target should distinguish outside write set, protected-zone refusal, create/delete not admitted, and live unexpected path. |
| `GritApplyMissingTargetExport` | Host/MapGen gate compatibility tag. Target belongs behind G-HOST-declared apply gate, not generic D9 core language. |
| `GritApplyRollbackFailed` | D9-owned failure compatibility tag; target should be `rollback-failed` outcome with recovery instructions. |
| `HABITAT_REWRITE` | Current structured dry-run line protocol. Target should call it a native dry-run inventory contract or compatibility inventory format. |
| `approvedByPattern` | Compatibility field. D9 target should consume D8 `ApplyAdmissionProjection` and D9 write-set/path decisions, not pattern self-approval as authority. |
| `classification: expected/pre-approved/rejected/blocked` | Compatibility labels. Target should use closed admission/refusal/outcome states. |
| `mods/mod-swooper-maps/**`, `@mapgen/domain/**/ops` public export validation | Host-specific current evidence. Target should move behind G-HOST apply gate declarations. |

## Closed State Model D9 Should Specify

D9 needs a closed model with distinct request, admission, execution, handoff,
rollback, and outcome states. The source packet lists many of these states, but
the current OpenSpec spec does not define them.

### Transaction Request

```ts
type TransformationRequest =
  | {
      kind: "dry-run-request";
      admission: ApplyAdmissionProjection;
      writeSet: PlannedWriteSet;
      protectedZoneDecision: ProtectedZoneDecisionReference;
      hostPolicy?: HostApplyGateReference;
    }
  | {
      kind: "live-write-request";
      admission: ApplyAdmissionProjection;
      writeSet: PlannedWriteSet;
      protectedZoneDecision: ProtectedZoneDecisionReference;
      hostPolicy?: HostApplyGateReference;
      rollbackPolicy: "required";
      formatterPolicy: FormatterHandoffPolicy;
      gatePolicy: readonly GateHandoffPolicy[];
    };
```

No target constructor may allow live write without D8 apply admission, protected
path approval, and declared rollback policy.

### Transaction Admission

```ts
type TransactionAdmissionDecision =
  | { kind: "admitted-dry-run"; request: Extract<TransformationRequest, { kind: "dry-run-request" }> }
  | { kind: "admitted-live-write"; request: Extract<TransformationRequest, { kind: "live-write-request" }> }
  | { kind: "refused"; refusal: TransactionRefusal };
```

Closed refusal reasons should include:

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

Dry-run success must not imply live write success. Dry-run inventory must not be
accepted as pattern admission. Structured inventory parsing must remain a native
contract observation, not target domain truth.

### Path And Write-Set Decision

```ts
type PathApprovalDecision =
  | { kind: "approved"; path: string; action: "modify"; source: "apply-admission-and-d10-policy" }
  | { kind: "refused"; path: string; reason: PathRefusalReason };
```

Closed path refusal reasons should distinguish:

- outside approved roots;
- protected/generated zone refused by D10;
- missing host declaration;
- create not admitted;
- delete not admitted;
- live write produced unexpected path;
- path changed after dry-run/copy approval.

The current `GritApplyUnexpectedFile` bucket is too broad for target design.

### Live Execution And Rollback

```ts
type LiveWriteOutcome =
  | { kind: "not-run"; reason: "dry-run-only" | "no-planned-edits" | "admission-refused" }
  | { kind: "write-succeeded"; changedPaths: readonly string[] }
  | { kind: "write-failed-before-observable-change"; observation: NativeApplyObservation }
  | { kind: "write-failed-after-observable-change"; observation: NativeApplyObservation; rollback: RollbackOutcome }
  | { kind: "unexpected-path-after-write"; changedPaths: readonly string[]; rollback: RollbackOutcome };

type RollbackOutcome =
  | { kind: "not-needed" }
  | { kind: "succeeded"; recoveredPaths: readonly string[] }
  | { kind: "failed"; unrecoveredPaths: readonly string[]; recovery: RecoveryInstruction };
```

Rollback failure must be a distinct outcome, not merely a `failureTag` on a
boolean result.

### Formatter And Gate Handoffs

```ts
type FormatterHandoffOutcome =
  | { kind: "not-run"; reason: "no-changed-paths" | "live-write-not-run" }
  | { kind: "succeeded"; formatter: "biome"; observation: FormatterCommandObservation }
  | { kind: "failed"; formatter: "biome"; observation: FormatterCommandObservation; rollback: RollbackOutcome };

type GateHandoffOutcome =
  | { kind: "not-run"; reason: "no-declared-gates" | "live-write-not-run" }
  | { kind: "succeeded"; gateId: string; owner: "host-policy" | "transaction" | "pattern-governance"; observation: GateCommandObservation }
  | { kind: "failed"; gateId: string; owner: "host-policy" | "transaction" | "pattern-governance"; observation: GateCommandObservation; rollback: RollbackOutcome };
```

Formatter and gate success are handoff outcomes only. They are not apply safety,
diagnostic cleanliness, product correctness, or Biome semantic proof.

### Transaction Outcome

```ts
type TransformationTransactionOutcome =
  | { kind: "dry-run-clean"; inventory: Extract<DryRunInventoryOutcome, { kind: "no-planned-edits" }>; nonClaims: readonly TransactionNonClaim[] }
  | { kind: "dry-run-planned"; inventory: Extract<DryRunInventoryOutcome, { kind: "planned-approved-write-set" }>; nonClaims: readonly TransactionNonClaim[] }
  | { kind: "refused"; refusal: TransactionRefusal; recovery: RecoveryInstruction }
  | { kind: "applied"; live: Extract<LiveWriteOutcome, { kind: "write-succeeded" }>; formatter: FormatterHandoffOutcome; gates: readonly GateHandoffOutcome[]; nonClaims: readonly TransactionNonClaim[] }
  | { kind: "rolled-back"; failedStage: "live-write" | "formatter-handoff" | "gate-handoff"; rollback: Extract<RollbackOutcome, { kind: "succeeded" }>; recovery: RecoveryInstruction }
  | { kind: "rollback-failed"; failedStage: "live-write" | "formatter-handoff" | "gate-handoff" | "explicit-rollback"; rollback: Extract<RollbackOutcome, { kind: "failed" }>; recovery: RecoveryInstruction };
```

This model closes the current illegal state where a success proof can coexist
with a failed formatter/gate/rollback field, or where a failure can carry enough
optional proof fields to look like success.

## Forbidden Adjacent Owners

D9 must explicitly forbid these adjacent domains from owning D9 concerns, and
must forbid D9 from absorbing their authority:

- **D6 Diagnostic Pattern Catalog** owns diagnostic identity, diagnostic
  capability, native diagnostic acquisition, and diagnostic limitations. D6 may
  provide diagnostic identity/limitations to D9. D9 must establish write safety
  itself and must not accept D6 diagnostic success as write authority.
- **D8 Pattern Governance** owns pattern lifecycle, apply admission, refusal,
  and retirement. D9 consumes `ApplyAdmissionProjection` or explicit D8 apply
  refusal only. D9 does not admit patterns.
- **D10 Generated/Protected Zone Authority** owns generated/protected zone
  declarations and guard decisions. D9 consumes D10 path/zone decisions and
  must not define protected-zone policy locally.
- **G-HOST Host Policy Boundary** owns host-specific declarations and
  host-specific apply gates. D9 may run declared gate handoffs; it must not
  embed MapGen/Civ7 paths, public ops semantics, or host policy as generic
  transaction logic.
- **D11 Local Feedback** owns hook feedback, staged-file behavior, local output,
  and hook recovery presentation. D9 may publish recovery facts for D11; it must
  not define hook behavior.
- **Biome** owns formatting/lint/import sorting semantics. D9 owns only the
  formatter handoff and rollback behavior around that handoff.
- **Grit** owns native textual rewrite semantics, pattern syntax, native apply,
  native output contracts, and vendor behavior. D9 owns Habitat's transaction
  envelope around native apply, not the meaning of Grit rewrites.

## Current Ambiguities In The D9 Packet

1. **Owner name drift:** the source says "Apply transaction owner"; OpenSpec
   says "Transformation Transaction." The target should choose one. Use
   `Transformation Transaction` for the bounded domain and `apply` only as a
   native/vendor operation or command path.

2. **Admission is ambiguous:** D8 owns apply admission, but D9 also needs a
   transaction admission decision before running. The packet must name both and
   define their relationship. D8 admission is necessary but not sufficient for
   D9 transaction admission.

3. **State model is absent:** the spec says D9 shall model dry-run, live-write,
   rollback, formatting, protected-zone refusal, and recovery states, but it
   does not enumerate the closed states or refusal reasons.

4. **Request construction is unresolved:** `GritApplyTransactionOptions` can
   combine dry-run, live write, dirty worktree allowance, rollback mode, and gate
   commands in invalid ways. The packet does not specify the target constructors
   that make those combinations unrepresentable.

5. **Path ownership is ambiguous:** the current code approves paths using roots,
   structured inventory, isolated-copy diff evidence, and MapGen public ops
   validation. The target packet does not split D9 write-set approval from D10
   protected-zone decisions and G-HOST host-specific gates.

6. **Host policy is still leaky:** current `validateAppliedTargetExports` and
   `publicOpsTargetPath` encode `@mapgen/domain/**/ops` and
   `mods/mod-swooper-maps/**` inside generic transaction code. D9 must classify
   this as host-gate compatibility evidence and require G-HOST declarations.

7. **Formatter handoff is under-modeled:** current OpenSpec names formatting but
   does not define formatter handoff states, rollback behavior after formatter
   failure, or non-claims.

8. **Gate handoff is under-modeled:** current `gateCommands` are arbitrary
   `HabitatProcessRequest`s. The target must require declared gate owners,
   command contracts, failure states, rollback behavior, and non-claims.

9. **Recovery is under-specified:** the source requires rollback/non-claim
   proof and recovery, but the spec only says "reports rollback state and
   recovery instructions." It does not define recovery instruction families or
   unrecovered-path representation.

10. **Proof vocabulary is unresolved:** current OpenSpec says proof-shaped names
    are compatibility facts, but D9 source and current implementation still use
    `proof`, `diffEvidence`, and digest fields heavily. The packet needs an
    explicit term disposition table like D8.

11. **D10/G-HOST dependency reality is not reflected:** packet index marks D10
    and G-HOST incomplete. D9 can design against their source packet
    constraints, but source implementation remains blocked where protected-zone
    or host-policy decisions are touched.

12. **Validation gates are too generic for ontology acceptance:** current D9
    gates run `grit-apply.test.ts` and help/OpenSpec commands, but the packet
    lacks required bad-case gates for missing D8 admission, missing D10 decision,
    missing G-HOST gate, protected-zone refusal, create/delete refusal,
    formatter failure, gate failure, and rollback failure as closed states.

## P1 Blockers

### P1. Complete D9 state ontology is missing

The OpenSpec spec has one broad requirement and two scenarios. It does not
define the closed request, admission, refusal, dry-run, write-set, live write,
formatter, gate, rollback, outcome, recovery, and non-claim states. This leaves
implementation-time design decisions open.

Repair required: expand `design.md` and `spec.md` with the closed state model
above or an equivalent model, including normative scenarios for every state
family.

### P1. D8 apply admission versus D9 transaction admission is unresolved

D8 accepted design states that D9 consumes only `ApplyAdmissionProjection` or
explicit apply refusal and that D8 admission does not execute or approve writes.
D9 currently says "apply approval" and "path approval" without defining what is
D8-owned versus D9-owned.

Repair required: define D9 `TransactionAdmissionDecision` as a D9 state that
requires D8 `ApplyAdmissionProjection`, D10 path decisions, and G-HOST
declarations where touched.

### P1. D10/G-HOST boundaries are not enforceable in D9

Current implementation embeds MapGen-specific public ops validation and source
roots in generic transaction code. D10/G-HOST are still incomplete packet rows,
so D9 cannot claim generic closure for protected-zone or host-gate paths.

Repair required: D9 must specify host-gate and protected-zone references as
required inputs, block source implementation where those inputs are absent, and
forbid generic D9 code from encoding Civ7/MapGen policy.

### P1. Boolean/optional transaction result remains the implicit target

The existing `GritApplyTransactionResult` can represent `ok` plus many optional
proof fields. The current OpenSpec does not reject that shape with a concrete
replacement.

Repair required: require a discriminated `TransformationTransactionOutcome` and
request constructors that make invalid mode combinations unrepresentable.

### P1. Recovery and rollback failure are under-specified

Rollback success/failure is listed in the source packet and tested in current
code, but the OpenSpec spec only mentions rollback state generically.

Repair required: define rollback outcomes, unrecovered path representation,
recovery instruction families, and non-claims for rollback success/failure.

## P2 Blockers

### P2. Compatibility term disposition is incomplete

D9 needs an explicit term table like D8's `Term Disposition`. Without it, current
code terms such as `proof`, `diffEvidence`, `approvedByPattern`, and
`GritApplyMissingTargetExport` will leak into product/domain language.

### P2. Formatter and gate handoffs need owner-tagged outcomes

Biome and arbitrary selected gates must be handoffs with owner, command
observation, rollback behavior, and non-claims. They must not be reported as
apply safety or product proof.

### P2. Dry-run inventory states need bad-case scenarios

The source packet requires dry-run clean/no matches, approved changes, and parse
failure. Current spec has only "dry run is requested." It needs explicit
inventory parse failure, mismatch, no-edit, approved-plan, and unapproved-entry
scenarios.

### P2. Write-set/path refusal taxonomy is too broad

`GritApplyUnexpectedFile` currently collapses outside-root, create, delete,
protected-zone, host-policy, and unexpected live-write cases. D9 target spec
must keep these distinguishable.

### P2. D1/D0 public output compatibility is not concrete

D9 can say public output may change, but implementation readiness requires D0
rows and D1 output/refusal families for command JSON/human changes. Current D9
tasks leave this as "confirm" rather than listing the touched surfaces and
blocking facts.

## Acceptance Conditions For This Lane

D9 can be accepted from the domain/ontology lane only when:

- `design.md` names `Transformation Transaction` as the single D9 owner and
  contains the forbidden-owner matrix above.
- `design.md` includes a compatibility term disposition table for current code
  names.
- `design.md` and `spec.md` define the closed state model for request,
  admission, refusal, dry-run inventory, write set, live write, formatter
  handoff, gate handoff, rollback, outcome, recovery, and non-claims.
- `spec.md` has normative scenarios for every P1 state family, not just a broad
  umbrella requirement.
- `tasks.md` sequences implementation slices by state-family construction and
  includes bad-case tests for missing D8 admission, missing D10/G-HOST inputs,
  dirty worktree, unapproved path, create/delete refusal, dry-run mismatch,
  formatter failure, gate failure, rollback success, and rollback failure.
- D9 records that source implementation touching protected/generated or
  host-specific paths remains blocked until D10/G-HOST are accepted and live
  declarations/projections exist.

Until those repairs land, D9 remains a useful source packet and incomplete OpenSpec packet, but
not a complete OpenSpec design/specification authority.
