## Why

After `mapgen-studio:test` was stabilized, the H4 root test proof advanced to
the CLI project and exposed a second root-load timeout class. Direct CLI Vitest
passed, but Nx execution of `@mateicanavra/civ7-cli:test` failed several
integration-heavy game command tests at Vitest's 5s default timeout. Timed-out
tests left async command/server work in flight, which contaminated later
assertions in the same files.

The Habitat proof gate needs CLI failures to represent command behavior, not a
test timeout budget that is too small under Nx/root-load execution.

## What Changes

- Give only the `cli` Vitest project an explicit timeout budget in the root
  workspace config.
- Record the focused direct and Nx evidence that distinguishes deterministic
  CLI behavior from root-load timing.

## What Does Not Change

- No CLI command, oclif, direct-control, Effect, or product/runtime behavior
  changes.
- No assertions are weakened or skipped.
- No global Vitest timeout increase for unrelated projects.

## Affected Owners

- `vitest.config.ts`
- Habitat H4 proof records

## Verification Gates

- `bunx vitest run --config vitest.config.ts --project cli`
- `bunx nx run @mateicanavra/civ7-cli:test --outputStyle=static`
- Representative root-load test probe that includes `@mateicanavra/civ7-cli:test`
- `bun run openspec -- validate cli-root-load-test-timeouts --strict`
- `git diff --check`

## Stop Conditions

- A timeout increase hides a deterministic assertion failure.
- The fix must be global instead of project-scoped.
- CLI tests still fail under focused Nx execution after the timeout budget is
  applied.
