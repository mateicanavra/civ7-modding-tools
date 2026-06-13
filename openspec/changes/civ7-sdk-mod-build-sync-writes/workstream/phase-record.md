# Phase Record

## Phase

- Project: Habitat Harness / SDK repair
- Phase: `civ7-sdk-mod-build-sync-writes`
- Owner: Codex
- Branch/Graphite stack: `agent-F-sdk-mod-test-teardown` above `agent-F-habitat-oclif-cli`
- Started: 2026-06-13
- Status: Implemented and verified with residual unrelated umbrella-test red; ready for commit

## Objective

- Target movement: repair the SDK mod build write contract so `Mod.build()`
  leaves no asynchronous file callbacks running after it returns.
- Non-goals: async API migration, generated XML/content changes, broad SDK
  builder refactor, Habitat rule changes.
- Done condition: concrete file writes are synchronous/complete, tests remove
  sleep compensation, SDK tests pass without unhandled ENOENT, plugin-files
  scoped tests pass, exact plugin-files package command is dispositioned if
  still blocked by unrelated root-project failures, OpenSpec validates, and
  branch commits cleanly.

## Authority

- Root/subtree `AGENTS.md`: root `AGENTS.md`; `packages/sdk/AGENTS.md`.
- Project refs: user/Fable suggested task "Fix async-write race in SDK mod
  tests (ENOENT teardown)"; Habitat H4 DL-15 root/package test blocker.
- Code refs: `packages/sdk/src/files/XmlFile.ts`,
  `packages/sdk/src/files/ImportFile.ts`, `packages/sdk/src/core/Mod.ts`,
  `packages/sdk/test/mod.test.ts`, `packages/sdk/test/mod-build.test.ts`,
  `packages/sdk/test/mapgen-create-map.test.ts`.

## Current State

- Repo/Graphite state: clean branch created above H4.5.
- Dirty files and owner: only this OpenSpec repair record at phase open.
- Current code evidence: `XmlFile.write()` and `ImportFile.write()` call async
  `fs.mkdir(..., callback)` and perform synchronous write/copy inside the
  callback. `Mod.build()` returns immediately after invoking `file.write()`.
- Tests/guards affected: SDK Vitest project, plugin-files package-local test
  command that ascends to the root Vitest config, SDK typecheck.

## Scope

- Write set: `packages/sdk/src/files/XmlFile.ts`,
  `packages/sdk/src/files/ImportFile.ts`, `packages/sdk/test/mod-build.test.ts`,
  `packages/sdk/test/mapgen-create-map.test.ts`, this OpenSpec change.
- Protected files: generated outputs, unrelated SDK builders, root Vitest
  project scoping.
- Consumer impact: `Mod.build()` remains synchronous but becomes stronger:
  files are durable when the method returns.

## Implementation

- Completed tasks: all tasks in `tasks.md` completed with 3.3 residual red
  disposition.
- Remaining tasks: commit.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `cd packages/sdk && bun run test`
  - `cd packages/sdk && bun run check`
  - `cd packages/sdk && bun vitest run --project sdk test/mapgen-create-map.test.ts --testTimeout 20000`
  - `cd packages/plugins/plugin-files && bun run test`
  - `cd packages/plugins/plugin-files && bun vitest run --project plugin-files`
  - `bun run openspec -- validate civ7-sdk-mod-build-sync-writes --strict`
  - `git diff --check`
- Results:
  - SDK test passes: 6 files, 10 tests.
  - SDK check passes.
  - Single mapgen timeout probe passes with larger timeout, proving the prior
    red was import/setup budget rather than assertion failure; final fix moves
    import out of the timed body and full SDK test passes with default timeout.
  - Exact plugin-files package command no longer reports SDK ENOENT and shows
    SDK/plugin-files tests passing, but exits 1 due unrelated mapgen-studio
    root-project failures: missing
    `mod-swooper-maps/recipes/standard-artifacts` and existing mapgen-studio
    timeouts.
  - Scoped plugin-files project passes: 1 file, 6 tests.
  - OpenSpec and diff checks pass.
- Skipped gates and rationale: no generated XML byte-parity fixture was added
  because existing `mod-build.test.ts` reads generated `.modinfo` and builder
  XML immediately after `Mod.build()` and asserts content markers.
- Evidence boundary: this repair closes the late SDK filesystem callback; it
  does not solve root Vitest project scoping or unrelated mapgen-studio missing
  artifact/timeouts.

## Next Action

- Exact next step: final status/diff check, stage, and commit via Graphite.
- First files to inspect: `git diff --stat`, `git status --short --branch`.
- Stop condition: dirty files outside the SDK repair write set.
