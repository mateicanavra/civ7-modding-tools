## Why

The generated `mod-civ7-intelligence-bridge` game UI bundle is a Civ7
`scope="game"` UIScript artifact. It must run inside the game UI runtime, not
Node. A fresh H4 build exposed that the regenerated bundle pulled
`from "net"` through value imports from `@civ7/direct-control`, causing the
existing package test to fail and blocking Habitat H4 build-output parity.

This repair keeps the `@civ7/control-orpc/game-ui` surface browser/game-UI
safe by removing accidental value imports of direct-control root runtime from
control-oRPC modules that are reachable from the game UI bridge bundle, then
regenerating the tracked UI bundle through the package build.

## Target Authority Refs

- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-game-ui-bootstrap-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `docs/projects/habitat-harness/workstream-record.md` H4 DL-16 blocker
- `docs/projects/habitat-harness/taxonomy.md` control lifecycle note
- `mods/mod-civ7-intelligence-bridge/AGENTS.md`
- Root `AGENTS.md` generated-artifact rule: regenerate artifacts, do not
  hand-edit them

## What Changes

- Replace a runtime `Civ7DirectControlError` import in control-oRPC correlation
  detail projection with structural detection of the bounded
  `Civ7DirectControlError` name/code shape.
- Localize two direct-control constants used by control-oRPC procedures so
  game-UI-reachable procedure modules do not import direct-control root values:
  the explore settle-time formula and the clean-frame view name.
- Regenerate `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
  with the package build so the tracked bundle reflects the safe graph.

## What Does Not Change

- No new controller procedure, router, transport, mutation capability, or game
  UI runtime port.
- No direct-control package API change.
- No hand edit to generated bundle output.

## Requires

- `civ7-control-orpc-native-slice` game UI bootstrap work
- H4 `habitat-biome-hygiene` build-output parity evidence, where this blocker
  was promoted

## Enables Parallel Work

- Habitat H4 task 2.4 can re-run fresh-build parity without the UI bundle
  importing Node `net`.
- Future controller bridge slices can rely on `@civ7/control-orpc/game-ui` as
  the narrow game-safe entry.

## Affected Owners

- `packages/civ7-control-orpc/src/model/correlation.ts`
- `packages/civ7-control-orpc/src/modules/display/procedures/explore-request.ts`
- `packages/civ7-control-orpc/src/modules/view/procedures/appshot-capture.ts`
- Regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`

## Forbidden Owners

- No raw tuner/session/socket imports in the game UI bundle.
- No broad `@civ7/control-orpc` root import from the mod UI bootstrap.
- No generated bundle hand-editing.

## Stop Conditions

- Bundle scan still finds `from "net"`, `from "os"`, `from "path"`,
  `@civ7/direct-control`, `encodeCiv7TunerRequest`,
  `withCiv7DirectControlSession`, `executeCiv7Command`,
  `DEFAULT_CIV7_TUNER_HOST`, `RPCHandler`, or `RPCLink`.
- Control-oRPC tests show the structural error-detail projection no longer
  preserves bounded direct-control error codes.

## Consumer Impact

No behavior change for callers. The generated controller UIScript remains a
game-scoped bridge bootstrap, but its bundle no longer includes Node socket
runtime code.

## Verification Gates

- `bun run openspec -- validate civ7-intelligence-bridge-ui-bundle-runtime --strict`
- `bunx nx run mod-civ7-intelligence-bridge:build --skip-nx-cache`
- `bunx nx run mod-civ7-intelligence-bridge:test --skip-nx-cache`
- `bunx nx run @civ7/control-orpc:check --skip-nx-cache`
- Bundle scan for Node builtins, direct-control runtime strings, and RPC
  transport symbols returns no matches.
- `git diff --check`
