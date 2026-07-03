# Rule Remediation: Standard Recipe Topology Slice

Status: closed

Branch: `codex/habitat-standard-recipe-topology-rail`

Canonical source:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`

## Purpose

Close the standard recipe stage-root topology sub-slice without folding in the
adjacent G9 wrapper-only `advanced` config guard. The topology rule now derives
active stage authority from source instead of preserving a hardcoded directory
inventory.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `preserve_standard_stage_topology_and_path_invariants` | Preserved as standard recipe structure authority and converted from a hardcoded structure runner to a source-derived Habitat script runner. |

## Exclusions

| Rule id | Reason |
| --- | --- |
| `prohibit_wrapper_only_advanced_config` | Not stage-root topology. The row is G9 wrapper-only `advanced` recurrence pressure and remains live for a separate consolidation/source-validation packet. |

## Decision

Use a Habitat script for this rule because the predicate is computed authority:
it parses `recipe.ts` and `contract-manifest.ts`, compares their stage ids, then
verifies the stage-root filesystem shape. A Grit pattern would only see one
syntax surface at a time; the old structure file could only repeat a stale list.

The active stage directories are now the stage ids declared by the standard
contract manifest and runtime recipe. The bare `ecology`, `foundation`, and
`morphology` folders are admitted support hubs, not active stage ids. Retired
stage roots and unexpected children remain forbidden.

## Review Disposition

| Finding | Disposition |
| --- | --- |
| The old rule required shared support hubs as if they were stage roots. | Repaired. The script admits them as support directories and derives active stage roots from source. |
| The `advanced` guard is adjacent closed-structure pressure. | Excluded. Docs keep it as G9 Habitat guard pressure, but its current predicate spans recipe and map config surfaces and needs its own packet. |
| Package tests should not become stale-key blacklist drawers. | Preserved. No package tests were added. |

## Verification

- `bun habitat check --rule preserve_standard_stage_topology_and_path_invariants --json`
  passed with the script runner.
- The old hardcoded `structure.toml` is removed from the packet.
- `prohibit_wrapper_only_advanced_config` remains live and explicitly requeued
  in the canonical JSON.
