# Phase Record — `civ7-intelligence-bridge-ui-bundle-runtime`

## Phase

- Project: Habitat H4 blocker repair / Civ7 control-oRPC game UI bundle
- Branch/Graphite stack: `agent-F-intelligence-bridge-ui-bundle` above
  `agent-F-habitat-biome-hygiene` and below `agent-F-habitat-oclif-cli`
- Started: 2026-06-13
- Status: CLOSED locally — implementation, focused verification, OpenSpec
  validation, and diff hygiene complete; Graphite commit pending

## Objective

Repair the fresh-build generated UI bundle drift that pulled Node `net` into
`mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`, so the
game-scoped controller bridge bundle remains game-UI safe and Habitat H4 can
re-run strict build-output parity.

## Authority

- Root `AGENTS.md`: generated artifacts are regenerated through scripts, not
  hand-edited.
- `mods/mod-civ7-intelligence-bridge/AGENTS.md`: package build/check/test
  commands.
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-game-ui-bootstrap-slice.md`:
  the UI mod imports `@civ7/control-orpc/game-ui`, not broad transports or
  direct-control root runtime.
- `docs/projects/habitat-harness/taxonomy.md`: control lifecycle note; raw
  tuner socket/session ownership remains in `@civ7/direct-control`.

## Implementation

- Replaced the runtime `Civ7DirectControlError` import in
  `packages/civ7-control-orpc/src/model/correlation.ts` with structural
  detection of `{ name: "Civ7DirectControlError", code: string }`.
- Localized direct-control constants in:
  - `packages/civ7-control-orpc/src/modules/display/procedures/explore-request.ts`
  - `packages/civ7-control-orpc/src/modules/view/procedures/appshot-capture.ts`
- Regenerated the tracked UI bundle through
  `bunx nx run mod-civ7-intelligence-bridge:build --skip-nx-cache`.

## Verification

- `bunx nx run mod-civ7-intelligence-bridge:build --skip-nx-cache` — PASS;
  regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`.
- Bundle scan after the build:
  `rg -n "from ['\"]net['\"]|from ['\"]node:net['\"]|@civ7/direct-control|encodeCiv7TunerRequest|withCiv7DirectControlSession|executeCiv7Command|DEFAULT_CIV7_TUNER_HOST|RPCHandler|RPCLink|from ['\"]os['\"]|from ['\"]path['\"]" mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js || true`
  returned no matches.
- `bunx nx run mod-civ7-intelligence-bridge:test --skip-nx-cache` — PASS;
  3 tests, 20 assertions, including the generated bundle guard.
- `bun run --cwd packages/civ7-control-orpc check` — PASS; TypeScript plus
  contract ownership guard.
- `bun run --cwd packages/civ7-control-orpc test` — PASS; 37 files, 347 tests.
- `bunx nx run @civ7/control-orpc:check --skip-nx-cache --parallel=1` — PASS;
  serial mode avoids dependent-build cleanup races in shared `dist`.
- `bunx nx run @civ7/control-orpc:test --skip-nx-cache --parallel=1` — PASS;
  37 files, 347 tests.
- `bun run openspec -- validate civ7-intelligence-bridge-ui-bundle-runtime --strict`
  — PASS.
- `git diff --check` — PASS at closure.

## Verification Notes

- A parallel verification attempt
  (`mod-civ7-intelligence-bridge:test` and `@civ7/control-orpc:check` at the
  same time) produced a transient `@civ7/direct-control:build` cleanup failure
  and then TypeScript package-resolution errors while generated declarations
  were racing. The same Nx targets pass with `--parallel=1`, and package-local
  `control-orpc` check/test pass. This is recorded as verification
  concurrency, not a source failure.
