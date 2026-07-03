# Tasks

## 1. Model

- [ ] 1.1 Split command request/result/observation types into target files.
- [ ] 1.2 Replace optional parse/failure fields with discriminated variants.
- [ ] 1.3 Add `never` exhaustiveness checks in render/projection functions.
- [ ] 1.4 Preserve existing receipt-safe output bounds and env redaction.

## 2. Tests

- [ ] 2.1 Add compile/runtime tests for impossible command states.
- [ ] 2.2 Add tests for env redaction and output digest/truncation.
- [ ] 2.3 Add tests for Git state ownership through fake `GitProvider`.

## 3. Validation

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 3.2 Run `bun run --cwd tools/habitat-harness test`.
- [ ] 3.3 Run `bun run openspec -- validate deep-habitat-effect-command-result-model --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `git diff --check`.
