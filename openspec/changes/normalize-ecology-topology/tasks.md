## 1. Inventory

- [ ] 1.1 Inventory current ecology stage IDs, contracts, artifacts, configs,
  presets, docs, and Studio metadata.
- [ ] 1.2 Classify each feature-family wrapper against the stage-promotion
  rule.
- [ ] 1.3 Inventory truth/scoring/planning logic currently in `map-ecology`.

## 2. Topology Migration

- [ ] 2.1 Fold feature-family wrappers into `ecology-features` as steps or
  artifacts.
- [ ] 2.2 Rehome stale `stages/ecology/` hub code to real owners or explicit
  shared surfaces.
- [ ] 2.3 Update recipe stage order and config/preset stage IDs.
- [ ] 2.4 Move any truth logic out of `map-ecology`.

## 3. Docs And Proof

- [ ] 3.1 Add or update output-equivalence/golden checks.
- [ ] 3.2 Update Ecology and standard recipe docs.
- [ ] 3.3 Record any intentionally changed output behavior.

## 4. Verification

- [ ] 4.1 Run ecology focused tests/golden checks.
- [ ] 4.2 Run recipe/stage list checks.
- [ ] 4.3 Run `bun run openspec -- validate normalize-ecology-topology --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
