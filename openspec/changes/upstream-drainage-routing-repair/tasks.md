## 1. Upstream Routing Owner

- [x] 1.1 Add Hydrology-owned `compute-drainage-routing` op.
- [x] 1.2 Wire `hydrology-hydrography/rivers` to use the Hydrology routing op
      instead of local raw steepest descent.
- [x] 1.3 Publish routing diagnostics (`basinId`, `routingElevation`,
      `depressionDepth`, `terminalType`) on Hydrology hydrography.
- [x] 1.4 Remove silent cycle fallback in discharge accumulation.

## 2. Downstream Compensation Removal

- [x] 2.1 Remove `map-rivers` connected-corridor fallback selection.
- [ ] 2.2 Realign `map-rivers-navigable-coherence` as a pure consumer change.
- [x] 2.3 Add generated-map route metric artifacts for seed-matrix tests.

## 3. Verification

- [x] 3.1 Add fixture tests for pit spill routing, closed basins, and cycle
      failure.
- [x] 3.2 Run focused Hydrology/map-rivers/config/generated-map tests.
- [x] 3.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 3.4 Validate this OpenSpec change and `bun run openspec:validate`.
