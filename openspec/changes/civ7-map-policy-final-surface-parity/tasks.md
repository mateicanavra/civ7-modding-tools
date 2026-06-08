## 1. Proof Input

- [x] 1.1 Consume a completed exact-authorship proof packet.
- [x] 1.2 Produce or repair a single command path for full-grid local-vs-live
  terrain/biome/feature/resource comparison.
- [x] 1.3 Record the exact branch, commit, config hash, envelope hash, request
  id, seed, map size, dimensions, and live readback bounds.

## 2. Delta Classification

- [ ] 2.1 Classify terrain deltas with source evidence.
  - Terrain-edge diagnostics and bounded mock/materialization repairs are
    integrated, but the post-repair T1 enclosed-water terrain row remains
    unresolved.
- [x] 2.2 Classify biome deltas with source evidence.
- [ ] 2.3 Classify feature deltas with source evidence.
- [ ] 2.4 Classify resource deltas with source evidence.
- [x] 2.5 Route product-blocking deltas to targeted repair workstreams.

## 3. Repairs And Routing

- [x] 3.1 Route possible policy gaps to the correct downstream diagnostic
  owner without treating source-authority classification as complete.
- [x] 3.2 Route possible pipeline/materialization gaps to the correct MapGen
  or adapter owner without treating source-authority classification as
  complete.
- [x] 3.3 Record focused tests/diagnostics required by the downstream repair
  classes.

## 4. Verification And Realignment

- [x] 4.1 Re-run exact-authorship plus full-grid parity proof after proof-path
  and player-count readback repairs; downstream source-authority repairs remain
  outside this slice.
- [x] 4.2 Update parity ledgers and review disposition records.
- [x] 4.3 Run focused package tests/checks for touched owners.
- [x] 4.4 Run `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
