## Why

After the first `mapgen-studio` timeout slice and the CLI timeout repair, the
H4 root-test proof no longer fails on inherited 5s project budgets or CLI
root-load timing. The remaining blocker is a second `mapgen-studio:test`
root-load class:

- `standardLayerVisibility` can still exceed its own explicit 240s budget under
  saturated root Nx load.
- `Civ7TunerSession` can fail its first shared-session test under the same
  load with an `Effect.tryPromise` timeout/error while preserving the direct
  project green path.

H4 needs root-test evidence that proves the Biome reformat did not change
behavior. These failures are proof-harness brittleness under full repo load,
not changes to Studio behavior or Habitat architecture.

## What Changes

- Further reduce the `standardLayerVisibility` browser-worker fixture workload
  while keeping the same standard recipe and the same layer visibility
  assertions.
- Make the first `Civ7TunerSession` test dispose the Effect runtime in a
  `finally` path and wait for the peer-observed FIN with a bounded poll instead
  of a fixed sleep.
- Keep the proof repair test-local and semantics-preserving.
- Update H4 records with the new evidence boundary.

## What Does Not Change

- No Studio runtime, recipe, worker, Effect Layer/Scope, or direct-control
  production behavior changes.
- No assertion is skipped or weakened: the browser test still requires
  `run.finished` and the expected visible/debug layers, and the tuner test
  still requires one shared connection plus graceful FIN on runtime dispose.
- No global Vitest timeout increase for unrelated projects.

## Affected Owners

- `apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts`
- `apps/mapgen-studio/test/server/tunerSession.test.ts`
- Habitat H4 proof records

## Verification Gates

- Focused browser-worker test.
- Focused `Civ7TunerSession` test.
- Direct `mapgen-studio` Vitest project.
- Representative uncached Nx load probe that includes `mapgen-studio:test`.
- `bun run openspec -- validate mapgen-studio-root-load-followup --strict`
- H4 cross-validation.
- `git diff --check`

## Stop Conditions

- A test becomes green only by removing the production path being asserted.
- The one-connection or FIN invariant is weakened.
- A root-load probe still fails in the same mapgen class after this repair.
