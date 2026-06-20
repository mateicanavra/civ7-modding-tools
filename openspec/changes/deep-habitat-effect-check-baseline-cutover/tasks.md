# Tasks

## 1. Move And Adapt

- [x] 1.1 Move baseline source into `src/domains/baseline-authority/**`.
- [x] 1.2 Move check source into `src/domains/structural-check/**`.
- [x] 1.3 Introduce `BaselineAuthority` as an owned Effect domain service and
      consume it from the `StructuralCheck` service path.
- [x] 1.4 Replace active baseline service side-effect options with Effect services.
- [x] 1.5 Replace active check/baseline Git/fs/time calls with providers.

## 2. Error And Report Semantics

- [x] 2.1 Map expected refusal states to tagged errors or existing typed refusal variants.
- [x] 2.2 Preserve `CheckReport` schema and JSON rendering.
- [x] 2.3 Add boundary render tests for expected failures.

## 3. Verification

- [x] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/check-summaries.test.ts`.
- [x] 3.2 Run `bun run habitat check --json`.
- [x] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.4 Run `bun run openspec -- validate deep-habitat-effect-check-baseline-cutover --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Run `bun run --cwd tools/habitat-harness test -- test/lib/check-baseline-provider-boundary.test.ts test/lib/baseline.test.ts test/lib/check-summaries.test.ts test/service/check-service.test.ts test/service/service-architecture.test.ts`.
