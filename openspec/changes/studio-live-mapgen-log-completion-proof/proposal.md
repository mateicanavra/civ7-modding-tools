## Why

The live Studio run verifier must prove that the requested map generation
completed in Civ7, not merely that the direct-control launch request returned.
A predecessor branch captured fresh Scripting.log proof, but that evidence was
lost during stack recovery.

## What Changes

- Snapshot `Scripting.log` before launch.
- After launching from the Studio setup path, wait for fresh mapgen completion
  markers containing the requested seed.
- Treat mapgen failure markers as verifier failures.
- Record the matched log path and completion evidence in the proof payload.

## Forbidden Non-Goals

- Do not require a game restart as the proof boundary.
- Do not accept stale log lines from a previous run.
- Do not use Civ7 readback as the authoring source of truth; this is launch
  proof only.

## Verification Gates

- `bun run verify:studio-run-in-game:live -- --help`
- Focused direct-control tests.
