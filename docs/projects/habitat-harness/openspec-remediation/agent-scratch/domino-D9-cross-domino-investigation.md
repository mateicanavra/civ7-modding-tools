# D9 Cross-Domino Product Scenario Review

## Verdict

D9 Transformation Transaction is blocked from cross-domino/product-scenario acceptance.

The current D9 OpenSpec packet is an incomplete packet, not a complete design authority. It
names the right product lane - safe structural apply transactions - but it does
not yet specify the closed transaction state model, upstream projection inputs,
write authority, refusal taxonomy, public compatibility handling, downstream
projection contract, or validation matrix with enough precision to prevent
implementation-time design decisions.

D9 should remain one cohesive OpenSpec change packet, but that packet must be
expanded substantially before source implementation. Splitting D9 now would
make the transaction lifecycle ambiguous across packet boundaries and would let
formatter, rollback, host gate, and apply admission semantics drift into
adjacent owners.

## Upstream Contracts D9 May Consume Now

D9 may consume the accepted D0-D8 packets as design/specification inputs, with
the important limitation that accepted-for-design is not implementation-ready.

Accepted inputs:

- D0 Public Surface Compatibility: D9 may require D0 rows for `habitat fix`,
  dry-run behavior, `GritApplyTransactionResult`, `GritApplyTransactionProof`,
  docs examples, command output, package exports, and any stable human-output
  claims. D9 may not change or version these surfaces until concrete D0 rows
  exist and cite closed handling values.
- D1 Receipt/Command Record Boundary: D9 may use `ApplyTransactionRecord`,
  `RefusalRecord`, typed relationships, and canonical non-claims. D1 explicitly
  leaves apply behavior to D9 and requires apply records to distinguish dirty
  refusal, dry-run, ambiguous dry-run, live apply, rollback failure, and
  non-claim boundaries.
- D6 Diagnostic Pattern Catalog: D9 may consume diagnostic identity and
  limitations as context only. D6 says diagnostics do not admit patterns, do not
  prove apply safety, and do not own `GritApply*` failure semantics.
- D7 Structural Enforcement Pipeline: D9 may consume the negative constraint
  that check pass/current-tree results do not approve writes. D7's downstream
  ledger explicitly says D7 pass does not approve writes and D9 must require
  D8/D10/G-HOST/D9 transaction authority for apply safety.
- D8 Pattern Governance: D9 may consume `ApplyAdmissionProjection` as the only
  apply-eligibility input. D8 requires D9 to own dry-run, live writes, rollback,
  path approval, formatter handoff, and recovery; D8 also says diagnostic
  admission is not apply admission.

Not yet consumable as accepted authority:

- D10 Protected Zone Authority is still a blocking packet. D9 can design
  placeholders for the D10 guard/refusal projection, but implementation cannot
  assume protected/generated-zone semantics are stable.
- G-HOST Host Policy Boundary Gate is still a blocking packet. D9 can state
  that host-specific apply gates come through G-HOST, but cannot define host
  policy, infer host semantics, or claim generic Habitat closure.
- D11 and D13 are downstream incomplete packets only. They can inform expectations, not
  constrain D9 as accepted upstream authority.

Live source facts that still block D9 implementation:

- No durable `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`
  exists in this worktree, so D9 cannot cite concrete D0 rows for `habitat fix`
  or legacy apply transaction DTO/output compatibility.
- `tools/habitat/src/lib/grit-apply.ts` still combines transaction
  mechanics, hard-coded apply pattern paths, MapGen source roots, docs checkout
  path rewrites, public-ops export validation, Biome handoff, optional gates,
  rollback, and legacy proof/result objects.
- `GritApplyTransactionOptions` still permits broad optional combinations such
  as `dryRun`, `allowDirtyWorktree`, `rollbackAfterApply`, injected gate
  commands, and custom process/git readers without a packet-defined request
  mode constructor.
- Current `GritApplyTransactionResult` still uses `ok`, `failureTag`, and a
  wide proof object. D1 accepts this only as legacy compatibility until D9
  defines the target `ApplyTransactionRecord`.
- Current safe paths are discovered from `mods/*/src/{recipes,maps}` and
  docs markdown heuristics, not from accepted D8 apply admission plus D10/G-HOST
  protected path authority.
- Current generated/protected zones remain inline host-specific constants in
  `generated-zones.ts`; D10/G-HOST have not yet converted them into accepted
  declarations.
