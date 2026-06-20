# Tasks

## 1. Graph Service Module

- [x] 1.1 Add graph service contract, module binding, router, and run function.
- [x] 1.2 Compose `graph` into the root Habitat service contract and router.
- [x] 1.3 Route `habitat graph` through the Habitat service client.

## 2. Provider And Resource Boundary

- [x] 2.1 Add `NxProvider.graph` and `graphArgv`.
- [x] 2.2 Read graph JSON through `HabitatFileSystem`.
- [x] 2.3 Use scoped temp-directory acquisition for the graph output file.

## 3. Guardrails And Verification

- [x] 3.1 Add graph service tests with fake Nx provider and fake filesystem.
- [x] 3.2 Extend service architecture tests for the graph module and CLI route.
- [x] 3.3 Update command tests to assert graph CLI service usage.
- [x] 3.4 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.5 Run focused graph service/command tests.
- [x] 3.6 Run `bun run --cwd tools/habitat-harness test`.
- [x] 3.7 Run `bun run biome:ci`.
- [x] 3.8 Run `bun run openspec -- validate deep-habitat-effect-graph-service-module --strict`.
- [x] 3.9 Run `bun run openspec:validate`.
- [x] 3.10 Run `git diff --check`.
