# Phase Record - S4.1 Game Door Invariant

## State

- Change: `mapgen-studio-game-door-invariant`
- Graphite branch: `codex/game-door-invariant`
- Parent: `main` at `b4cc968f9`
- Watcher: Rawls `019ec217-32d7-7561-9b52-768885b9fed8`
- Status: implemented, locally verified, and submitted for review
- Graphite PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1692

## Authority

- Direct user rule: no "for now" / fallback / bridge exit without durable
  rationale or deletion target.
- Graphite correction: use stack dependency normally; merge/drain only when the
  stack closes or another independent stack needs trunk integration.
- `docs/projects/studio-runtime-simplification/PLAN.md` S4.1.
- `openspec/changes/mapgen-studio-tuner-session`.
- `docs/system/direct-control/GAME-DOOR-INVARIANT.md` after this slice.

## Scope

- Docs: direct-control invariant, deferrals, S4.1 OpenSpec artifacts.
- Code: `packages/studio-server/src/contract/*`,
  `packages/studio-server/src/typeboxStandardSchema.ts`,
  `packages/studio-server/src/router/index.ts`,
  `packages/studio-server/src/context.ts`.
- Tests: `packages/studio-server/test/gameDoorInvariant.test.ts`.
- Package metadata: `packages/studio-server/package.json`, generated lock
  update through `bun install`.

## Verification Log

- `bun run --cwd packages/studio-server check` - passed.
- `bun run --cwd packages/studio-server test -- test/gameDoorInvariant.test.ts test/handler.test.ts` - passed, 2 files / 8 tests.
- `bun run --cwd packages/studio-server test` - passed, 3 files / 9 tests.
- `bun run --cwd packages/studio-server build` - passed; `tsup` emitted package JS and DTS.
- `bun run --cwd apps/mapgen-studio check` - passed.
- `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts` - passed, 2 files / 10 tests.
- `bun run --cwd apps/mapgen-studio test` - passed, 51 files / 249 tests. Existing React key warnings and expected oRPC negative-path stderr appeared; tests passed.
- `bun run --cwd apps/mapgen-studio build` - passed; Vite emitted the existing large chunk warning and `check-worker-bundle` passed.
- `bun run openspec -- validate mapgen-studio-game-door-invariant --strict` - passed.
- `bun run openspec -- validate mapgen-studio-tuner-session --strict` - passed.
- `bun run openspec:validate` - passed, 147 items.
- Negative search `rg -n "from ['\"]zod['\"]|\bz\." packages/studio-server/src/contract packages/studio-server/src -g '*.{ts,tsx}'` - no matches.
- Negative search `rg -n "RunInGameHttpError|useOperationStatusPolls|useDaemonInstanceWatchdog|nextLiveRuntimePollDelayMs|sourceSnapshotStorage|liveStatusFailureCountRef|setTimeout\(poll|civ7\.live\.status\(\{\}|liveControlPort\.readiness\.current\(|civ7ControlOrpcClient|studioServerClient|nodeWebBridge|rpcPath" apps/mapgen-studio/src packages/studio-server/src packages/studio-server/test apps/mapgen-studio/test -g '*.{ts,tsx}'` - no matches.
- Session-constructor search `rg -n "new\s+Civ7DirectControlSession\s*\(" apps packages -g '*.{ts,tsx}'` - production matches only in `packages/studio-server/src/services/Civ7TunerSession.ts` and `packages/civ7-direct-control/src/session/session.ts`; remaining matches are direct-control package tests.
- `git diff --check` - passed.
- `gt submit --stack --ai --no-interactive` - created draft PR #1692.
- `gt submit --stack --publish --no-interactive --ai` - published PR #1692 for review.

## Live Proof Disposition

S4.1 does not change operation execution, deploy execution, daemon watch
isolation, or browser event adoption. Live Play / Save&Deploy proof remains the
responsibility of the execution-changing slices already completed; this slice's
proof is source invariants, schema checks, focused handler tests, and negative
searches.
