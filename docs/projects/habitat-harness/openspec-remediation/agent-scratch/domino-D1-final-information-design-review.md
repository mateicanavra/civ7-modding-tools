# D1 Final Information-Design Review

## Verdict

Not accepted for design/specification.

D1 is substantially repaired from the earlier scaffold: it now has family-specific target objects, owner boundaries, term disposition, state families, relationship ontology, non-claims, protected paths, downstream handoffs, and falsifying validation gates. The remaining blockers are information-architecture blockers, not broad corpus repair or implementation issues. A future implementation agent would still have to decide where and how to record the D1 execution inventory and validation results before source edits, and the packet index would still carry stale dependency information if D1 were marked accepted as-is.

OpenSpec shape checks passed:

- `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict`: passed.
- `bun run openspec:validate`: passed.
- `git diff --check`: passed.

These validate artifact shape and patch hygiene only. They do not prove D1 implementation, current-tree correctness, CI, runtime behavior, apply safety, Graphite readiness, product completion, or D0 matrix implementation.

## Review Scope

Lane: information-design reviewer. This review checks whether the D1 design/specification packet can be executed after context compaction without rediscovery, local guessing, or implementation-time product/domain decisions.

Read:

- Domain Design skill, in full.
- Information Design skill, in full.
- Solution Design skill, in full.
- Civ7 Systematic Workstream skill and relevant references: method loop, evidence/proof, team review lanes, failure patterns.
- Civ7 OpenSpec Workstream skill and relevant references: phase loop, artifact contracts, validation checks, failure patterns.
- Root `AGENTS.md`.
- Remediation frame and D1 source domino packet.
- D1 OpenSpec packet files in full: `proposal.md`, `design.md`, `tasks.md`, `specs/habitat-harness/spec.md`, and all `workstream/*.md`.
- D1 scratch investigations/reviews in full: code/topology, domain/ontology, OpenSpec/testing, and prior D1 review.
- Accepted D0 packet in full, including final D0 acceptance review.
- Packet index and global review disposition ledger.

## P1 Findings

### P1 - The D1 execution inventory has no complete row contract or stable recording shape

References:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, section `D0 Surface Dependency Inventory`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, sections `2. D0 Compatibility Prerequisite` and `3. D1 Surface Inventory`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/closure-checklist.md`, `Implementation Prerequisites`.
- Accepted D0 baseline: `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`, sections `Matrix Artifact Contract`, `Surface Identity Contract`, and `Compatibility Handling Semantics`.

The packet repeatedly makes the D1 inventory a hard pre-source-edit gate, but the table that implementation is supposed to complete does not contain the fields the packet itself requires. `design.md` says implementation must complete the table with concrete D0 `surface_id` values before source edits, but the table has no `D0 surface_id` column, no per-plane row slot, no actual D0 `contract_state`, no `schema_version_stance`, no required test/gate column, no non-claim set, no downstream consumer column, and no explicit implementation disposition column.

The missing shape matters because `tasks.md` requires each row to choose exactly one target family, owner, compatibility stance, schema/version stance, required test, bad case, non-claim set, and downstream consumer. The closure checklist then requires every D1 inventory row to cite a D0 `surface_id` or be explicitly internal/protected. Those requirements are correct, but they are distributed as prose and task bullets rather than encoded in the inventory artifact the implementation agent must fill.

This fails the information-design skim and compaction tests: after compaction, a future agent can see that an inventory is required, but not the authoritative row schema or where all execution-critical fields belong. It also weakens D0's accepted discipline, where row identity, plane separation, compatibility handling, relationships, and non-claims are first-class columns rather than implementation-time interpretation.

Required repair:

Add a D1 execution inventory row contract in `design.md`, then update the inventory table to use it. Minimum columns:

`current_surface`, `current_path`, `d0_plane`, `d0_surface_id`, `d0_contract_state`, `d0_compatibility_handling`, `target_family`, `target_name`, `schema_version_stance`, `owner`, `forbidden_owner_or_protected_owner`, `d1_strategy`, `required_test_or_gate`, `bad_case`, `non_claims`, `downstream_consumers`, and `implementation_disposition`.

The table may use `blocked-pending-d0-row` only for design/specification status. It must state that implementation source edits cannot start until each non-protected public/durable row has concrete D0 row citations and no placeholder remains.

## P2 Findings

### P2 - Validation gates name expected results but do not define where actual results are recorded

References:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/proposal.md`, section `Validation Gates`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, section `Validation Design`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, section `6. Validation Gates`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/phase-record.md`, section `Validation Gates`.

D1 correctly requires each gate to record command, expected status, actual status, oracle, bad case, cache/freshness stance, and non-claims. But the phase-record table has no actual-status/evidence column, and `tasks.md` lists expected statuses without a result-recording shape.

The result is a subtle execution hazard: implementation agents know what to run, but must invent whether results belong in the phase record table, a new results table, the closure checklist, a separate artifact, or the matrix/inventory row. That is exactly the kind of local recordkeeping decision this packet is supposed to remove.

Required repair:

Add either:

- an `Actual status / evidence` column to the phase-record validation table, with an instruction that implementation fills it as gates run; or
- a separate `Validation Results` table contract naming columns for `gate`, `command`, `expected_status`, `actual_status`, `evidence_path_or_summary`, `cache_freshness_observed`, `non_claims_confirmed`, and `blocker_disposition`.

Then make `tasks.md` point to that result location.

### P2 - Packet index implications are stale relative to the repaired D1 packet

References:

- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`, D1 row.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/proposal.md`, section `Enables`.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/downstream-realignment-ledger.md`, downstream table and `Index Update Rule`.
- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/D1-proof-contract-boundary.md`, section `Dependency Order`.

The repaired D1 packet now says D1 feeds D6, D7, D8, D9, D10, D11, D12, D13, and D14, with D15 conditional. The packet index still says D1 enables only D6, D7, D9, D11, and D12. The downstream ledger says the index should be updated after final D1 acceptance review, but the rule only says to update acceptance status; it does not explicitly require correcting the `Enables` cell.

This is an index/navigation issue, not a target-contract issue. If D1 were marked accepted while the index retained the narrower dependency set, downstream agents could skip D1 when working D8, D10, D13, or D14 and reintroduce local proof/receipt language.

Required repair:

Before marking D1 accepted in the packet index, update the D1 row's `Enables` cell to match the repaired D1 downstream ledger, or explicitly document a reduced set with rationale. The downstream ledger's `Index Update Rule` should mention both acceptance status and dependency-cell correction.

## P3 Findings

### P3 - One stop-condition line mixes D0 compatibility handling with a non-D0 removal action

Reference:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/phase-record.md`, section `D0 Prerequisite State`.

The phase record says no public surface `preserve/version/facade/deprecate/refuse/remove` action may occur without its D0 row. `remove` is not part of D0's closed compatibility handling set; D0 uses `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, and `generated-only`. D1 has a separate terminology classification state named `remove`, so the line is understandable, but it overloads two classification systems in a status section.

Suggested repair:

Reword the stop condition to keep D0 handling and D1 terminology classification separate. For example: "No public surface handling may occur without its D0 row and one D0 closed handling action; any D1 terminology removal must be authorized by that row plus the owning packet."

## Acceptance Requirements

D1 should not be marked accepted until the P1 and P2 repairs above are made and rechecked. The repair is narrow:

- Add a complete D1 execution inventory row contract and align the existing inventory table with it.
- Add a stable validation-result recording shape and point tasks to it.
- Update the packet index dependency implications when acceptance status is changed.
- Clean up the overloaded `remove` wording if editing the phase record anyway.

No TypeScript source implementation is required for these repairs.

## Compaction-Durability Check

Current packet durability: not sufficient for acceptance.

The repaired D1 packet is durable for broad design context: a future agent can recover the D1 objective, owners, target terms, protected paths, downstream consumers, and validation gate intentions from files. It is not durable enough for execution because the exact D1 inventory row schema and validation-result location are still inferred across `design.md`, `tasks.md`, the phase record, and the closure checklist.

This scratch review is durable at:

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-information-design-review.md`

Before D1 status changes, import this review's accepted P1/P2 findings into the D1 review disposition ledger with repair evidence. Otherwise acceptance state will again depend on chat memory or scratch discovery rather than the packet's own control records.

Skills used: domain-design, information-design, solution-design, civ7-systematic-workstream, civ7-open-spec-workstream.
