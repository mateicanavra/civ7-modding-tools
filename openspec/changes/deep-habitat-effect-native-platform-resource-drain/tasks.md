# Tasks

## 1. Resource Drain

- [x] 1.1 Delete duplicate Habitat clock, scope, workspace lock, and write-set
  services.
- [x] 1.2 Rework Habitat filesystem helpers to use
  `@effect/platform/FileSystem` for Effect flows.
- [x] 1.3 Keep sync filesystem/time primitives contained in resource helpers
  for existing sync public/import-time paths.
- [x] 1.4 Rework temp directory acquisition to use native scoped platform
  resources.

## 2. Runtime And Callers

- [x] 2.1 Remove deleted resource layers from runtime and test layer
  composition.
- [x] 2.2 Move migrated Effect flows from `HabitatClock` to native `Clock`.
- [x] 2.3 Move migrated filesystem callers to resource helpers backed by the
  platform filesystem service.
- [x] 2.4 Replace Habitat fake filesystem usage with an official platform
  filesystem test layer.

## 3. Guardrails And Realignment

- [x] 3.1 Update public-surface guard allowlists for the new resource time
  edge.
- [x] 3.2 Verify deleted services and fake layers no longer appear in
  Habitat source or tests.
- [x] 3.3 Update the native-platform resource packet so this branch has a
  durable domino record.
- [x] 3.4 Add guard ratchets for native Effect `Clock` imports and sync
  filesystem helper imports.
- [x] 3.5 Remove the `HabitatFileSystem` alias so requirements name the native
  platform filesystem service directly.

## 4. Validation

- [x] 4.1 Run `bun install`.
- [x] 4.2 Run `bun run --cwd tools/habitat-harness check`.
- [x] 4.3 Run `bun run --cwd tools/habitat-harness test`.
- [x] 4.4 Run `bun run habitat check --tool habitat --json`.
- [x] 4.5 Run `bun run biome:ci`.
- [x] 4.6 Run `bun run openspec -- validate deep-habitat-effect-native-platform-resource-drain --strict`.
- [x] 4.7 Run `bun run openspec:validate`.
- [x] 4.8 Run `bun run build`.
- [x] 4.9 Run `git diff --check`.
