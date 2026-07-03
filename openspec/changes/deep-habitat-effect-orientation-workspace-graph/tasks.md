# Tasks

## 1. Move Domain And Provider Facts

- [x] 1.1 Move classify core into `src/domains/workspace-graph-integration/**`.
- [x] 1.2 Move Nx graph/target fact reads into `src/providers/nx/**`.
- [x] 1.3 Replace direct filesystem/package inventory reads with services/provider edges.
- [x] 1.4 Preserve classify path/diff matrix behavior.

## 2. Verification

- [x] 2.1 Run H8 classify path/diff matrix tests.
- [x] 2.2 Run workspace graph unit tests.
- [x] 2.3 Run `bun run habitat classify tools/habitat-harness/src`.
- [x] 2.4 Run `bun run openspec -- validate deep-habitat-effect-orientation-workspace-graph --strict`.
- [x] 2.5 Run `bun run openspec:validate`.
- [x] 2.6 Run `git diff --check`.