- Current Pattern Authority `applySafety` fields still name proof strings such
  as `dryRunCommand`, `noWriteProof`, `appliedDiffProof`, `rollbackProof`, and
  `typeAndTestProof`; accepted D8 says D9 receives an apply-admission
  projection, not whole manifests or proof-string authority.

## Downstream Facts D11, D13, And Future Apply Packets May Rely On From D9

D9 must publish narrow downstream facts. Downstream consumers should not inspect
legacy proof blobs or raw Grit output.

D11 Local Feedback may rely on:

- A local-feedback-safe transaction projection that says whether an apply/fix
  transaction is unavailable, refused, dry-run-only, applied, rolled back, or
  requires manual recovery.
- Stable local-feedback non-claims: hook success is not safe-apply completion,
  not CI, not review proof, not runtime/product proof.
- Explicit recovery guidance for transaction refusal or rollback failure that a
  hook can display without owning apply safety.
- A clear boundary that hooks may orchestrate or report D9 decisions but may
  not recompute path approval, rollback status, apply admission, formatter
  success, or host gate meaning.

D13 Candidate Generation may rely on:

- Candidate pattern generation does not imply apply safety.
- D8 must produce apply admission before D9 accepts a pattern for transaction
  evaluation.
- D9 may define the transaction-input shape that an apply-capable candidate must
  later satisfy, but D13 still owns candidate file creation and unsupported
  candidate refusals.

Future apply packets may rely on:

- The closed D9 transaction state model and request-mode constructors.
- The required inputs for an apply request: D8 apply admission, D10 path/zone
  guard decision where touched, G-HOST host gate declaration where applicable,
  approved write roots, dry-run observation, isolated-copy/diff evidence,
  formatter handoff policy, post-apply gates, rollback plan, and D1 non-claims.
- The non-claim that dry-run inventory does not prove live apply success.
- The non-claim that apply success does not prove current-tree diagnostics are
  clean unless D7 check runs separately.
- The non-claim that apply success does not prove product/runtime behavior.

## What D9 Must Not Claim

D6 diagnostics:

- D9 must not treat a diagnostic pattern, native Grit sample, injected probe, or
  clean diagnostic run as apply-safe.
- D9 must not parse raw diagnostic Grit reports as write authority.
- D9 must not reuse D6 adapter failure states for apply transaction failures
  except through owner-boundary translation.

D8 admission:

- D9 must not admit, register, retire, or refuse Pattern Governance lifecycle
  state.
- D9 must not read whole Pattern Authority manifests as its target input.
- D9 must not infer apply eligibility from diagnostic admission, hook scope,
  rule lane, file presence, Grit frontmatter, or generator options.
- D9 must not convert transaction failure into D8 admission state.

D10 protected/generated-zone authority:

- D9 must not define generated/protected-zone policy, regeneration semantics,
  forbidden artifacts, or missing-host declaration behavior.
- D9 must not turn protected-zone violations into best-effort skips or warnings.
- D9 must consume D10 guard/refusal projections for touched paths before
  approving live writes.

G-HOST host policy:

- D9 must not hard-code Civ7/MapGen-specific roots, public-ops validation,
  generated paths, or host gates as generic Habitat truth.
- D9 may run host-specific gates only when G-HOST declares the gate and owner.
- Missing host policy must be an explicit refusal, not a silent disabling of
  protection.

Biome:

- D9 must not claim Biome owns transaction safety.
- Biome handoff success may prove only the requested formatting/lint handoff
  command result, with Biome-specific non-claims.
- Biome failure after live writes is a D9 transaction state requiring rollback
  or recovery, not a generic formatter note.

Grit:

- D9 must not claim native Grit owns Habitat write approval.
- Native `grit apply --dry-run` output is an observation that D9 must classify,
  not authority by itself.
- Native `grit apply` success is not sufficient without D8 admission, D10/G-HOST
  path gates, changed-path approval, formatter handoff, post-apply gates, and
  rollback/recovery state.

Nx:

- D9 must not use Nx target success, generator mechanics, or cache behavior as
  apply safety.
- If D9 needs type/test gates, it must name them as post-apply gate handoffs
  with command provenance and non-claims, not as implicit transaction success.
- Nx cache/freshness may be observed only where the specific gate records it.

## Packetization Decision

D9 should remain one OpenSpec packet.

The cohesive domain object is the transaction lifecycle from requested apply to
dry-run, inventory classification, isolated-copy proof, live write, formatter
handoff, gates, rollback, and recovery. Splitting this into separate packets
would create exactly the ambiguity D9 is meant to remove: formatter failure
could become "not apply," rollback could become "git proof," path approval
could become "D10," and apply admission could become "D8." Those are inputs and
handoffs, not separate owners of transaction state.

