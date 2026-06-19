# Tasks

## 1. Move Domains

- [ ] 1.1 Move pattern apply transaction source into `src/domains/transformation-transaction/**`.
- [ ] 1.2 Move protected-zone source into `src/domains/protected-zone-authority/**`.
- [ ] 1.3 Replace temp/cache/write side effects with scoped resources.
- [ ] 1.4 Preserve refusal and recovery record specificity.

## 2. Verification

- [ ] 2.1 Run pattern apply transaction tests.
- [ ] 2.2 Run protected-zone admission/refusal tests.
- [ ] 2.3 Run `bun run habitat check --tool pattern-check --json`.
- [ ] 2.4 Run `bun run openspec -- validate deep-habitat-effect-transformation-transaction-domain --strict`.
- [ ] 2.5 Run `bun run openspec:validate`.
- [ ] 2.6 Run `git diff --check`.
