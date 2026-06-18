# D1 Rereview: Domain/Ontology And Information Design

## Scope

Fresh rereview of the repaired D1 Receipt And Command Record Boundary packet for design/specification acceptance:

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary`

This review is not implementation and not a redesign. It checks whether the repaired blockers from the final domain/ontology and information-design reviews are cleared.

Mandatory anchoring read before reviewing:

- Domain Design skill in full.
- Information Design skill in full.
- Ontology Design skill in full, including all files in its skill directory.
- Repo-local TypeScript/refactoring corpus relevant to naming and state-space collapse, including the architecture normalization packet, domain modeling guidelines, dependency terminology ADR, and recipe-compile type/config/compilation surfaces.
- D1 packet files in full: `proposal.md`, `design.md`, `tasks.md`, `specs/habitat-harness/spec.md`, and `workstream/*.md`.
- Prior final D1 domain/ontology and information-design review scratch docs.
- D1 source domino packet.
- Repaired packet-index and D10 proposal/tasks dependency sections.
- D0 accepted row contract and closure checklist.

## Verdict

Accepted for design/specification.

No P1 or P2 findings remain in the combined domain/ontology and information-design lane. The repaired packet now gives implementation agents a bounded target vocabulary, separates D0 compatibility handling from D1 strategy, names endpoint classes for relationships, sharpens family ownership enough for design acceptance, defines the D1 inventory row contract and validation-result recording location, and keeps implementation blocked on actual D0 matrix rows.

This acceptance is design/specification only. It does not accept TypeScript implementation, D0 matrix implementation, CI behavior, runtime behavior, apply safety, Graphite readiness, current-tree cleanliness, OpenSpec closure beyond validation shape, product completion, or rule correctness.

## Findings

### P1

None.

### P2

None.

### P3

None.

## Repaired Blocker Checks

| Blocker | Cleared? | Review basis |
| --- | --- | --- |
| D0 action vocabulary separation | Yes | `proposal.md` keeps D0 implementation handling to the closed set at lines 45-47, and `design.md` separates D0 handling from D1 strategy at lines 34-50 and in inventory columns at lines 75-91. The previous mixed terms are gone from the adapter row and protected downstream rows. |
| Execution inventory row contract and D0 row slot | Yes | `design.md` now defines a D1 execution inventory row contract with `d0_surface_id`, `d0_contract_state`, `d0_compatibility_handling`, target family, owner, tests, bad case, non-claims, downstream consumers, and implementation disposition at lines 67-91. The seed inventory table uses those columns at lines 93-108. |
| Relationship endpoint classes | Yes | `design.md` defines `CommandInvocation`, `PostStateObservation`, `LegacyCompatibilitySurface`, `DownstreamHandoffTarget`, and `RefusedRequest` as target semantic objects at lines 17-29, and the relationship table binds allowed source/target endpoint classes at lines 123-140. `spec.md` also forbids free-form target endpoint strings at lines 184-187. |
| Owner sharpness | Yes | `design.md` separates D1 shared receipt/handoff ownership from D6/D7 diagnostic taxonomy, D12 verify composition, D11 local feedback, D9 apply transaction, current adapter artifact ownership, Graphite state, and OpenSpec records at lines 52-65. The inventory rows carry single row owners/protected owners at lines 99-108. |
| Validation result recording location | Yes | `tasks.md` directs every validation result to `workstream/phase-record.md` under `Validation Results Recording Contract` at line 55. `phase-record.md` defines that results table and its columns at lines 71-90. |
| Phase-record closed action set | Yes | `phase-record.md` uses the D0 closed handling set without the prior stray `remove` action at lines 34-39. |
| Target-suspect evidence wording | Yes | `spec.md` now says "apply change observation" in the unsupported apply change scenario at lines 172-174, matching D1's evidence-vs-observation distinction. |
| D1 source implementation still blocks on actual D0 matrix rows | Yes | D0's matrix file is absent in this worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/public-surface-compatibility-matrix.md` does not exist. D1 correctly keeps implementation blocked until affected rows exist in `proposal.md` lines 43-60, `tasks.md` lines 12-14, `phase-record.md` lines 15-17 and 34-39, and `closure-checklist.md` implementation prerequisites. |

## Dependency And Index Checks

- D1's packet-index row now enables D6, D7, D8, D9, D10, D11, D12, D13, and D14, matching the source D1 dependency order and repaired downstream ledger: `packet-index.md` line 16.
- D10 now explicitly requires D1 and consumes D1 `RefusalRecord` / non-claim semantics: `D10 proposal.md` lines 27-30 and 37-42; `D10 tasks.md` lines 14-17.
- D15 remains conditional rather than triggered by D1 alone: `D1 proposal.md` lines 98-100 and `D1 phase-record.md` lines 103-106.

## Post-Launch Cleanup Confirmation

After this rereview launched, two narrow cleanup edits landed on disk. I re-opened the current files before finalizing this scratch verdict.

| Cleanup point | Acceptable? | Review basis |
| --- | --- | --- |
| Adapter retention/raw-output scenarios moved under `Requirement: Adapter Command Artifacts Are Compatibility-Bounded`. | Yes | `specs/habitat-harness/spec.md` now places `Adapter artifact retention is invalid` and `Adapter artifact raw output is unbounded` under the adapter-artifact requirement at lines 124-147, before the legacy DTO and typed-relationship requirements. This is the correct information architecture: retention and raw-output bounding are adapter artifact semantics, not relationship semantics. |
| D1 protected-path language allows only narrow D10 dependency metadata edits and no D10 behavior/design/spec/validation repair. | Yes | `proposal.md` limits the cross-packet exception to D10 `Requires`, dependency-gate task, and refusal-vocabulary dependency line only, and says D1 does not authorize D10 behavior, design, spec, or validation repair at lines 90-96. `design.md` repeats the same metadata-only exception at lines 207-209. `workstream/downstream-realignment-ledger.md` names the two allowed D10 metadata surfaces and forbids D10 behavior, design, spec, validation, write-set, protected-path, or review-ledger repair at lines 34-41. |

These cleanup points do not change the acceptance verdict. D1 remains accepted for design/specification in this lane, with implementation still blocked on actual D0 matrix rows.

## Validation Performed

- `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict`: passed.
- `bun run openspec:validate`: passed, 249 items passed and 0 failed.
- `git diff --check`: passed.
- `git status --short --branch`: recorded existing broad remediation worktree dirtiness; this rereview did not edit source code.

## Non-Claims

- This review did not implement D1.
- This review did not run Habitat behavior tests.
- This review did not accept future D0 matrix implementation.
- This review did not review broad downstream packet correctness outside the repaired D1 dependency implications requested here.
- Current source names remain present-behavior evidence, not target authority.

Skills used: domain-design, information-design, ontology-design.
