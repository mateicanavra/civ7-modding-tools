# Review Disposition Ledger: D0 Public Surface Compatibility Matrix

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global concern catalogs must not substitute for packet-specific D0 review. | Global constraint | applied | D0 uses `domino-D0-review.md` as the packet-specific review input. |
| D0 compatibility matrix artifact contract was undefined. | P1 | accepted and repaired | `design.md` defines `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`, mandatory sections, row schema, row IDs, related rows, and citation rules. |
| D0 write set and protected paths were left to implementation. | P1 | accepted and repaired | `design.md` and `workstream/phase-record.md` name the approved write set and protected read-only paths. |
| D0 domain boundary collapsed multiple public-surface planes without authority rules. | P1 | accepted and repaired | `proposal.md` and `design.md` define plane authority, what D0 decides, and what downstream owners decide. |
| Validation gates did not falsify complete public-surface coverage. | P2 | accepted and repaired | `design.md`, `tasks.md`, `proposal.md`, and `spec.md` require export, command, root-script, Nx, generator, migration, hook, and docs-example completeness checks. |
| Hook validation command could execute local hook behavior. | P2 | accepted and repaired | Live `hook pre-commit -- --help` was replaced with `habitat hook --help` plus `test/lib/hooks.test.ts`. |
| Historical old-worktree paths were not dispositioned. | P2 | accepted and repaired | `design.md` and `phase-record.md` mark old absolute paths as provenance only and name the current worktree for execution. |
| Contract states were named but not semantically defined. | P2 | accepted and repaired | `design.md` defines the state glossary, decision rules, mutual exclusivity, and downstream permissions. |
| Spec delta was too thin for downstream citation. | P2 | accepted and repaired | `specs/habitat-harness/spec.md` now requires matrix path, stable row IDs, plane separation, completeness checks, and D0 no-source-change behavior. |
| Packet could still be read as broad documentation rather than a designed compatibility constraint. | P1 | accepted and repaired | `design.md` now includes Solution Design calibration, the acceptance threshold, constraint-shaping rationale, and a falsifier for implementation-time public-surface decisions. |
| TypeScript refactoring bar was implicit instead of designed into the D0 packet. | P1 | accepted and repaired | `design.md` now names the state-space smells D0 gates and the later safe refactoring moves it enables while keeping D0 source-read-only. |
| Stable row identity still left slug derivation, collision handling, and rename/deprecation policy to implementation. | P1 | accepted and repaired | `design.md` now defines deterministic plane-specific `surface_id` derivation, normalization, collision handling, non-reuse, rename/deprecation, and generated-derived lifecycle rules; `spec.md` and `tasks.md` require the same. |
| A downstream-ownership value acted as a compatibility-handling escape hatch. | P2 | accepted and repaired | `design.md`, `proposal.md`, `tasks.md`, and `spec.md` now require one closed handling action while keeping downstream ownership in `target_owner` and `downstream_dominoes`. |
| Row links collapsed multiple relationship meanings into a generic related-ID bucket. | P2 | accepted and repaired | `design.md`, `tasks.md`, and `spec.md` now replace the generic relationship bucket with typed `row_relationships`, a closed relation set, direction rules, allowed endpoint semantics, and a rule forbidding hidden relationships in `notes`. |
| Final D0 acceptance review found no remaining P1/P2 blockers. | Acceptance | accepted | `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md` records verdict `accepted` with no P1/P2 findings. |

## Review State

D0 has completed packet-specific review for design/specification purposes. Later
D0 implementation still needs its own implementation review after the matrix is
authored, but that is a separate gate.
