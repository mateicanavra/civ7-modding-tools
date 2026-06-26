# Tasks

## 1. Move And Adapt

- [ ] 1.1 Move verify source into `src/domains/proof-contract/**`.
- [ ] 1.2 Move workspace graph contracts into `src/domains/workspace-graph-integration/**`.
- [ ] 1.3 Route base resolution and status reads through `GitProvider`.
- [ ] 1.4 Route affected target execution through `NxProvider`.

## 2. Receipt Preservation

- [ ] 2.1 Preserve verify receipt schemas.
- [ ] 2.2 Preserve bounded stdout/stderr previews.
- [ ] 2.3 Preserve check-before-affected sequencing.

## 3. Verification

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/lib/workspace-graph.test.ts`.
- [ ] 3.2 Run `bun run habitat verify --json`.
- [ ] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 3.4 Run `bun run openspec -- validate deep-habitat-effect-verify-graph-cutover --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Run `git diff --check`.
