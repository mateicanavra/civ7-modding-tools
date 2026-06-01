## Implementation Record

This slice turns the reviewer/user visualization ownership correction into a
standard instead of a one-off biome import repair.

Implemented surfaces:

- Documented stage/step visualization ownership in
  `docs/system/libs/mapgen/reference/VISUALIZATION.md`.
- Added G10 to
  `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`.
- Moved Foundation's shared visualization geometry helpers from
  `stages/foundation/steps/viz.ts` to `stages/foundation/viz.ts`.
- Realigned the diagnostics how-to anchor that named the old Foundation helper
  path.
- Deleted the wrapper-only
  `stages/ecology-biomes/steps/biomes/viz.ts` path and moved the biome step to
  the owner stage surface.
- Added categorical guard coverage in
  `scripts/lint/lint-normalization-guardrails.mjs` for:
  - forbidden `stages/<stage>/steps/viz.ts` hubs;
  - imports of private `steps/<step>/viz.ts` from outside the owning step;
  - self-test coverage for hub detection, owner parsing, and same-step versus
    cross-step import classification.

## Ownership Disposition

The standard keeps two owner shapes:

- Stage surface: `stages/<stage>/viz.ts` for stable/shared stage or phase
  visualization contracts.
- Step-private helper: `stages/<stage>/steps/<step>/viz.ts` only when imported
  inside that step directory.

No broad shared visualization bucket was introduced. Existing map-ecology
step-local visualization helpers remain step-private because current evidence
shows they are consumed only by their owning steps.

## Validation

- `bun run lint:normalization-guardrails -- --self-test`
- `bun run lint:normalization-guardrails`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate normalize-viz-contract-owners --strict`
- `bun run openspec:validate`
- `git diff --check`
