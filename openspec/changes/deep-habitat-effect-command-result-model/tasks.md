# Tasks

## 1. Model

- [x] 1.1 Split command request/result/observation types into target files.
- [x] 1.2 Replace optional parse/failure fields with discriminated variants.
- [x] 1.3 Add `never` exhaustiveness checks in render/projection functions.
- [x] 1.4 Preserve existing receipt-safe output bounds and env redaction.

## 2. Tests

- [x] 2.1 Add compile/runtime tests for impossible command states.
- [x] 2.2 Add tests for env redaction and output digest/truncation.
- [x] 2.3 Add tests for Git state ownership through fake `GitStateProvider`.

## 3. Validation

- [x] 3.1 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.2 Run `bun run --cwd tools/habitat-harness test`.
- [x] 3.3 Run `bun run openspec -- validate deep-habitat-effect-command-result-model --strict`.
- [x] 3.4 Run `bun run openspec:validate`.
- [x] 3.5 Run `git diff --check`.
