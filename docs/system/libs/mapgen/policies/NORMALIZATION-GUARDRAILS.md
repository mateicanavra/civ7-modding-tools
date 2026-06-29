<toc>
  <item id="purpose" title="Purpose"/>
  <item id="guard-map" title="Guard map"/>
  <item id="proof-boundary" title="Proof boundary"/>
  <item id="commands" title="Commands"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Normalization guardrails

## Purpose

These guardrails convert completed architecture-normalization cleanup into
mechanical relapse checks. They do not promote packet target shape by
themselves; each guard is enabled only where source behavior and OpenSpec
implementation records already support the structure being checked.

Supersedes the packet's "Guardrails To Add After Cleanup" table for implemented
G1-G9 enforcement scope:
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.

## Guard map

| Guard                                      | Cleanup evidence                                                      | Mechanical check                                                   | What it proves                                                                                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 milestone-prefixed tag ids              | `normalize-authority-routing`, `normalize-placement-contracts`        | Habitat `normalization-guardrails`, `domain-refactor-guardrails` | Standard recipe source no longer depends on `M\d+_` tag/catalog identifiers.                                                                                                                                                  |
| G2 multi-owner root catalogs               | `normalize-morphology-catalog-owners`                                 | Habitat `grit-domain-root-catalogs`, `domain-refactor-guardrails` | Domain roots do not reintroduce broad `tags.ts` or `artifacts.ts` catalogs; shared config remains a named facade/invariant concern.                                                                                           |
| G3 core purity                             | `normalize-core-studio-dx-boundaries`                                 | Habitat `grit-mapgen-core-runtime-civ7`, `adapter-boundary`      | `packages/mapgen-core/src/core` and `src/engine` stay free of Civ7 adapter value imports, `/base-standard` imports, and runtime engine globals. Adapter type exports and dev introspection helpers remain outside this guard. |
| G4 recipe deep imports                     | `normalize-import-boundaries`                                         | Habitat `grit-recipe-domain-surface` and `grit-domain-deep-import` | Recipes consume sanctioned domain public surfaces rather than op internals.                                                                                                                                                   |
| G5 sibling stage `steps/` imports          | `normalize-ecology-topology`                                          | Habitat `grit-sibling-stage-step-imports`                       | Standard stages do not import sibling stages' private `steps/` modules.                                                                                                                                                       |
| G6 recipe doc stage drift                  | `normalize-ecology-topology`                                          | Habitat `normalization-guardrails`, `test/standard-recipe.test.ts` | `STANDARD-RECIPE.md` stage order matches the live standard recipe source.                                                                                                                                                     |
| G7 superseded current-stage ids            | `normalize-ecology-topology`, `normalize-projection-lakes`            | Habitat `normalization-guardrails`                              | Evergreen docs do not present retired hydrology/ecology stage ids as current source shape.                                                                                                                                    |
| G8 hidden placement sub-concerns           | `normalize-placement-contracts`, `normalize-placement-reconciliation` | Habitat `grit-placement-outcome-boundary`, placement reconciliation tests | Final placement cannot silently return to official resource/discovery generators as truth and must publish typed outcome artifacts.                                                                                           |
| G9 wrapper-only `advanced` stage config    | `normalize-config-surface`                                            | Habitat `grit-wrapper-advanced-stage-config`, config tests       | Standard recipe source and map configs do not reintroduce persisted SDK-native `advanced` wrappers.                                                                                                                           |
| G10 visualization contract owner surfaces | `normalize-viz-contract-owners`                                       | Habitat `grit-viz-contract-ownership`                           | Shared/stable standard-recipe visualization contracts live on owner stage surfaces; private step `viz.ts` helpers are imported only by that step.                                                                              |
| G11 SDK map runtime entrypoint boundary    | `normalize-sdk-mapgen-runtime-entrypoint`                             | Habitat `grit-sdk-mapgen-entrypoint`, repo build/deploy gates    | The SDK root remains Node/Bun build-tool safe; Civ7 map runtime helpers are exposed only from `@mateicanavra/civ7-sdk/mapgen`.                                                                                                 |

## Proof boundary

`lint:normalization-guardrails` is structural evidence. It proves the guarded
source/doc categories above still match the implemented cleanup. It does not
prove generated mod output, in-game behavior, future target architecture, or
legality equivalence with Civ7 internals.

OpenSpec archive entries remain implementation history. The long-lived
authority is this policy plus the domain/reference docs and ADRs named by each
completed implementation record.

## Commands

- `bun habitat check --rule normalization-guardrails`
- `bun habitat check --rule domain-refactor-guardrails`
- `bun habitat check --tool pattern-check`
- `bun habitat check --rule adapter-boundary`
- `bun run lint:mapgen-docs`

## Ground truth anchors

- Habitat command guardrails:
  `.habitat/civ7/mapgen/domain/blueprints/domain-operation/require_domain_ops_root_presence/rule.json` and
  `.habitat/civ7/platform/blueprints/civ7-adapter/enforce_adapter_only_base_standard_imports/rule.json`
- Pattern rule catalog: `.habitat/patterns/checks/`
- Guard command wiring: `package.json`
- Normalization packet source table:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- OpenSpec implementation history: `openspec/changes/archive/`
