# Domino 063: Admit Morphology Public-Surface Import Boundary

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 63: Admit Morphology Public-Surface Import Boundary

Status: closed on `codex/habitat-morphology-public-surface-boundary`.

Purpose: replace the morphology `_remainder` retired-module import proxy with
live public-surface import authority, without turning a Grit-shaped predicate
into a Habitat script or package test.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `prohibit_legacy_morphology_module_imports` | retired/replaced | The retired `@mapgen/domain/morphology/<legacy>` blacklist was a proxy for a missing public-surface import boundary. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-morphology-public-surface-boundary-slice.md` |
| `require_morphology_public_surface_imports` | created/admitted | Non-domain consumers now have one live Grit rule that permits Morphology imports through the root, `/ops`, `/ops/index.js`, or `/config.js` surfaces. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-morphology-public-surface-boundary-slice.md` |

Moves it forward:

- Removes the Morphology `_remainder` import-boundary row.
- Converts a retired-path negative assertion into live public-surface import
  authority.
- Keeps this as a Grit rule because the predicate is static import/export
  source shape.
- Leaves the existing G4 recipe-domain import matrix as recipe-wide authority;
  this row owns morphology-specific consumer relapse detection.

Closure note:

- Nx project boundaries remain project-plane authority and were not changed.
- No package-owned tests or bespoke Habitat script were introduced.
