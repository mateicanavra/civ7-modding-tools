# Tasks

## 1. Grit Adapter

- [x] 1.1 Move Grit command construction and vendor-output parsing to `src/providers/grit/**`.
- [x] 1.2 Route docs apply and apply dry-run command construction through `GritProvider`.
- [x] 1.3 Remove Grit adapter, docs apply, transaction apply, and Grit tests
  from the legacy `HabitatProcess` module.
- [x] 1.4 Move Grit cache directory acquisition to filesystem/cache resources.
- [x] 1.5 Preserve existing scan-root refusal and output parsing contracts.
- [x] 1.6 Move `domain-deep-import-tests` off the Grit current-tree path and onto
  a native TypeScript-AST command check, because the rule is an import-source
  policy over ignored test files rather than a vendor pattern/codemod concern.
- [x] 1.7 Remove the now-unused `expandIgnoredTestDirectories` registry/schema,
  scan-root decision, adapter batching, and diagnostic decision support.
- [x] 1.8 Expose Grit diagnostic execution as Effect programs so owned check
  execution can provide Grit resources instead of hiding runtime execution
  inside async adapter helpers.
- [x] 1.9 Move Habitat check report, baseline expansion, and rule execution
  behavior under the Effect-oRPC check service module. The service now yields
  Grit and command provider Effects directly instead of calling nested Habitat
  runtimes through `src/lib/check`.
- [x] 1.10 Delete the remaining public `src/lib/habitat-process.ts` module and
  its tests; command result/request types now export from `src/providers/command`.
- [x] 1.11 Move loose Grit-owned modules out of `src/lib`: failure ADTs,
  machine-output environment, and Grit command constants now live under
  `src/providers/grit/**`, and the old `src/lib/grit.ts` aggregate is deleted.
- [x] 1.12 Move the loose sync spawn wrapper out of `src/lib/spawn.ts`; the
  command provider now owns the spawn-shaped projection used by remaining
  service and hook callsites.

## 2. Transaction Consumption

- [x] 2.1 Consume the already-migrated transaction service module for apply dry-run orchestration.
- [x] 2.2 Replace process-layer options with provider Layers in Grit adapter and transaction callsites.
- [x] 2.3 Remove `makeFakeHabitatProcessLayer` and `HabitatProcessLive` usage from Grit adapter/apply tests and callsites; use `GritProvider` fake/live Layers instead.
- [x] 2.4 Preserve D9 refusal reasons and recovery instructions.

## 3. Tests And Proof

- [x] 3.1 Update fake-provider tests for Grit command construction, apply dry-run, command failed, parse failed, and cache missing states.
- [x] 3.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts test/service/fix-service.test.ts test/service/transactions-service.test.ts test/lib/vendor-providers.test.ts`.
- [x] 3.3 Run `bun run --cwd tools/habitat-harness validate:grit-patterns`.
- [ ] 3.4 Run `bun run habitat check --tool pattern-check --json`.
  - 2026-06-20 result: still fails because the standard Grit source command
    times out with `GritCommandFailed` / exit 130 under the provider timeout.
    `domain-deep-import-tests` was removed from that path and now passes as
    `command-check`; the unused ignored-test expansion substrate was deleted.
    The remaining failure is the broader Grit source execution shape.
  - 2026-06-20 follow-up: a review lane reran this command after the Effect
    program extraction; it still produced no report after roughly five minutes.
    The patch improves ownership boundaries but does not close the current-tree
    Grit performance blocker.
  - 2026-06-20 rerun after the user's restack: still fails after about 127s
    with repeated source-rule `GritCommandFailed` / exit 130 diagnostics. The
    discoveries fix is present, but the standard source Grit invocation remains
    unsound for full current-tree pattern-check.

## 4. Validation

- [x] 4.1 Run `bun run --cwd tools/habitat-harness check`.
- [x] 4.2 Run `bun run openspec -- validate deep-habitat-effect-grit-apply-cutover --strict`.
- [x] 4.3 Run `bun run openspec:validate`.
- [x] 4.4 Run `git diff --check`.
- [x] 4.5 Run `bun run biome:ci`.
