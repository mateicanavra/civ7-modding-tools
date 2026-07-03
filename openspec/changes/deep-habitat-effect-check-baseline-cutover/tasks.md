# Tasks

## 1. Move And Adapt

- [ ] 1.1 Move baseline source into `src/domains/baseline-authority/**`.
- [ ] 1.2 Move check source into `src/domains/structural-check/**`.
- [ ] 1.3 Replace baseline context side-effect options with Effect services.
- [ ] 1.4 Replace direct Git/fs/time calls with providers.

## 2. Error And Report Semantics

- [ ] 2.1 Map expected refusal states to tagged errors or existing typed refusal variants.
- [ ] 2.2 Preserve `CheckReport` schema and JSON rendering.
- [ ] 2.3 Add boundary render tests for expected failures.

## 3. Verification

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/check-summaries.test.ts`.
- [ ] 3.2 Run `bun run habitat check --json`.
- [ ] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 3.4 Run `bun run openspec -- validate deep-habitat-effect-check-baseline-cutover --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Run `git diff --check`.
