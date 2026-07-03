# Domino 048: Sort Civ7 Platform Blueprint Candidates

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The active `civ7/platform` `_blueprints` rows moved into adapter, control-oRPC, direct-control session, and game-UI bridge child operating-area lanes rather than admitted blueprint kinds.

## Detail

#### Domino 48 Disposition Receipt

This receipt burns down the active `civ7/platform` `_blueprints` slice from
`UNDERSCORE-BLUEPRINT-BURNDOWN-FRAME.md`. It processes the adapter,
control-oRPC, direct-control session, and intelligence-bridge candidates as
platform operating areas, not as affirmed blueprint kinds.

Metrics:

- Scoped `_blueprints` rows: 5.
- Candidate pockets processed: 4 (`civ7-adapter`, `control-orpc`,
  `direct-control-session`, `intelligence-bridge`).
- Runner mix: 3 `grit`, 2 `habitat` script checks.
- Category mix: 5 `boundary`.
- Source roots: `packages/**/*.ts`, `packages/civ7-adapter/src/**`,
  `packages/civ7-control-orpc/src/modules/**/contract.ts`,
  `packages/civ7-control-orpc/src/index.ts`, `apps/**/*.ts(x)`,
  `packages/**/*.ts(x)`, and
  `mods/mod-civ7-intelligence-bridge/src/ui/civ7-intelligence-bridge.ts`.
- Single-package or single-surface rows: 3.
- Cross-owner platform-boundary rows: 2.
- Deferred non-Civ7 rows inspected for hidden Civ7 platform authority: 12.
  Rows pulled into scope: 0.

Decision matrix:

| Rule | Decision | Destination | Reason | Pending action |
| --- | --- | --- | --- | --- |
| `enforce_adapter_only_base_standard_imports` | move to child-niche rules | `civ7/platform/adapter/rules` | Guards the `@civ7/adapter` base-standard import boundary. The current Grit pattern covers package `.ts` import statements; it is adapter operating-area authority, not a full reusable adapter blueprint. | Broaden only if the Grit pattern is explicitly expanded beyond package `.ts` import forms. |
| `prohibit_adapter_local_legacy_generator_logic` | move to child-niche rules | `civ7/platform/adapter/rules` | Protects the current adapter package from growing product planning, RNG, or legacy generator logic. | Revisit only if adapter thinness becomes a shared adapter-kind rule with source-backed constructibility. |
| `preserve_transport_pure_orpc_contracts` | move to child-niche rules | `civ7/platform/control-orpc/rules` | Keeps control-oRPC contract files transport-pure while runtime control stays in procedures/services over direct-control ports. | Revisit if oRPC contract anatomy becomes a reusable service-contract blueprint. |
| `require_sanctioned_direct_control_session_owners` | move to child-niche rules | `civ7/platform/direct-control/session/rules` | Guards sanctioned direct-control session lifecycle owners across apps and packages. | Revisit if direct-control session lifecycle becomes a parameterized runtime capability rule. |
| `require_narrow_game_ui_bridge_bootstrap` | move to child-niche rules | `civ7/platform/game-ui-bridge/rules` | Guards the intelligence bridge mod bootstrap through the narrow `@civ7/control-orpc/game-ui` install surface. | Revisit if the bridge grows broader than the single narrow game-UI install surface. |

Review lanes:

- Corpus auditor: every scoped platform `_blueprints` row received exactly one
  disposition, and `.habitat/civ7/platform/_blueprints` was removed.
- Semantic reviewer: no blueprint was admitted; old candidate labels were
  treated as platform operating areas, package surfaces, or lifecycle surfaces.
- Interface reviewer: manifests now point at the moved `baseline.json`,
  `pattern.md`, and `check.ts` files under the new physical paths.
- Closure reviewer: the authority ledger records current placement, path,
  pending action, and Domino 48 evidence for all five rows.

Residual scope:

- The active Civ7 `_blueprints` burndown is complete: no
  `.habitat/civ7/**/_blueprints/**/rule.json` manifests remain.
- `docs`, `global/workspace`, and `habitat/toolkit` `_blueprints` rows remain
  deferred; none of their whole predicates hid Civ7 platform authority in this
  loop.
