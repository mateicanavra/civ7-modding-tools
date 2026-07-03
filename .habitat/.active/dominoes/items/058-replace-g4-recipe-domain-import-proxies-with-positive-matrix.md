# Domino 058: Replace G4 Recipe Domain Import Proxies With Positive Matrix

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 58: Replace G4 Recipe Domain Import Proxies With Positive Matrix

Status: closed on `codex/habitat-g4-domain-import-matrix`.

Purpose: close the next Layer 2 -> Layer 3 boundary-inversion slice by
collapsing three overlapping G4 recipe-domain import proxy rules into one
positive Grit import matrix.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `require_public_domain_surfaces_in_recipes_and_maps` | preserved and narrowed to recipe-source G4 authority | This is the surviving positive import matrix for `mods/mod-swooper-maps/src/recipes/**`: allow domain root, `/ops`, `/ops/index.js`, and `/config.js`; forbid deeper alias tails and known relative reaches into `src/domain`. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-domain-import-matrix-slice.md` |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | absorbed/deleted | The recipe-source predicate is covered by the survivor rule; map-source clauses are excluded from this first G4 enforcement because the accepted architecture packet only authorizes `src/recipes/**` at this stage. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-domain-import-matrix-slice.md` |
| `restrict_recipes_to_public_domain_surfaces` | absorbed/deleted | The unknown-tail predicate is covered by the survivor rule's positive allowed-surface matrix. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-domain-import-matrix-slice.md` |

Moves it forward:

- Replaces overlapping negative proxy packets with one Grit rule instead of a
  bespoke script or package-owned tests.
- Repairs the one current source violation by exporting
  `DEFAULT_ELEVATION_SCALE` from the public morphology ops surface and updating
  the standard recipe import to use that surface.
- Updates the canonical JSON so the current live corpus is 118 rules and the
  G4 packet no longer appears in the next Layer 2 queue.

Closure note:

- Nx project boundaries remain the project-plane owner; this slice is below
  that granularity and stays in Habitat/Grit.
- Map-source clauses remain excluded pending a map-specific authority decision.
- The next recorded move is Layer 2 packet selection from the canonical JSON.
