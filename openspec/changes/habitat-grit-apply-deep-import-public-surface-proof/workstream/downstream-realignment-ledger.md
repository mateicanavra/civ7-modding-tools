# Downstream Realignment Ledger

| Downstream surface | Current risk | Required realignment | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Current apply row is aggregate and can hide codemod-specific transaction proof. | Link apply row proof classes to this packet after implementation. | pending implementation |
| `openspec/changes/habitat-grit-proof-repair/specs/habitat-harness/spec.md` | Existing apply safety requirement is broad. | Keep aggregate requirement, but point implementation proof to this packet. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-PRODUCT-TRANSFORMS` could be read as satisfied by pattern existence. | Record product-safe status only after target-export, dry-run, applied-diff, rollback, and type/test proof. | pending implementation |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current apply row lists required proof but has no packet link. | Add proof packet and proof ids after implementation. | pending implementation |
| `docs/projects/habitat-harness/effect-orchestration-evaluation.md` | Effect selection is aggregate to Grit adapter. | Keep this packet as a consumer of the Grit adapter transaction flow. | no doc edit needed in design phase |
| `openspec/changes/habitat-grit-catalog/proposal.md` | H5 text presents the codemod as a first-class remediation path from the historical catalog closure. | Treat as historical until this packet records proof ids; annotate or realign if implementation edits H5 records. | pending implementation |
| `openspec/changes/habitat-grit-catalog/tasks.md` | H5 marks the codemod task complete for wiring and fixture-gated behavior. | Preserve the wiring history while linking safe-transform status to this packet's proof ids. | pending implementation |
| `openspec/changes/habitat-grit-catalog/workstream/phase-record.md` | H5 closure can be read as broader than the current evidence supports. | Record the codemod safety boundary if H5 records are touched during implementation. | pending implementation |
| `docs/projects/habitat-harness/workstream-record.md` | The train record describes H5 as locally closed and includes codemod/file-layer claims from that historical phase. | Keep H5 closure historical; safe-transform product status comes only from this packet after proof id linkage. | pending implementation |
| Habitat command docs or README | If user-visible `habitat fix` output changes after adapter implementation, docs may drift. | Update only if implementation changes output or safety wording. | pending implementation |

## Realignment Rule

No downstream surface may count `deep_import_to_public_surface` as product-safe
transformation until the proof artifact names all required proof classes and
the aggregate Grit matrix links to that artifact.
