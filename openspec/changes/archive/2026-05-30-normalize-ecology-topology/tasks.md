## 1. Inventory

- [x] 1.1 Inventory current ecology stage IDs, contracts, artifacts, configs,
  presets, docs, and Studio metadata.
- [x] 1.2 Classify each feature-family wrapper against the stage-promotion
  rule.
- [x] 1.3 Inventory truth/scoring/planning logic currently in `map-ecology`.

## 2. Topology Migration

- [x] 2.1 Fold feature-family wrappers into `ecology-features` as steps or
  artifacts.
- [x] 2.2 Rehome stale `stages/ecology/` hub code to real owners or explicit
  shared surfaces.
- [x] 2.3 Update recipe stage order and config/preset stage IDs.
- [x] 2.4 Move any truth logic out of `map-ecology`.

## 3. Docs And Proof

- [x] 3.1 Add or update output-equivalence/golden checks.
- [x] 3.2 Update Ecology and standard recipe docs.
- [x] 3.3 Record any intentionally changed output behavior.

## 4. Verification

- [x] 4.1 Run ecology focused tests/golden checks.
- [x] 4.2 Run recipe/stage list checks.
- [x] 4.3 Run `bun run openspec -- validate normalize-ecology-topology --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
