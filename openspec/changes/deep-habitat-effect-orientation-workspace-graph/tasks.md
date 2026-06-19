# Tasks

## 1. Move Domain And Provider Facts

- [ ] 1.1 Move classify core into `src/domains/workspace-graph-integration/**`.
- [ ] 1.2 Move Nx graph/target fact reads into `src/providers/nx/**`.
- [ ] 1.3 Replace direct filesystem/package inventory reads with services.
- [ ] 1.4 Preserve classify path/diff matrix behavior.

## 2. Verification

- [ ] 2.1 Run H8 classify path/diff matrix tests.
- [ ] 2.2 Run workspace graph unit tests.
- [ ] 2.3 Run `bun run habitat classify tools/habitat-harness/src`.
- [ ] 2.4 Run `bun run openspec -- validate deep-habitat-effect-orientation-workspace-graph --strict`.
- [ ] 2.5 Run `bun run openspec:validate`.
- [ ] 2.6 Run `git diff --check`.
