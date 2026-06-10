## Why

Studio uses generated recipe `uiMeta` for stage and step navigation before and
during browser runs. A public config surface change must not remove runtime
pipeline steps from that navigation surface.

The Morphology public config fix exposed a boundary error: the Studio artifact
generator filtered `uiMeta.steps` through public schema property names. Semantic
public keys such as `mountainRanges` and `islandChains` stopped matching runtime
step IDs such as `mountains` and `islands`, so Studio hid valid visualization
steps.

## Target Authority Refs

- Direct user decision: public config is semantic authoring input; runtime
  projection, step, and visualization machinery are internal execution surfaces.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  stage topology is recipe-owned runtime architecture.
- `docs/system/ADR.md`: Studio visualization state is owned by the runtime
  manifest and ingested events, not config editor schema.

## What Changes

- Add a dedicated SDK stage authoring model that separates public authoring
  config from runtime step navigation metadata.
- Treat generated Studio `uiMeta.stages[].steps` as runtime/navigation metadata
  derived from that SDK model rather than public schema property names.
- Keep config-focus paths as editor hints only; they may point at a public key
  when there is an exact public property match, or at the stage root otherwise.
- Make Studio recipe preflight refresh stale generated artifacts instead of
  accepting any existing artifact set as current.
- Render steps within each stage as one-line expandable DAG rows so the stage
  topology remains scannable while per-step artifact/proof details live behind a
  smooth rectangular shutter interaction.
- Add tests proving Morphology runtime steps remain visible in Studio artifacts
  while the public authoring schema remains semantic.

## Requires

- `mapgen-public-config-boundary`
- `morphology-public-config-surface`
- `studio-public-config-contract`

## Forbidden Non-Goals

- Do not reintroduce raw internal step/op envelope keys into public config.
- Do not couple runtime step visibility to public schema property names.
- Do not make Studio infer SDK authoring-layer boundaries locally.
- Do not add one-off mutable config value assertions as proof.
- Do not render every step's full detail body by default or turn the stage DAG
  into nested always-open cards.

## Verification Gates

- `bun test apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd apps/mapgen-studio build`
- Browser/Playwright check that stage step rows collapse to one-line scan rows
  and expand/collapse without losing the selected stage/step context.
- `bun run openspec -- validate studio-runtime-step-navigation --strict`
- `git diff --check`
