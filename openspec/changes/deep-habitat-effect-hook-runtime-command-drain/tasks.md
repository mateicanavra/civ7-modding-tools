# Tasks

## 1. Baseline

- [x] 1.1 Confirm hook command execution still flows through `HookRuntime.runCommand`.
- [x] 1.2 Confirm GitProvider already exposes the Git operations needed by hooks.
- [x] 1.3 Confirm hook tests already execute the service path with fake providers.

## 2. Implementation

- [x] 2.1 Remove `HookRuntime.runCommand`.
- [x] 2.2 Delete the hook-domain sync command runner.
- [x] 2.3 Route staged path, restage, resource inspection, repo snapshot, and
  Graphite parent discovery through providers from the hook service router.
- [x] 2.4 Update hook tests to fake providers rather than injecting command
  behavior through `HookRuntime`.
- [x] 2.5 Close the stale follow-up in
  `deep-habitat-effect-delete-stale-graph-helper`.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts test/service/hook-service.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness check`
- [x] 3.3 `bun run openspec -- validate deep-habitat-effect-hook-runtime-command-drain --strict`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-delete-stale-graph-helper --strict`
- [x] 3.5 `bun run openspec:validate`
- [x] 3.6 `bun run biome:ci`
- [x] 3.7 `git diff --check`
- [x] 3.8 `bun run --cwd tools/habitat-harness build`
- [x] 3.9 `bun run --cwd tools/habitat-harness test`
- [x] 3.10 `NX_DAEMON=false nx run @internal/habitat-harness:boundaries --outputStyle=static`
