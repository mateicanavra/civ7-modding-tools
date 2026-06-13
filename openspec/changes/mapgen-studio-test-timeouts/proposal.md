## Why

After the promoted H4 proof repairs, the repo-wide root test no longer fails
through DL-15 package-local Vitest fan-out or DL-16 intelligence-bridge bundle
drift. The remaining H4 root-test blocker is `mapgen-studio:test`: under the
full Nx run it inherits Vitest's default 5s per-test timeout and times out
integration-heavy server, Effect-scoped tuner session, UI render, and real
Studio-emission tests.

The Habitat H4 proof gate needs root test evidence to fail on real behavior,
not on a project timeout budget that is too small for the app's known
integration surface under repo-wide load.

## What Changes

- Give the `mapgen-studio` Vitest project an explicit timeout budget in the
  root workspace config.
- Reduce the `standardLayerVisibility` browser-runner fixture to the compact
  standard-recipe scale while preserving its layer visibility assertions.
- Keep the change project-scoped so other package/app tests retain their
  current default timeout behavior.
- Record the remaining H4 proof evidence and rerun focused/representative
  gates.

## What Does Not Change

- No app runtime, server, Effect Layer/Scope, or product behavior changes.
- No assertions are weakened or skipped.
- No global Vitest timeout increase for unrelated projects.

## Affected Owners

- `vitest.config.ts`
- `apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts`
- Habitat H4 proof records

## Verification Gates

- `bunx vitest run --config vitest.config.ts --project mapgen-studio`
- Representative repo-wide load probe including `mapgen-studio:test`
- `bun run openspec -- validate mapgen-studio-test-timeouts --strict`
- `git diff --check`

## Stop Conditions

- A timeout increase hides a real deterministic failing assertion.
- The fix must be global instead of project-scoped.
- `mapgen-studio` still times out under a representative root-load probe.
