# Tasks

## 1. Classify Service Module

- [x] 1.1 Add classify service contract, context, module binding, router, and
      run function.
- [x] 1.2 Compose `classify` into the root Habitat service contract and router.
- [x] 1.3 Route `habitat classify` through the Habitat service client.

## 2. Preserve Behavior

- [x] 2.1 Preserve `ClassifyResult` command JSON output.
- [x] 2.2 Preserve package helper and DTO exports for the current public-surface
      phase.
- [x] 2.3 Keep workspace graph/domain provider drainage outside this service
      ownership slice.

## 3. Guardrails And Verification

- [x] 3.1 Add classify service tests with a fake workspace graph project reader.
- [x] 3.2 Extend service architecture tests for the classify module and CLI
      route.
- [x] 3.3 Update command tests to assert classify CLI service usage.
- [x] 3.3a Repair review finding: service module and CLI rendering no longer
      import through the legacy `src/lib/classify.ts` aggregate facade, and the
      architecture guard blocks classify helper alias reintroduction in the CLI.
- [x] 3.4 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.5 Run focused classify service/command tests.
- [x] 3.6 Run `bun run --cwd tools/habitat-harness test`.
- [x] 3.7 Run `bun run biome:ci`.
- [x] 3.8 Run `bun run openspec -- validate deep-habitat-effect-classify-service-module --strict`.
- [x] 3.9 Run `bun run openspec:validate`.
- [x] 3.10 Run `git diff --check`.
