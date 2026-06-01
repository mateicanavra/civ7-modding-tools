## Implementation Record

This slice closes the repo-build and deploy blockers exposed after the
normalization train.

Implemented surfaces:

- Removed the SDK root re-export of `./mapgen`, leaving `createMap` available
  only from `@mateicanavra/civ7-sdk/mapgen`.
- Documented why the SDK root is Node/Bun-safe and why the SDK mapgen subpath
  is the explicit Civ7 runtime opt-in surface.
- Added G11 normalization guard coverage for SDK root runtime safety:
  - no root SDK export/import of `./mapgen`;
  - no `@civ7/adapter/civ7` import outside `packages/sdk/src/mapgen/**` inside
    the SDK;
  - no `@civ7/adapter/civ7` import inside `packages/mapgen-core/src/**`.
- Removed the stale top-level `ecology-features` key from the built-in
  Standard Studio `earthlike` preset wrapper.
- Tightened the reusable `isPresetWrapper` helper to reject unknown wrapper
  root keys, matching the preset schema's `additionalProperties: false`
  contract.

## Ownership Disposition

`createMap` remains SDK-owned reusable map authoring machinery, not
Swooper-only mod code. Its runtime binding stays behind the explicit
`@mateicanavra/civ7-sdk/mapgen` subpath because it loads the Civ7 adapter
runtime and therefore depends on the game's module loader for
`/base-standard/...`.

The preset-wrapper repair does not move operation or strategy schemas into a
broad shared `config.ts`. It keeps strategy schemas owner-local and only
tightens the existing reusable preset wrapper contract in MapGen core.

## Validation

- `bun run openspec -- validate normalize-sdk-mapgen-runtime-entrypoint --strict`
- `bun run openspec:validate`
- `bun run lint:normalization-guardrails -- --self-test`
- `bun run lint:normalization-guardrails`
- `bun run --cwd packages/sdk build`
- `bun run --cwd packages/mapgen-core test`
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps test -- test/config/studio-presets-schema-valid.test.ts`
- `bun run build`
- `bun run deploy:mods`
- `git diff --check`
