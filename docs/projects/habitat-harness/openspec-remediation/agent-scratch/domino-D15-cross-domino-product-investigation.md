# D15 Cross-Domino/Product Review

## Verdict

Blocked for acceptance until the P2 repairs below are made. I found no P1 findings.

D15 is pointed at the correct Habitat product role: repo design/construction/maintenance/evolution guardrails for command observation, not artifact generation and not an unbounded Effect/process migration. The active D15 packet mostly preserves dormant-trigger semantics: source implementation remains unauthorized unless a consuming packet proves a concrete command-observation state cannot be represented by local DTOs/projections.

The remaining blockers are cross-record consistency and normative-gate issues. They matter because future execution agents will read the packet index, source packet, spec delta, and downstream ledgers as control inputs. Those records must agree on G-HOST eligibility, D0/D1 blockers, and the absence of a dormant-state Habitat source write set.

Validation checked during review:

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`: passed.
- `bun run openspec:validate`: passed, 249 items.
- `git diff --check`: passed.

## P1 Findings

None.

## P2 Findings

### P2-1: Packet index omits G-HOST from the D15 trigger prerequisite row

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md:35` omitted G-HOST from the D15 trigger prerequisite row before repair.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:40` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:43` include G-HOST as a valid trigger source.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:69` records G-HOST as dormant unless host-policy implementation discovers a local command/projection observation contradiction.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/downstream-realignment-ledger.md:19` says G-HOST may trigger D15 only after an impossible local command-observation contradiction is recorded.

Why this blocks:

The packet index is the cross-domino sequencer. If it omits G-HOST while D15 and G-HOST both name G-HOST as a dormant trigger consumer, future agents can incorrectly treat G-HOST-triggered D15 work as out of sequence or unauthorized.

Required repair:

Update the D15 packet-index row to include G-HOST as a valid trigger source, or remove G-HOST from D15 and G-HOST records. Given the current framed objective and G-HOST downstream ledger, the complete-standard repair is to add G-HOST to the D15 index `Requires` language while preserving dormant/non-implementation wording.

### P2-2: D0/D1 blockers are not promoted into the normative D15 trigger acceptance contract

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:86` through `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:90` correctly says D0/D1 classify and version public command-observation fields.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/downstream-realignment-ledger.md:10` and `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/downstream-realignment-ledger.md:11` correctly preserve D0 and D1 as source blockers.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:90` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:96` names D0 compatibility before implementation but does not explicitly carry D1 output-family/non-claim handling in the same readiness gate.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:22` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:27` allows a trigger-met path after trigger fields and final review, but does not normatively require D0/D1 compatibility handling for public/durable command-observation surfaces.

Why this blocks:

D15 is specifically a protocol for future execution agents. If D0/D1 remain only in downstream ledger/design prose, a later trigger packet can satisfy the OpenSpec scenario while under-specifying public command JSON, exports, scripts, hooks, docs/examples, receipt/diagnostic/transaction/handoff fields, or non-claim language.

Required repair:

Add D0/D1 compatibility as normative trigger/implementation gates in the proposal and spec delta. The trigger-met scenario should require concrete D0 row citations and D1 output-family/non-claim handling for every public/durable surface touched by a future D15-triggered command-observation change. Also add D1 explicitly to the `Implementation Readiness` gate in `design.md`.

### P2-3: The proposal implies an expected Habitat source write set exists while D15 is dormant

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:52` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:55` implied a Habitat implementation write set existed before repair, while also saying no code is authorized by this packet.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:88` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:96` defines implementation readiness but does not name a concrete Habitat source write set, which is correct for dormant D15.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:36` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:44` correctly limits implementation gates to a later accepted trigger packet.

Why this blocks:

The proposal leaks implementation-surface ambiguity into a packet whose core product role is dormancy. D15 should leave no impression that this packet already owns any Habitat source write set.

Required repair:

Replace the proposal wording with an explicit dormant-state rule: no Habitat source write set is authorized or expected in this packet. A future trigger owner must name the exact write/protected set only after `trigger-accepted`. Consider renaming `design.md`'s `Implementation Readiness` section to `Later Triggered Implementation Readiness` to keep the condition visible.

### P2-4: The D6 downstream ledger is stale relative to D6 acceptance records and packet index

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:5` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:7` still says D6 is repaired and pending fresh final rereview.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:5` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:6` says D6 is accepted for design/specification after final after-observed-identity rereview.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md:5` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md:11` and `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md:56` record final D6 acceptance for design/specification only.
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md:25` also records D6 accepted for design/specification.

Why this blocks:

The D15 review was explicitly required to read accepted D6 downstream ledgers. The ledger's D15 row supports dormant semantics at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:20`, but its status header and packet-index action row still describe pre-acceptance state. That creates cross-domino ambiguity for D15's statement that accepted upstream packets leave D15 dormant.

Required repair:

Realign the D6 downstream ledger status and packet-index action row to the accepted design/specification state, preserving the non-implementation and D0/D1/D2 source blockers. This repair is outside the D15 change root but blocks complete-standard D15 cross-domino acceptance because D15 depends on that ledger as an accepted handoff source.

## P3 Findings

### P3-1: Residual "provenance/substrate" vocabulary remains in trigger-adjacent records

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:35` through `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:42` uses "typed provenance" language in the trigger contract.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/downstream-realignment-ledger.md:19` names "provenance substrate" while D15's active target language is command observation.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:38` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:47` correctly sets command observations/results/receipts/diagnostics as target language and treats verification-artifact-shaped names as compatibility facts.

Required repair:

Where these records remain active control inputs, prefer "command observation" and "shared command-observation substrate" over "execution provenance/provenance substrate", except in file names, packet titles, or explicit historical/source-packet references.

## Cross-Domino/Product Assessment

D15's product role is correct after the P2 repairs: it is a dormant trigger protocol for rare command-observation state-space failures, not a general artifact generator, not a default Effect migration, and not a new public output family.

The D6/D7/D9/D11/G-HOST handoff semantics are substantially aligned:

- D6 downstream row keeps D15 dormant unless D6-local DTOs cannot represent exact command observations.
- D7 downstream row keeps D15 dormant unless implementation finds a concrete command-provenance/cache/cwd/env/output state that local D7 DTOs cannot encode.
- D9 downstream row keeps D15 dormant unless D9-local transaction records cannot represent a concrete contradiction.
- D11 downstream row keeps D15 dormant unless D1/D3/D6/D7/D9/D10 projections cannot represent a local command/state observation.
- G-HOST downstream row keeps D15 dormant unless host-policy implementation records an impossible local command/provenance state after local DTO/projection modeling.

The handoff problem is not the core model. The problem is that the packet index, source-packet control language, and normative spec do not yet carry the same complete set of blockers and trigger consumers.

## Acceptance Blocker List

- Repair P2-1: include G-HOST in the D15 packet-index trigger prerequisite row, or remove G-HOST consistently from D15/G-HOST control records.
- Repair P2-2: promote D0/D1 blockers into D15 proposal/spec/design readiness, not only downstream ledger prose.
- Repair P2-3: remove the proposal implication that dormant D15 has an expected Habitat implementation write set.
- Repair P2-4: realign the D6 downstream ledger to its accepted design/specification state before using it as an accepted D15 handoff source.

After these repairs, rerun strict D15 OpenSpec validation, full OpenSpec validation, `git diff --check`, and a focused D15 wording/control audit over `$D15_CHANGE/**`, `$D15_SOURCE_PACKET`, `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and D15 scratch review files. If those pass and final rereview finds no unresolved P1/P2, D15 can be accepted for design/specification only while remaining dormant and source-blocked.
