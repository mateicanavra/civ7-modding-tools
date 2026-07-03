# Tasks

## 1. Runtime Skeleton

- [x] 1.1 Add `src/{runtime,config,errors,resources,providers/command,providers/reporter}/**` modules and exports.
- [x] 1.2 Move runtime bridge ownership out of general `src/lib/**`.
- [x] 1.3 Add live and fake layers for config, reporter, command runner, and
  provider-owned services; native filesystem/clock come from Effect platform
  layers after `deep-habitat-effect-native-platform-resource-drain`.

## 2. Error And Config Model

- [x] 2.1 Add tagged error taxonomy.
- [x] 2.2 Replace expected generic throws in the runtime write set.
- [x] 2.3 Centralize repo root, cache root, env, telemetry, and tool command
  policy in `HabitatConfig`.

## 3. Process Collapse

- [x] 3.1 Route `spawn.ts`, `workspace-tools.ts`, and `habitat-process.ts`
  through one `CommandRunner` contract.
- [x] 3.2 Remove library-local `Effect.runSync`.
- [x] 3.3 Preserve command result fidelity and public behavior.

## 4. Verify

- [x] 4.1 Static scan for `Effect.run*` outside adapters.
- [x] 4.2 `bun run --cwd tools/habitat-harness check`
- [x] 4.3 `bun run --cwd tools/habitat-harness test`
- [x] 4.4 `bun run habitat check --tool habitat --json`
- [x] 4.5 `bun run openspec:validate`
- [x] 4.6 `git diff --check`
