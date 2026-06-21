# Phase Record: Deep Habitat Effect Command Runner Test Drain

## Frame

- Objective: remove live host process, host `PATH`, and wall-clock timeout
  dependencies from the command provider unit suite.
- Hard core: command timeout policy is an Effect provider concern and should be
  testable through Effect primitives.
- Exterior: no topology tests, no new command compatibility surface, no change
  to command materialization or live provider behavior.
- Falsifier: focused command runner tests fail, or helper exports create second
  provider policy paths instead of reusing the live provider path.

## Workstream State

- Graphite branch: `agent-DRA-effect-command-timeout-test-drain`
- Write set:
  - `tools/habitat-harness/src/providers/command/runner.ts`
  - `tools/habitat-harness/test/lib/command-runner.test.ts`
  - `openspec/changes/deep-habitat-effect-command-timeout-test-drain/**`
- Reviewer lanes:
  - Timing/profiling lane
  - Unit-test boundary lane
  - Tool-ownership lane

## Verification Log

- `bun run --cwd tools/habitat-harness test -- command-runner.test.ts --reporter=verbose`
  passed after timeout drain; timeout assertion completed in 17ms without
  spawning a host process.
- `bun run --cwd tools/habitat-harness test -- command-runner.test.ts --reporter=verbose`
  passed after full command-runner drain; focused test work completed in 52ms,
  with git-state capture at 1ms, unavailable projection at 0ms, and timeout
  policy at 25ms.
