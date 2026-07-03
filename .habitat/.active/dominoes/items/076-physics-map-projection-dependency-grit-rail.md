# Domino 076: Physics Map Projection Dependency Grit Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 76: Physics Map Projection Dependency Grit Rail

Status: closed on `codex/habitat-physics-map-dependency-grit-rail`.

Purpose: replace a bespoke Habitat script for standard recipe physics contract
map-projection dependency validation with the native Grit source-check rail.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_map_projection_dependencies_in_physics_contracts` | Converted runner from Node script to packet-local Grit pattern; row is now live no-action source-check authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-physics-map-projection-dependency-grit-slice.md` |

Moves it forward:

- Keeps source-shape architecture authority in Habitat/Grit rather than package
  tests or a custom MJS script.
- Preserves standard-recipe context authority without pretending this settles
  the broader projection contract surface.
- Removes one runtime/source-validation packet-needed row from the cascade.

Closure note:

- Current source passed with the Grit runner.
- A temporary `artifact:map.invalidProbe` probe in
  `foundation-tectonics/steps/tectonics.contract.ts` failed the rule as
  expected and was removed.
