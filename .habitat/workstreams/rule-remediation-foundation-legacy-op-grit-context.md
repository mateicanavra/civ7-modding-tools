# Foundation Legacy Operation Grit Context Reclassification

Status: closed

Branch: `codex/habitat-foundation-legacy-op-grit-context`

## Purpose

Repair stale Layer 2 action labels for four foundation legacy operation and
contract Grit checks. These rows are source-backed recurrence guards, not
generic retired-key clutter.

## Authority

`docs/system/libs/mapgen/reference/domains/FOUNDATION.md` names the current
decomposed foundation operation surface and explicitly says the legacy
`foundation/compute-tectonic-history` aggregate compatibility op must not be
reintroduced.

The same source separates plate graph metadata/partition authority from plate
motion kinematics. That makes the plate-kinematics row a real contract-surface
guard, not stale residue.

## Selected Rows

| Rule id | Outcome | Reason |
| --- | --- | --- |
| `prohibit_foundation_legacy_aggregate_tectonic_op_surface` | reclassified to context admission | Exact Grit guard for the foundation operation public surface. |
| `prohibit_foundation_legacy_aggregate_tectonics` | reclassified to context admission | Exact Grit guard for domain root and standard tectonics contract aggregate-op relapse. |
| `prohibit_foundation_legacy_plate_kinematics` | reclassified to context admission | Exact Grit guard for keeping compute-plate-graph kinematics-free. |
| `prohibit_legacy_compute_tectonics_token` | reclassified to context admission | Exact Grit guard against reintroducing the retired monolithic `computeTectonics` token across foundation surfaces. |

## Decision

Leave the rule packets in place and keep them as Grit. They are static
source-token/source-shape predicates with bounded owner surfaces. They should
not be moved to package-owned tests, converted to Habitat scripts, or deleted
as dead literals.

Future consolidation is valid only if a positive foundation operation registry
or operation contract rail fully subsumes these exact predicates.

## Verification

Run focused Habitat checks for all four retained rules, reconcile the canonical
JSON with live manifests, run `bun habitat classify .habitat`, and run
`git diff --check`.
