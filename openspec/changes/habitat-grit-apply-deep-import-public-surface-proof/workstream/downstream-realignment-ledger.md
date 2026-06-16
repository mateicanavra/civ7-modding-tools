# Downstream Realignment Ledger

| Downstream surface | Current risk | Required realignment | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Current apply row is aggregate and can hide codemod-specific transaction proof. | Link apply row proof classes to this packet after implementation. | aligned: row cites `HGPR-APPLY-*` target-export, dry-run, applied-diff, selected-gate, and cleanup proof ids |
| `openspec/changes/habitat-grit-proof-repair/specs/habitat-harness/spec.md` | Existing apply safety requirement is broad. | Keep aggregate requirement, but point implementation proof to this packet. | no spec edit needed; matrix and command log carry the proof ids |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-PRODUCT-TRANSFORMS` could be read as satisfied by pattern existence. | Record bounded safe-transform proof while preserving that broader product transform closure needs more than one bounded codemod. | aligned in this checkpoint |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current apply row lists required proof but has stale pending wording. | Add proof packet and proof ids after implementation. | aligned in this checkpoint |
| `docs/projects/habitat-harness/effect-orchestration-evaluation.md` | Effect selection is aggregate to Grit adapter. | Keep this packet as a consumer of the Grit adapter transaction flow. | no doc edit needed in design phase |
| `openspec/changes/habitat-grit-catalog/proposal.md` | H5 text presents the codemod as a first-class remediation path from the historical catalog closure. | Treat as historical; current safe-transform proof is in this packet and aggregate `HGPR-APPLY-*` records. | no edit needed in this checkpoint |
| `openspec/changes/habitat-grit-catalog/tasks.md` | H5 marks the codemod task complete for wiring and fixture-gated behavior. | Preserve the wiring history while linking safe-transform status to this packet's proof ids. | no edit needed in this checkpoint |
| `openspec/changes/habitat-grit-catalog/workstream/phase-record.md` | H5 closure can be read as broader than the current evidence supports. | Keep H5 closure historical; use this packet for current apply safety proof. | no edit needed in this checkpoint |
| `docs/projects/habitat-harness/workstream-record.md` | The train record describes H5 as locally closed and includes codemod/file-layer claims from that historical phase. | Keep H5 closure historical; safe-transform product status comes only from this packet and aggregate proof ids. | no edit needed in this checkpoint |
| Habitat command docs or README | If user-visible `habitat fix` output changes after adapter implementation, docs may drift. | Update only if implementation changes output or safety wording. | no edit needed; no user-visible command output changes |

## Realignment Rule

No downstream surface may count `deep_import_to_public_surface` as a broad
product/runtime transform. Within the supported named import rewrite boundary,
downstream surfaces may cite the accepted `HGPR-APPLY-*` proof ids for
target-export, dry-run, applied-diff, selected gates, and cleanup.
