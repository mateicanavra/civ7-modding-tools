# Domino 047: Sort Civ7 Resource Blueprint Candidates

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The active `civ7/resources` `_blueprints` rows moved into `map-policy` and `civ7-types` child resource/package lanes rather than admitted blueprint kinds.

## Detail

#### Domino 47 Disposition Receipt

This receipt burns down the active `civ7/resources` `_blueprints` slice from
`UNDERSCORE-BLUEPRINT-BURNDOWN-FRAME.md`. It processes the `civ7-map-policy`
and `civ7-types` candidate pockets as resource/package operating areas, not as
affirmed blueprint kinds.

Metrics:

- Scoped `_blueprints` rows: 4.
- Candidate pockets processed: 2 (`civ7-map-policy`, `civ7-types`).
- Runner mix: 2 `habitat` file-layer generated-zone guards, 2 `habitat`
  script checks.
- Category mix: 3 `output`, 1 `boundary`.
- Source roots: `packages/civ7-map-policy/src/civ7-tables.gen.ts`,
  `packages/civ7-map-policy/src/**`, and `packages/civ7-types/generated/**`.
- Single-package/resource rows: 4.
- Cross-owner rows: 0.
- Deferred non-Civ7 rows inspected for hidden Civ7 resource authority: 12.
  Rows pulled into scope: 0.

Decision matrix:

| Rule | Decision | Destination | Reason | Pending action |
| --- | --- | --- | --- | --- |
| `block_hand_edits_to_generated_map_policy_tables` | move to child-niche rules | `civ7/resources/map-policy/rules` | Protects one official-resource-derived generated table surface for `@civ7/map-policy`; the remediation is the package verify/generate path, not a constructible blueprint instance. | Revisit only if protected generated-resource output becomes a parameterized generated-output capability or generator-owned rule. |
| `ensure_map_policy_dependency_independence` | move to child-niche rules | `civ7/resources/map-policy/rules` | Governs `@civ7/map-policy` package independence from runtime, MapGen, mods, Studio, and base-standard implementation imports. | Convert to a shared import-boundary enforcement surface only if later source-check extraction makes that destination explicit. |
| `preserve_evidence_provenance_labels` | move to child-niche rules | `civ7/resources/map-policy/rules` | Checks source-evidence labeling on the generated map-policy table; this is resource-derived package currentness, not a reusable blueprint kind. | Revisit if provenance validation moves into the map-policy generator or package-local verification target. |
| `block_hand_edits_to_generated_civ7_types` | move to child-niche rules | `civ7/resources/civ7-types/rules` | Protects the generated declaration surface owned by `@civ7/types`; `civ7-types` is a package/resource lane here, not a constructible blueprint kind. | Revisit only if external-resource generated declaration protection becomes a parameterized generated-output capability. |

Review lanes:

- Corpus auditor: every scoped resource `_blueprints` row received exactly one
  disposition, and `.habitat/civ7/resources/_blueprints` was removed.
- Semantic reviewer: no blueprint was admitted; `civ7-map-policy` and
  `civ7-types` were treated as child operating/resource lanes rather than kind
  names.
- Interface reviewer: manifests now point at the moved `baseline.json` and
  `check.ts` files under the new physical paths.
- Closure reviewer: the authority ledger records current placement, path,
  pending action, and Domino 47 evidence for all four rows.

Residual scope:

- `civ7/platform/_blueprints` is the next active Civ7 burndown loop and is
  handled by Domino 48 below.
- `docs`, `global/workspace`, and `habitat/toolkit` `_blueprints` rows remain
  deferred; none of their whole predicates hid Civ7 resource authority in this
  loop.
