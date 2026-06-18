# D15 Domain/Ontology Review: Command Observation Trigger

## Verdict

No P1/P2 domain-ontology blockers found.

D15 now models the right domain shape for this lane: a dormant Command Observation Trigger, not a default execution/provenance substrate migration. The active OpenSpec packet requires a consuming packet to prove a concrete command-observation state that local DTOs/projections cannot represent before any shared command-observation work can start. That satisfies the framed objective for domain/ontology review.

The remaining issues below are P3 precision repairs. They should be patched before final acceptance if the owner wants the packet to be more resistant to later widening, but they do not currently authorize implementation or break the dormant trigger model.

## Reviewed Inputs

- `$ACTIVE_REMEDIATION_WORKTREE/AGENTS.md`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/context.md`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/**`
- D6, D7, D9, D11, and G-HOST downstream/control records where they mention D15, command observations, provenance, or local representation limits.

Mandatory anchor skills were read before review: Domain Design, Information Design, Ontology Design, Solution Design, System Design, Testing Design, TypeScript Design including its referenced TypeScript docs, Civ7 Systematic Workstream, and Civ7 OpenSpec Workstream.

## Domain/Ontology Assessment

D15 is correctly bounded as a trigger domain:

- Domain owner is `Command Observation Trigger`, not process execution, verification-artifact handling, Effect runtime, diagnostics, transactions, hooks, or host policy. See `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:15`.
- The state family is closed enough for design control: `dormant`, `trigger-requested`, and `trigger-accepted`. See `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:49`.
- The trigger request requires a concrete contradiction, rejected local DTO/projection alternative, public/durable surface impact, write boundary, validation gates, and rollback plan. See `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:71`.
- The normative spec keeps D15 dormant when local contracts are sufficient or when the trigger request is incomplete. See `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:10` and `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:15`.
- Downstream records agree with dormant status: D6 only triggers on exact D6-local representation failure, D7 only if local D7 DTOs cannot encode command/cache/cwd/env/output state, D9 only if D9-local transaction records cannot represent the contradiction, D11 only if the observation cannot be represented by existing projections, and G-HOST only after local DTO/projection modeling fails. See the downstream references in the findings.

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

### P3: Add explicit rejected-trigger disposition

Current model has `dormant`, `trigger-requested`, and `trigger-accepted`, but it does not explicitly name what happens after a complete trigger request is reviewed and rejected as locally representable. The spec covers incomplete requests returning to dormant, and the design says missing items keep D15 dormant, but the complete-but-rejected case is only implicit.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:51`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:73`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:15`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:22`

Required repair:

Add a sentence to the trigger state model or trigger request contract: if final review rejects a complete trigger request because local DTOs/projections are sufficient, the consuming packet records the rejection and D15 returns to `dormant`; rejection does not create a shared substrate owner packet.

### P3: Mark `Execution Provenance` and `substrate` as compatibility labels, not target ontology

The packet has mostly replaced verification-artifact language with command-observation language, but the file/title slug and several active lines still use `Execution Provenance` and `substrate`. Because the domain owner is now Command Observation Trigger, the packet should explicitly say those terms are inherited packet labels or implementation-control shorthand, outside target ontology.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:1`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:5`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:5`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:57`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:119`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:1`

Required repair:

Add one naming note: `Execution Provenance` is the historical domino/change label; target domain language is command observation. `Substrate` means only a future shared typed command-observation contract accepted after `trigger-accepted`, not a default architecture layer.

### P3: Require field-level ownership in trigger requests

D15 correctly requires owner boundary, but the requested observation fields cross multiple adjacent domains: argv/cwd/env/cache/output observations may be local to D6/D7/D9/D11, git/base observations may be D11/D3-adjacent, and host command observations may be G-HOST-owned. Without a field-to-owner mapping, a later implementation agent could treat D15 as owning the observation model rather than owning the escalation trigger.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:78`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:535`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/workstream/downstream-realignment-ledger.md:26`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/downstream-realignment-ledger.md:20`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d11-local-feedback/design.md:228`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/downstream-realignment-ledger.md:19`

Required repair:

Extend the trigger request contract to require a field-level ownership map: for each requested command-observation field, name the owning packet/projection or state that the future shared contract owns that field only because local ownership failed.

### P3: Normalize stale upstream acceptance wording before final closure

D15 says the accepted upstream packets currently leave D15 dormant. The packet index supports this for D6/D7/D9/D11/G-HOST, but the D6 downstream ledger in the current checkout still says D6 is pending fresh final rereview. This is probably a stale D6 record rather than a D15 model defect, but D15 should not rely on ambiguous upstream status language at final closure.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:61`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md:25`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:5`

Required repair:

Either update the stale D6 control record or change D15's table intro to cite the packet index as the controlling acceptance/status record for dormant downstream state.

## Acceptance Blocker List

Domain/ontology P1/P2 blockers: none.

This review does not clear the full D15 packet. The packet still has the process blockers it already records: first-wave non-domain review lanes, repair of any accepted findings from those lanes, final rereview against repaired disk state, OpenSpec validation, diff hygiene, packet-index update, and the wording/control audit. See `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:12`.

## Required Repairs Summary

- Add rejected-trigger disposition text.
- Add a naming note that `Execution Provenance`/`substrate` are compatibility or control labels, while command observation is the target domain language.
- Require field-level ownership mapping for any trigger request.
- Normalize the stale D6 acceptance/status mismatch or cite the packet index as controlling status.

## Final Notes

D15 should remain dormant. Nothing in this packet should authorize source implementation, Effect migration, process-substrate migration, or shared command-observation code until a consuming packet proves a concrete local DTO/projection impossibility and final review accepts that representation failure.
