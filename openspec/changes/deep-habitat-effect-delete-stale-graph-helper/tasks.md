# Tasks

## 1. Baseline

- [x] 1.1 Confirm `src/lib/graph.ts` has no active imports.
- [x] 1.2 Confirm `habitat graph` uses the service/provider path.
- [x] 1.3 Confirm public-surface guards still allow the stale helper.

## 2. Implementation

- [x] 2.1 Delete `src/lib/graph.ts`.
- [x] 2.2 Remove the helper from public-surface allowlists.
- [x] 2.3 Add the helper to the deleted-adapter guard.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/domains/public-surface-guards/guard.js`
- [x] 3.2 `bun run --cwd tools/habitat-harness check`
- [x] 3.3 `bun run openspec -- validate deep-habitat-effect-delete-stale-graph-helper --strict`
- [x] 3.4 `bun run check`
- [x] 3.5 `git diff --check`
- [x] 3.6 `bun run openspec:validate`

## 4. Follow-Up Dominoes

- [ ] 4.1 Delete remaining legacy sync hook helpers after service-path tests are
  moved fully to provider fakes.
- [ ] 4.2 Continue adapter enclosure cleanup for any other raw vendor helper
  surfaced by the guard.
