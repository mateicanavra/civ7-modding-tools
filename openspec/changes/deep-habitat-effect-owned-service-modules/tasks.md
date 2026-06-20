# Tasks

## 1. Service Module Shape

- [x] 1.1 Define the owned service-module topology and provider relationship.
- [x] 1.2 Add architecture tests for runtime, router, module, and provider boundaries.
- [x] 1.3 Add the `check` service contract, module binding, router, and run functions.
- [x] 1.4 Compose `check` into the root Habitat service contract/router/client.

## 2. CLI Cutover

- [x] 2.1 Route `habitat check` normal report execution through the `check` service module.
- [x] 2.2 Route `habitat check --expand-baseline` through the `check` service module.
- [x] 2.3 Preserve CheckReport v1 output and exit-code behavior.

## 3. Guardrails And Verification

- [x] 3.1 Add focused service tests for `check` orchestration with mocked implementation material.
- [x] 3.2 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.3 Run focused Habitat service/command tests.
- [x] 3.4 Run `bun run --cwd tools/habitat-harness test`.
- [x] 3.5 Run `bun run openspec -- validate deep-habitat-effect-owned-service-modules --strict`.
- [x] 3.6 Run `bun run openspec:validate`.
- [x] 3.7 Run `git diff --check`.
- [x] 3.8 Run `bun run biome:ci`.
