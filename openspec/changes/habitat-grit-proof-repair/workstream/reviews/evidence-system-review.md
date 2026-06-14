# Evidence And System Review

## Verdict

Conditional pass on direction; not implementation-ready until the P2 repairs are made.

The packet correctly names the false-confidence loop: H5/H6 converted native Grit samples, cached target output, and old parity prose into broader proof than the evidence supported. The repair design adds the right balancing controls: proof-class labels, per-row Grit obligations, explicit baseline files, injected violations, apply safety gates, Effect/substrate triggers, and downstream stale-record realignment.

The remaining blockers are about enforceability. The packet says command outputs and row-level evidence must be recorded, but the current artifacts do not yet define a durable command-output capture contract or a proof matrix shape that can carry every required row field.

## Findings

| ID | Severity (P1/P2/P3) | Location | Finding | Required repair |
| --- | --- | --- | --- | --- |
| ESR-1 | P2 | `openspec/changes/habitat-grit-proof-repair/design.md:212`; `openspec/changes/habitat-grit-proof-repair/tasks.md:93`; `openspec/changes/habitat-grit-proof-repair/workstream/phase-record.md:138` | Command proof is required, but the packet does not define a durable command-output record shape for every gate. Current records summarize results, while closure depends on exact exit code, cwd, env, branch/commit, stdout/stderr or JSON artifact, parsed summary, cache/fresh status for Nx, proof class, and non-claim. Without that contract, an implementer can still turn a command name plus a green summary into proof inflation. | Add a command-proof log contract, either as `workstream/command-proof-log.md` or as required phase-record/matrix fields. Require each verification row to record branch/commit, command, cwd, relevant env, exit code, raw output path or bounded excerpt, parsed result, cache/fresh status where relevant, proof class, non-claim, and skipped-gate rationale. Make task 9 depend on filling that record before any proof label is accepted. |
| ESR-2 | P2 | `openspec/changes/habitat-grit-proof-repair/design.md:87`; `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md:18`; `openspec/changes/habitat-grit-proof-repair/tasks.md:12` | The proof matrix contract is stronger than the seeded matrix can carry. Design requires pattern path, Habitat rule id, normative source, proving source, exact scan roots/exclusions, native command and sample count, current-tree command/output class, injected probe path, baseline action, parity result, apply disposition, non-claims, and downstream records. The current matrix columns omit several of those fields and the task list does not make row completion testable. This lets rows be marked proven without the authority and evidence fields that prevent proof inflation. | Revise `workstream/grit-proof-matrix.md` so each current check and apply row either contains every design-contract field or links to a row in `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` and records the repair-specific proof fields locally. Add an explicit task gate that no row can move out of pending status until every matrix contract field is filled. |
| ESR-3 | P3 | `openspec/changes/habitat-grit-proof-repair/tasks.md:3`; `openspec/changes/habitat-grit-proof-repair/workstream/phase-record.md:128` | The phase record says task 1.1 is complete, but `tasks.md` still leaves 1.1 unchecked. This is a local stale-record mismatch inside the new packet. | Align the task state before implementation: either check 1.1 after all draft artifacts and review placeholders exist, or change the phase record to say the draft was opened but not yet accepted. |
| ESR-4 | P3 | `openspec/changes/habitat-grit-proof-repair/workstream/downstream-realignment-ledger.md:8`; `openspec/changes/habitat-grit-proof-repair/tasks.md:82` | The downstream ledger identifies stale H5/H6/project records, but every disposition is only pending implementation. During implementation, those old records can still be read as current unless the packet marks them as historical until repaired. | Add an interim disposition for stale H5/H6/project records, such as "historical until this repair lands", and require implementers to use this packet's current-state sections as the controlling proof boundary while the downstream patches are pending. |
| ESR-5 | P3 | `openspec/changes/habitat-grit-proof-repair/tasks.md:34`; `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md:59` | Raw Grit acquisition is correctly separated from Habitat wrapper proof, but task 3.5 leaves the closure shape loose: it allows proof or explanation without saying where the raw proof class is recorded as satisfied or unclaimed. | Make task 3.5 update every affected matrix row with one explicit value: raw acquisition proof satisfied with command/output record, or raw direct proof unclaimed and Habitat wrapper proof controls only the current-tree wrapper claim. |

## Positive Checks

- The packet separates native sample proof from current-tree enforcement, baseline behavior, parity, and apply safety.
- Nx cache is treated as scheduling evidence, not as fresh Grit semantics proof.
- The baseline decision repairs the missing-file ambiguity by requiring explicit committed empty baseline files for the current Grit checks.
- Apply safety is gated on injected dry-run, applied diff shape, target export existence, type-only preservation, selected type/test proof, rollback, and clean worktree state.
- H5/H6 are treated as historical records unless current evidence re-proves their claims.
- The Effect trigger matrix blocks ad hoc Grit adapter parse/provenance/transaction machinery from growing inside the current TypeScript adapter without a substrate decision.
- `bun run openspec -- validate habitat-grit-proof-repair --strict` passes.

## Open Questions

- Is raw direct `grit --json check` acquisition required as lower-level adapter proof, or is injected wrapper proof sufficient when raw direct proof is explicitly recorded as unclaimed?
- Which artifact should own command transcript retention: phase record, proof matrix, or a dedicated command-proof log?
- Should downstream H5/H6 record patches happen immediately after proof classes are designed, or only after each row receives implementation evidence?