The only split that may be warranted is not inside D9: if D9 proves that local
DTOs cannot represent command provenance without contradictory states, it may
trigger D15 as a separate/minimized substrate decision. That is not a default
D9 split and must pass D15's trigger test.

## Black-Ice Sequencing Traps

1. D9 currently lists D10 as a dependency, but D10 and G-HOST are still
   blocking packets. D9 can be designed against their expected projection
   shape, but source implementation cannot start or close generic apply safety
   until accepted D10/G-HOST contracts exist.

2. D8 accepted apply-admission language depends on D9-owned transaction-safety
   references. This is a mutual-design edge, not an implementation shortcut.
   D8 can say what D9 must receive; D9 must now define the exact transaction
   inputs/projections D8 may cite.

3. The current D9 OpenSpec spec has only two scenarios. It omits no-match
   dry-run, approved dry-run inventory, parse failure, dirty live refusal,
   dirty dry-run allowance, unapproved path refusal, protected-zone refusal,
   host gate missing/refused, isolated-copy mismatch, live apply success,
   live apply failure before writes, live apply failure after writes, Biome
   handoff failure, gate failure, rollback success, rollback failure, and manual
   recovery.

4. "Protected path list" appears in the incomplete D9 packet as an implementation
   readiness item, but D9 must not author protected policy. D9 should require a
   D10 guard projection for every touched path and refuse when it is absent.

5. Existing `grit-apply.ts` public-ops validation is MapGen-specific. Without
   G-HOST, preserving it as generic D9 behavior would violate the host boundary.
   With G-HOST, it must become a declared host apply gate, not inline generic
   code.

6. The current packet says "approved patterns" but does not define the exact
   D8 projection shape D9 consumes. Implementation would otherwise choose
   between manifest fields, `applySafety`, Grit pattern paths, rule rows, or
   current hard-coded constants.

7. The incomplete D9 packet says "formatter handoff success/failure" but not whether
   formatter failure after live writes requires rollback, whether formatter
   success changes transaction state, or what Biome output does not claim.

8. Dry-run inventory and isolated-copy proof are different observations. A
   packet that treats dry-run matches, structured inventory, isolated-copy diff,
   and live write success as one "ok" path will recreate the current boolean
   state problem.

9. Rollback can be requested intentionally for proof, or invoked after failure.
   Current options use `rollbackAfterApply`; D9 must distinguish
   proof-mode rollback from failure rollback and from manual recovery after
   rollback failure.

10. D11 is blocked on D9, but current D9 does not publish a downstream
    local-feedback projection. If D9 closes without that projection, D11 will
    either parse legacy proof/output or recompute apply safety inside hooks.

11. D13 may need to describe apply-capable candidate requirements. If D9 does
    not define transaction-input prerequisites, D13 will invent or copy D8
    `applySafety` prose strings as generator contract.

12. D15 is tempting because `grit-apply.ts` already uses Effect/process
    machinery. D9 must not trigger D15 unless it records the exact contradictory
    state that local transaction DTOs cannot represent. Current evidence points
    first to a missing D9 state model, not necessarily a missing substrate.

## Required Repairs Before Acceptance

D9 needs a real OpenSpec design/specification pass before acceptance. Minimum
repairs:

- Define a closed `ApplyTransactionRecord` state family with request-mode
  constructors and state-owned fields.
- Define the D8 `ApplyAdmissionProjection` input shape D9 consumes and the
  transaction-safety fields D8 may cite.
- Define the D10/G-HOST guard/gate projection placeholders D9 requires, while
  marking D10/G-HOST implementation as blocking until accepted.
- Define write-set and changed-path approval semantics without host-specific
  inline defaults.
- Define dry-run, isolated-copy, live-apply, formatter, gate, rollback, and
  recovery scenarios normatively in `spec.md`.
- Define refusal reason names or map them explicitly to D1 `RefusalRecord`.
- Define downstream projections for D11 local feedback, D8 recovery/admission
  feedback, and future apply packets.
- Cite the absent D0 public-surface matrix as a source-implementation blocker,
  not a cleanup task.
- Replace broad "run dependency gates" tasks with exact design-time acceptance
  requirements and later implementation gates, including injected bad cases.

Until those repairs exist, D9 remains a useful source packet plus incomplete OpenSpec packet, not
an OpenSpec design/specification authority.
