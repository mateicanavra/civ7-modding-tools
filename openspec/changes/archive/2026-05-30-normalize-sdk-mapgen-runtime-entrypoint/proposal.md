## Why

The repo-wide build exposed a runtime-boundary leak: ordinary SDK consumers
that import `@mateicanavra/civ7-sdk` root also load the MapGen map runtime
entrypoint. That entrypoint imports `@civ7/adapter/civ7`, which intentionally
contains Civ7 `/base-standard/...` imports that only resolve inside the game
runtime. The result is a Node/Bun build failure in `@civ7/playground` even
though the playground only uses XML/mod builder APIs.

## Target Authority Refs

- Direct user decision: generic map-creation functionality belongs in the SDK,
  but Civ7 map runtime binding must not leak into downstream mod code or
  unrelated SDK consumers.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  adapter/runtime boundaries stay separated from pure authoring and tooling
  surfaces.
- `packages/civ7-adapter/AGENTS.md`: `@civ7/adapter` is the sole boundary for
  Civ7 engine globals and `/base-standard` APIs.
- `packages/sdk/AGENTS.md`: SDK root owns public TypeScript mod authoring
  APIs, builders, nodes, XML file abstractions, and constants.

## What Changes

- Keep `createMap` in the SDK-owned mapgen subpath:
  `@mateicanavra/civ7-sdk/mapgen`.
- Stop re-exporting the Civ7 map runtime entrypoint from
  `@mateicanavra/civ7-sdk` root.
- Document the root/subpath split in SDK source and docs.
- Add a categorical normalization guard that rejects root SDK imports/exports
  of the mapgen runtime and rejects Civ7 runtime adapter imports outside the
  SDK mapgen runtime subpath.
- Tighten the reusable Studio preset wrapper check and remove stale topology
  keys that lived outside the preset `config` wrapper, because repo build must
  prove the whole normalized stack rather than stopping at the first adapter
  failure.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds SDK map runtime entrypoint ownership
  as a durable normalization guardrail.

## Dependencies

Requires:

- `normalize-core-studio-dx-boundaries`, which moved `createMap` into the SDK
  mapgen subpath.
- `normalize-guardrails-promotion`, which established normalization guardrail
  promotion.

Enables parallel work:

- Future SDK/root consumer work can build without loading Civ7 map runtime
  modules.
- Future mapgen runtime work can keep improving `createMap` behind the
  explicit SDK subpath.

## Impact

- Affected owners: SDK root package exports, SDK mapgen runtime subpath,
  Civ7 adapter boundary, normalization guardrail policy, OpenSpec
  normalization spec.
- Forbidden owners: downstream map mods must not own generic map runtime
  helper code; pure SDK root/build tooling must not own Civ7 runtime imports;
  mapgen-core must not import Civ7 runtime APIs; built-in Studio preset
  wrappers must not carry stage keys outside `config`.
- Expected write set:
  - `packages/sdk/src/index.ts`
  - `packages/sdk/src/mapgen/index.ts`
  - `packages/sdk/src/mapgen/createMap.ts`
  - `packages/mapgen-core/src/authoring/preset-schemas.ts`
  - `mods/mod-swooper-maps/src/presets/standard/earthlike.json`
  - `mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts`
  - `docs/system/sdk/overview.md`
  - `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
  - `scripts/lint/lint-normalization-guardrails.mjs`
  - `openspec/changes/normalize-sdk-mapgen-runtime-entrypoint/**`
- Consumer impact:
  - Existing map files continue importing `createMap` from
    `@mateicanavra/civ7-sdk/mapgen`.
  - Root SDK consumers no longer receive `createMap` from
    `@mateicanavra/civ7-sdk`.
- Stop conditions:
  - a first-party active source consumer imports `createMap` from the SDK root;
  - the fix requires moving Civ7 runtime imports into mapgen-core or
    downstream map mods;
  - repo build or mod deploy remains red after the boundary repair.
- Verification gates:
  - `bun run lint:normalization-guardrails -- --self-test`
  - `bun run lint:normalization-guardrails`
  - `bun run --cwd packages/sdk build`
  - `bun run --cwd packages/mapgen-core test`
  - `bun run --cwd mods/mod-swooper-maps check`
  - `bun run --cwd mods/mod-swooper-maps test -- test/config/studio-presets-schema-valid.test.ts`
  - `bun run build`
  - `bun run deploy:mods`
  - `bun run openspec -- validate normalize-sdk-mapgen-runtime-entrypoint --strict`
  - `bun run openspec:validate`
  - `git diff --check`
