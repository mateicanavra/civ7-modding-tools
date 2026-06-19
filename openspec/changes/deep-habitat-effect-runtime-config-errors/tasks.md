# Tasks

## 1. Runtime Skeleton

- [ ] 1.1 Add `src/{runtime,config,errors,resources,providers/command,providers/reporter}/**` modules and exports.
- [ ] 1.2 Move runtime bridge ownership out of general `src/lib/**`.
- [ ] 1.3 Add live and fake layers for config, clock, filesystem, reporter,
  command runner, and resource scope.

## 2. Error And Config Model

- [ ] 2.1 Add tagged error taxonomy.
- [ ] 2.2 Replace expected generic throws in the runtime write set.
- [ ] 2.3 Centralize repo root, cache root, env, telemetry, and tool command
  policy in `HabitatConfig`.

## 3. Process Collapse

- [ ] 3.1 Route `spawn.ts`, `workspace-tools.ts`, and `habitat-process.ts`
  through one `CommandRunner` contract.
- [ ] 3.2 Remove library-local `Effect.runSync`.
- [ ] 3.3 Preserve command result fidelity and public behavior.

## 4. Verify

- [ ] 4.1 Static scan for `Effect.run*` outside adapters.
- [ ] 4.2 `bun run --cwd tools/habitat-harness check`
- [ ] 4.3 `bun run --cwd tools/habitat-harness test`
- [ ] 4.4 `bun run habitat:check -- --json`
- [ ] 4.5 `bun run openspec:validate`
- [ ] 4.6 `git diff --check`
