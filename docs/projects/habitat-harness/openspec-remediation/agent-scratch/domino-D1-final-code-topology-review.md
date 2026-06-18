# D1 Final Code/Topology Review

## Verdict

Accepted for design/specification.

I found no unresolved P1/P2 code-topology or TypeScript state-space blockers in the repaired D1 packet. The packet is now concrete enough for a later implementation agent to proceed only after the D0 matrix rows exist, and it does not ask implementation to decide the state model, write set, or public compatibility model later.

This is not implementation acceptance. D1 remains source-edit blocked until the D0 compatibility matrix contains concrete rows for every affected public or durable surface.

## Review Basis

I reviewed:

- D1 packet files under `openspec/changes/deep-habitat-d1-receipt-contract-boundary/`.
- D1 scratch investigations and prior D1 review under `docs/projects/habitat-harness/openspec-remediation/agent-scratch/`.
- Accepted D0 packet and `domino-D0-final-review.md`.
- Current code surfaces named by D1: `diagnostics.ts`, `command-engine.ts`, `hooks.ts`, `grit-apply.ts`, `proof-artifact.ts`, command entrypoints, `src/index.ts`, and relevant tests/docs.
- Domain Design, Information Design, Solution Design, System Design, repo-local TypeScript Refactoring full corpus, and OpenSpec workstream guidance.

## Explicit Design-Time Decision Check

Pass: D1 does not leave state model, write set, or public compatibility to implementation.

- Public compatibility is D0-owned: `proposal.md` requires D0 rows before any public/durable surface change and enumerates required planes for check, verify, hook, apply, adapter artifact, and docs surfaces (`proposal.md:43-60`). `tasks.md` requires copying D0 `compatibility_handling`, `target_owner`, and downstream values and stopping on `blocked-pending-d0-row` (`tasks.md:10-20`).
- The current surface inventory is concrete enough for design/spec: `design.md` maps proof-shaped surfaces to target families, required D0 handling, D1 strategy, and bad states (`design.md:61-75`). Adjacent classify and Pattern Authority proof fields are explicitly protected/downstream-owned (`design.md:74-75`).
- Owner boundaries are explicit: D1 owns shared receipt/handoff vocabulary, non-claims, typed relationships, wrapper rules, and handoff limits, while D9/D11/D12/D8/D13/D14 retain behavior/domain ownership (`proposal.md:62-70`, `design.md:47-59`).
- State-space refactor targets are explicit: D1 calls for discriminated result states, family-specific records/wrappers, typed projections, typed relationships, canonical non-claims, and closed apply transaction lifecycle (`design.md:77-88`).
- Closed states and relationships are specified: target relationships are typed and untyped `downstreamLinks` are compatibility-only (`design.md:90-109`); closed state families are listed for command outcome, check outcome, affected target execution, hook feedback, apply transaction, and terminology classification (`design.md:111-121`).
- The write set and protected paths are explicit: implementation may touch only listed paths after D0 row citations (`proposal.md:72-88`), with generated outputs, lockfiles, D0 artifacts, other domino packets, root config, and runtime Civ7 control packages protected (`proposal.md:90-96`; reinforced in `design.md:170-176`).

## Findings

### P1

None.

### P2

None.

### P3

1. `docs/projects/habitat-harness/openspec-remediation/packet-index.md:16` still lists D1 as enabling only D6, D7, D9, D11, and D12, while the repaired D1 packet says D1 feeds D6 through D14 and keeps D15 conditional (`proposal.md:98-100`).  
   Repair requirement: when marking D1 accepted for design/specification, update the index row to match the D1 downstream ledger and accepted status. This is an acceptance bookkeeping issue, not a D1 packet blocker.

2. `validateCheckReport` is correctly listed in the D0 prerequisite row classes and implementation inventory tasks (`proposal.md:53`, `tasks.md:18`), but the main design inventory groups the validator under the broader `CheckReport` row rather than naming it as its own package-export surface (`design.md:67`). Current code exports `validateCheckReport` from `src/index.ts`, so D0 must classify it separately if D1 changes validator behavior or public export semantics.  
   Repair requirement: during the D0-row/D1-inventory completion step, add an explicit `validateCheckReport` row or sub-row with package-export handling. This is already covered by tasks, so it is P3.

## Repair Requirements

- Before source implementation, every affected public/durable surface must have a concrete D0 `surface_id`, plane, `compatibility_handling`, target owner, and downstream citation.
- The implementation phase must complete the D1 inventory before source edits and must stop if any public row remains `blocked-pending-d0-row`.
- Any `src/index.ts` export change, command JSON change, hook/human-output wording change, docs-example rewrite, or generated/workstream artifact path change must cite the corresponding D0 row.
- D1 implementation must stay inside the approved write set and keep D3/D4 classify metadata, D8/D13 Pattern Authority fields, D0 artifacts, source domino packets, generated outputs, root config, and runtime Civ7 control packages protected unless the packet is amended and re-reviewed.
- Acceptance status update should repair the packet index D1 row and import this review into the D1 review ledger if the owner wants the packet to carry final review traceability.

## Non-Claims

- I did not implement TypeScript changes.
- I did not run OpenSpec validation or Habitat tests for this review.
- This review does not accept the future D0 matrix implementation.
- This review does not prove CI, runtime behavior, apply safety, Graphite readiness, current-tree cleanliness, product completion, or rule correctness.

Skills used: domain-design, information-design, solution-design, system-design, civ7-open-spec-workstream, typescript-refactoring.
