# Phase Record: Studio Browser Defined Error Projection

Status: implemented and verified.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-03---browser-defined-error-projection`.

Priority rows: READ browser projection portions, UI-01, UI-06, OP-06 through OP-09 projection portions, EB-09 through EB-11, EB-13 projection portion.

## Scope Boundary

This packet changes browser-side projection of declared oRPC errors only. It
does not change server contracts, router mappings, operation runtime behavior,
or live Civ7 proof.

## Implemented Projection

- Added one browser helper for Studio declared errors:
  `apps/mapgen-studio/src/features/studioErrors/definedErrorProjection.ts`.
- Preserved declared code as `code`, numeric status as `statusCode`, setup
  `observedAt` as a top-level field, and copyable details for diagnostics,
  failure tag, reason, request ids, active-operation identity, dependency,
  direct-control code, cause summary, server identity, and recovery actions.
- Applied the helper to:
  - `fetchCiv7SetupConfig`
  - `requestCiv7Autoplay`
  - `runCurrentConfigInGame`
  - `saveRepoBackedConfig`

## Verification

- `bun run --cwd apps/mapgen-studio test test/studioErrors/definedErrorProjection.test.ts`
  passed with 3 tests.
- `bun run nx run mapgen-studio:check --outputStyle=static` passed.
- `bun run nx run mapgen-studio:test --outputStyle=static` passed with 51
  files and 251 tests.
- `bun run nx run mapgen-studio:build:vite --outputStyle=static` passed.
- `bun run openspec -- validate studio-browser-defined-error-projection --strict`
  passed.

## Remaining Boundaries

- Browser rendering of every terminal state is owned by
  `studio-browser-scenario-proof`.
- Live Civ7/FireTuner setup visibility for `studio-current.js` remains owned by
  `studio-live-civ7-proof-gates`.
