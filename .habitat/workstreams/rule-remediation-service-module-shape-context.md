# Service Module Shape Context Reclassification

Status: closed

Branch: `codex/habitat-service-module-shape-context`

## Purpose

Repair the stale Layer 2 action label for
`validate_habitat_service_module_file_shape`.

This row was labeled as a pending closed-structure inversion, but the
structure-check conversion already split the TOML-expressible direct root
topology into `validate_habitat_service_module_root_topology`. The remaining
script owns recursive suffix, policy naming, and router-shape constraints that
the current structure TOML runner cannot express.

## Selected Row

| Rule id | Outcome | Reason |
| --- | --- | --- |
| `validate_habitat_service_module_file_shape` | reclassified to context admission | Residual recursive suffix/router-shape validation remains live Habitat Toolkit service-module authority. |

## Excluded Adjacent Rows

| Rule id | Reason |
| --- | --- |
| `validate_habitat_service_module_root_topology` | Already owns direct root topology through `structure.toml`. |
| declarative file-tree/suffix allowlist runner | Future collapse target only; not currently available to replace recursive suffix/router-shape validation. |

## Decision

Keep the residual script as current Toolkit context authority. Do not convert
it to Grit, do not delete it, and do not move it to package-owned tests.

The future collapse point is a declarative file-tree/suffix allowlist runner
that can express recursive suffix policy and router-shape disjunctions.

## Verification

Run the retained rule, reconcile the canonical JSON with live manifests, run
`bun habitat classify .habitat`, and run `git diff --check`.
