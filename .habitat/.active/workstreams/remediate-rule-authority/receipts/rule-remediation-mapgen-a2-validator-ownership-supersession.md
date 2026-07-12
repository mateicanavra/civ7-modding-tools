# Rule Remediation: MapGen A.2 Validator Ownership Supersession

Status: implemented; branch gates remain owned by the Packet A.2 prerequisite

Controlling decision:
`docs/projects/mapgen-studio-runtime-transition/packet-a2-domain-operation-topology.md`

Canonical ledger:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Supersession

Packet A.2 supersedes the earlier retention dispositions in:

- `rule-remediation-generated-output-and-projection-native-rails.md` for
  `validate_generated_map_entrypoint_contracts`;
- `rule-remediation-standard-recipe-context-guards.md` for the two standard
  recipe command checks;
- `rule-remediation-standard-stage-key-freeze-retirement-slice.md` only where
  it described those two checks as retained exclusions.

Those closed receipts remain unchanged as historical observations. This receipt
records the later, higher-ranked ownership decision instead of rewriting their
past command-check wave.

## Retirement

| Retired Habitat rule | Destination | Retained behavior |
| --- | --- | --- |
| `validate_generated_map_entrypoint_contracts` | Nx `mod-swooper-maps:generated:check`, depending on `gen:maps` | A non-cacheable post-generation Git status check detects stale, missing, extra, or changed tracked map entrypoints. |
| `verify_standard_recipe_artifacts_match_source_stages` | `mods/mod-swooper-maps/test/recipes/swooper-physics-standard/recipe/standard-generated-artifacts.test.ts` through Nx `mod-swooper-maps:test` | Generated schema, complete defaults, and UI metadata structure are compared with source derivations. |
| `verify_standard_recipe_public_authoring_surface` | The same Swooper package test, plus existing `mapgen-core:test` laws and `mapgen-studio:test` consumer coverage | Derived stage/step IDs, full step IDs, focus paths, strict authoring behavior, and consumer resolution stay behavior-tested. |

All nine packet files (`rule.json`, `baseline.json`, and `check.ts` for each
rule) are deleted. The cleanup ledger moves the three ids from `rules[]` to
`retiredRules[]` and records the concrete package/Nx destinations.

## Deliberate Deletions

No replacement is retained for hardcoded standard public-key tables, exact
stage/key equality, raw `{ strategy, config }` property-name scans, or literal
focus-path bans. Those assertions mirror current config vocabulary rather than
a durable structural or behavioral contract.

## Preserved Authority

- `protect_generated_map_entrypoints_from_hand_edits` remains the positive
  Habitat generated-zone mutation/write owner.
- Generated-zone host policy remains unchanged.
- Nx workspace boundaries remain unchanged.
- No product loader, indirect import, wrapper target, package-export widening,
  or copied business logic is introduced.

## Local HUD

This receipt's closing evidence is the focused JSON/JSONL validity checks,
retired-reference scan, Habitat classification, focused Biome run where
supported, and `git diff --check`. Full prerequisite behavior and aggregate
gates remain recorded by the Packet A.2 branch owner.
