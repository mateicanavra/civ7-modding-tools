## Context

`@civ7/adapter/civ7` is intentionally game-runtime-only: it imports Civ7
globals and `/base-standard/...` modules that Bun and Node cannot resolve. The
SDK now owns the reusable map authoring helper, but the helper must be exposed
through an explicit map runtime entrypoint rather than through the general SDK
root.

## Goals / Non-Goals

**Goals:**

- Keep generic `createMap` functionality in the SDK where map authors can reuse
  it across map mods.
- Make the SDK root importable by Node/Bun build tools without loading Civ7
  runtime modules.
- Add a guard that catches the category, not only the current playground
  failure.
- Ensure Studio preset wrapper validation catches stale topology keys wherever
  the wrapper contract is reused.
- Prove the repair with repo build and mod deploy.

**Non-Goals:**

- Move `createMap` back into `mod-swooper-maps`.
- Move Civ7 runtime imports into mapgen-core.
- Redesign adapter packaging or `/base-standard` externalization.
- Hand-edit generated `mod/` output.

## Target Shape

```text
packages/sdk/src/index.ts
  Root SDK export for Node/build-safe mod authoring APIs: builders, nodes,
  files, constants, localization, presets, and core mod output.

packages/sdk/src/mapgen/index.ts
  Explicit Civ7 map runtime SDK subpath. This is allowed to expose
  createMap(...) and may load @civ7/adapter/civ7 through createMap.ts.

packages/civ7-adapter/src/civ7-adapter.ts
  Adapter-owned Civ7 runtime implementation. It remains the owner of
  /base-standard imports and engine-global translation.
```

## Decisions

### SDK Root Is Build-Tool Safe

The SDK root is the general mod-authoring entrypoint. It must stay usable by
playground, CLI, docs, and ordinary XML mod packages without loading Civ7 map
runtime code.

### Map Runtime Is An Explicit SDK Subpath

`createMap` is still reusable SDK functionality, but it is map-runtime
functionality. Consumers opt into the Civ7 runtime boundary by importing
`@mateicanavra/civ7-sdk/mapgen`.

### Adapter Ownership Stays Intact

The adapter package remains the only owner of `/base-standard` imports. The SDK
mapgen subpath may depend on the adapter's Civ7 runtime entrypoint because it
is explicitly a Civ7 map runtime binding; SDK root and mapgen-core may not.

## Guardrail Shape

G11 checks:

- `packages/sdk/src/index.ts` does not import or export `./mapgen`.
- `packages/sdk/src/**` does not import `@civ7/adapter/civ7` outside
  `packages/sdk/src/mapgen/**`.
- `packages/mapgen-core/src/**` still does not import `@civ7/adapter/civ7`.

The guard does not ban the adapter's own runtime implementation and does not
ban type imports from the adapter root.

## Studio Preset Wrapper Strictness

The build also proved that topology migration can leave stage keys beside the
wrapper `config` object. That shape is never a valid preset: wrapper metadata
belongs at the root, and stage configuration belongs under `config`. The core
`isPresetWrapper` helper therefore mirrors the schema's
`additionalProperties: false` rule so tests and Studio generation enforce the
same contract.

## Review Lanes

- Architecture review: SDK root/subpath boundary and adapter ownership.
- Developer experience review: first-party imports remain obvious and build
  errors do not surprise non-mapgen SDK users; preset wrapper errors point at
  wrapper/config ownership rather than silently passing tests.
- Adversarial review: guard catches future root leaks without broad exception
  buckets or red-barring intended runtime imports.
