## Implementation Record

This slice promotes the implemented architecture-normalization guardrails into
durable policy and mechanical lint.

Implemented surfaces:

- Added `bun run lint:normalization-guardrails`.
- Wired the normalization guard into root `bun run check`.
- Added `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`.
- Linked the new policy from `docs/system/libs/mapgen/policies/POLICIES.md`.
- Cross-referenced the packet guardrail table to the new policy so the packet
  remains the source record while the policy owns current command/proof scope.
- Moved biome visualization categories to the `ecology-biomes` stage surface at
  `stages/ecology-biomes/viz.ts` so the stage that owns the biome index artifact
  also owns its visualization contract, while `map-ecology` no longer imports
  sibling `ecology-biomes/steps` internals.

## Guard Scope

The enabled guard intentionally encodes only achieved structure:

- G1: standard recipe source rejects milestone-prefixed tag identifiers.
- G2: domain roots reject broad `tags.ts`/`artifacts.ts` catalogs.
- G3: `packages/mapgen-core/src/core` and `src/engine` reject Civ7 adapter value
  imports, `/base-standard` imports, and actual runtime engine global calls.
  Adapter type exports and dev introspection helpers remain outside this guard.
- G5: standard stages reject sibling-stage private `steps/` imports.
- G6: `STANDARD-RECIPE.md` stage order must match live recipe source.
- G7: evergreen docs reject superseded current hydrology/ecology stage ids.
- G8: final placement must publish typed resource/discovery outcome artifacts
  and cannot call official resource/discovery generators as truth.
- G9: standard recipe source and map configs reject wrapper-only `advanced`
  stage config surfaces.

G4 remains covered by `lint:mapgen-recipe-imports` rather than duplicated in
the new script. Adapter package ownership remains covered by
`lint:adapter-boundary`.

## Seeded Failure Coverage

`bun run lint:normalization-guardrails -- --self-test` covers the parser pieces
that make the category checks work: standard recipe stage extraction,
`STANDARD-RECIPE.md` stage extraction, and import specifier extraction.

The self-test is deliberately local to the guard implementation; it avoids
creating synthetic source fixtures that would themselves look like forbidden
runtime architecture.

## Archive Disposition

All prior normalization changes in this stack had checked tasks,
implementation records, passing source gates, and OpenSpec validation before
archive. They were archived from this top guardrails-promotion branch after the
guard/policy promotion existed. The guardrails-promotion change itself was then
archived as the final normalization train closure record.

OpenSpec archive is historical implementation evidence. The long-lived
authority for current guard behavior is:

- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- the archived implementation records under `openspec/changes/archive/`

## Validation

- `bun run lint:normalization-guardrails -- --self-test`
- `bun run lint:normalization-guardrails`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `bun run lint:adapter-boundary`
- `bun run lint:mapgen-docs` (passes with the existing three `@mapgen/*`
  documentation warnings)
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps test -- test/standard-recipe.test.ts test/ecology/ecology-step-import-guardrails.test.ts test/pipeline/no-dual-contract-paths.test.ts test/pipeline/no-shadow-paths.test.ts test/pipeline/no-shim-surfaces.test.ts test/placement/placement-contracts.test.ts test/placement/placement-does-not-call-generate-snow.test.ts`
- `bun run openspec:validate`
- `bun run openspec -- archive <completed-normalization-change> --yes`
- `git diff --check`
