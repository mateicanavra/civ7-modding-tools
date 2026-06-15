# Source Synthesis - SDK MapGen Entrypoint

## Row

- Rule id: `grit-sdk-mapgen-entrypoint`
- Pattern: `sdk_mapgen_entrypoint`
- Owner tool: `grit-check`
- Owner project: `@mateicanavra/civ7-sdk`
- Scope: `packages/sdk/src/**/*.ts` and `packages/mapgen-core/src/**/*.ts`

## Authority

`rules.json` says general SDK authoring APIs stay runtime-neutral and mapgen
bindings are explicit opt-in. The diagnostic message tells authors to keep Civ7
map runtime bindings behind `@mateicanavra/civ7-sdk/mapgen`.

`docs/system/sdk/overview.md` records the SDK root as the Node/Bun-safe authoring
surface for XML mod builders, nodes, files, constants, presets, and `Mod`
output. It records `@mateicanavra/civ7-sdk/mapgen` as the explicit subpath that
owns `createMap(...)` and intentionally binds to the Civ7 runtime adapter.

`openspec/specs/mapgen-normalization-workstreams/spec.md` requires the SDK root
not to transitively load `@civ7/adapter/civ7` and requires map entrypoints to
import `createMap` from the SDK mapgen subpath.

`packages/mapgen-core/AGENTS.md` records mapgen-core as pure TypeScript domain
logic and says it must not add direct Civ7 engine imports.

`docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md` records G11 as the
SDK map runtime entrypoint boundary.

`docs/projects/habitat-harness/discrepancy-log.md` records DL-1: SDK AGENTS
underspecifies the mapgen surface. This checkpoint does not close that
documentation discrepancy.

## Current Predicate

The current Grit pattern has branches for:

- `packages/sdk/src/index.ts` importing from `./mapgen`;
- `packages/sdk/src/index.ts` importing from `./mapgen/index.js`;
- `packages/sdk/src/index.ts` value export-star from `./mapgen`;
- `packages/sdk/src/index.ts` value export-star from `./mapgen/index.js`;
- `packages/sdk/src/index.ts` named value re-export from `./mapgen`;
- `packages/sdk/src/index.ts` named value re-export from
  `./mapgen/index.js`;
- `packages/sdk/src/index.ts` value-first mixed value+type named re-export from `./mapgen`
  and `./mapgen/index.js`;
- `packages/sdk/src/index.ts` `export type { ... }` named re-exports from
  `./mapgen` and `./mapgen/index.js` as type-only non-runtime controls;
- `packages/sdk/src/index.ts` single-line supported `export { type ... }`
  named re-exports from `./mapgen` and `./mapgen/index.js` as type-only
  non-runtime controls;
- multiline or alternate-whitespace inline type-only re-exports from
  `./mapgen` and `./mapgen/index.js` remain unproven parser-edge non-claims;
- `packages/sdk/src/**/*.ts` importing `@civ7/adapter/civ7` outside
  `packages/sdk/src/mapgen/`;
- `packages/mapgen-core/src/**/*.ts` importing `@civ7/adapter/civ7`.

## Parser Inventory Plan

Scan roots:

- `packages/sdk/src`
- `packages/mapgen-core/src`

Exclusions:

- `node_modules`
- `dist`
- `mod`

The inventory parses `.ts` and `.tsx` source with the TypeScript compiler API
and treats `.json` as counted file-scope context only. It records current-row
candidate counts, allowed SDK mapgen adapter imports, source lookalikes, dynamic
imports, export-form controls, and parse diagnostics.

## Inventory Result

`SME-SDK-MAPGEN-INVENTORY-2026-06-15` counted:

- 274 scanned TS/TSX/JSON files: 170 under `packages/sdk/src` and 104 under
  `packages/mapgen-core/src`.
- 274 `.ts` files, 0 `.tsx` files, and 0 `.json` files.
- 1 SDK root index file.
- 2 SDK mapgen subpath `.ts` files and 168 SDK non-mapgen `.ts` files.
- 604 import declarations, 285 export declarations, 283 export-from
  declarations, 52 export-star declarations, 233 named export declaration
  nodes, 526 named export specifier elements, and 0 dynamic imports.
- 0 SDK root `./mapgen` import candidates, 0 SDK root `./mapgen` value
  export-star candidates, 0 SDK root `./mapgen` named value re-export
  candidates, 0 SDK root `./mapgen` value-first mixed value+type named re-export
  candidates, 0 SDK root `./mapgen` `export type` named re-export controls, 0
  SDK root `./mapgen` single-line inline type-only re-export controls in
  current source, and 0 SDK root mapgen source lookalikes.
- 0 SDK non-mapgen `@civ7/adapter/civ7` imports, 1 allowed SDK mapgen subpath
  `@civ7/adapter/civ7` import, and 0 mapgen-core
  `@civ7/adapter/civ7` imports.
- 0 adapter type-only imports, 1 adapter value import, 0 adapter side-effect
  imports, 0 adapter dynamic imports, 0 adapter source lookalikes, and 0 parse
  diagnostics.

The current-row match list is empty. This is parser inventory/live
zero-candidate evidence only, not Habitat wrapper/current-tree proof, baseline
proof, injected proof, apply safety, or product proof.
