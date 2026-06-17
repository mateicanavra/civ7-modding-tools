# Studio Live Civ7 Proof Gates

## Why

Live Run in Game closure requires separate proof for generated files, deployed Mods files, direct-control commands, bounded logs, and in-game observation. The current priority blocker is `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js` after `preparing-setup`.

## What Changes

- Prove `studio-current.js` generation, local mod bundle identity, deployed Mods target identity, Civ7 setup-row visibility, logs, and in-game readback as separate labels.
- Use existing `@civ7/direct-control` tooling for tuner exercise and do not add caller-local transports.
- Keep unavailable Civ7/FireTuner labels unresolved rather than inferred.

## Non-Goals

- No product proof without browser plus live evidence.
- No hand edits to generated or deployed files.
- No direct-control transport expansion.

## Verification Gates

- `bun run openspec -- validate studio-live-civ7-proof-gates --strict`
- `nx run mod-swooper-maps:test:studio-run-in-game --outputStyle=static`
- `nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` with Studio run env recorded
- Direct-control, deploy, bounded log, and in-game evidence recorded in `workstream/live-proof-ledger.md`
