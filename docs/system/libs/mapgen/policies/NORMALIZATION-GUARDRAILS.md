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

| Guard                                   | Cleanup evidence                                                      | Mechanical check                                                   | What it proves                                                                                                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 milestone-prefixed tag ids           | `normalize-authority-routing`, `normalize-placement-contracts`        | `lint:normalization-guardrails`, `lint:domain-refactor-guardrails` | Standard recipe source no longer depends on `M\d+_` tag/catalog identifiers.                                                                                                                                                  |
| G2 multi-owner root catalogs            | `normalize-morphology-catalog-owners`                                 | `lint:normalization-guardrails`, `lint:domain-refactor-guardrails` | Domain roots do not reintroduce broad `tags.ts` or `artifacts.ts` catalogs; shared config remains a named facade/invariant concern.                                                                                           |
| G3 core purity                          | `normalize-core-studio-dx-boundaries`                                 | `lint:normalization-guardrails`, `lint:adapter-boundary`           | `packages/mapgen-core/src/core` and `src/engine` stay free of Civ7 adapter value imports, `/base-standard` imports, and runtime engine globals. Adapter type exports and dev introspection helpers remain outside this guard. |
| G4 recipe deep imports                  | `normalize-import-boundaries`                                         | `lint:mapgen-recipe-imports`, `lint:normalization-guardrails`      | Recipes consume sanctioned domain public surfaces rather than op internals.                                                                                                                                                   |
| G5 sibling stage `steps/` imports       | `normalize-ecology-topology`                                          | `lint:normalization-guardrails`, ecology import guard tests        | Standard stages do not import sibling stages' private `steps/` modules.                                                                                                                                                       |
| G6 recipe doc stage drift               | `normalize-ecology-topology`                                          | `lint:normalization-guardrails`, `test/standard-recipe.test.ts`    | `STANDARD-RECIPE.md` stage order matches the live standard recipe source.                                                                                                                                                     |
| G7 superseded current-stage ids         | `normalize-ecology-topology`, `normalize-projection-lakes`            | `lint:normalization-guardrails`                                    | Evergreen docs do not present retired hydrology/ecology stage ids as current source shape.                                                                                                                                    |
| G8 hidden placement sub-concerns        | `normalize-placement-contracts`, `normalize-placement-reconciliation` | `lint:normalization-guardrails`, placement reconciliation tests    | Final placement cannot silently return to official resource/discovery generators as truth and must publish typed outcome artifacts.                                                                                           |
| G9 wrapper-only `advanced` stage config | `normalize-config-surface`                                            | `lint:normalization-guardrails`, config tests                      | Standard recipe source and map configs do not reintroduce persisted SDK-native `advanced` wrappers.                                                                                                                           |

## Proof boundary

`lint:normalization-guardrails` is structural evidence. It proves the guarded
source/doc categories above still match the implemented cleanup. It does not
prove generated mod output, in-game behavior, future target architecture, or
legality equivalence with Civ7 internals.

OpenSpec archive entries remain implementation history. The long-lived
authority is this policy plus the domain/reference docs and ADRs named by each
completed implementation record.

## Commands

- `bun run lint:normalization-guardrails`
- `bun run lint:normalization-guardrails -- --self-test`
- `bun run lint:domain-refactor-guardrails`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:adapter-boundary`
- `bun run lint:mapgen-docs`

## Ground truth anchors

- Guard script: `scripts/lint/lint-normalization-guardrails.mjs`
- Guard command wiring: `package.json`
- Normalization packet source table:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- OpenSpec implementation history: `openspec/changes/archive/`
