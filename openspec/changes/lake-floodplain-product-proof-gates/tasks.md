## 1. Lake And Floodplain Proof

- [x] 1.1 Emit exact log lake counters and block lake closure on missing exact
  counters.
- [x] 1.2 Preserve a floodplain active seed regression with nonzero live feature
  evidence.
- [x] 1.3 Keep inactive floodplain/no-signal rows labeled as controls, not
  product passes.
- [x] 1.4 Move floodplain proof inputs to Hydrology/final-surface truth plus Civ
  legality/readback, and prevent projected navigable adjacency from being the
  sole product-proof input.

## 2. Product Matrix

- [ ] 2.1 Define fixture, fast seed, Earthlike, holdout, contrast,
  floodplain-active, and arid/no-signal rows.
  - The shared row taxonomy is now seeded in
    `../swooper-earthlike-product-acceptance-proof/workstream/acceptance-matrix.md`;
    lake/floodplain-specific closure still needs the exact row assignments and
    reviewer dispositions.
- [ ] 2.2 Require proof labels and reviewer disposition for each row.
- [ ] 2.3 Update closure ledgers so no row can close from a narrower proof class.

## 3. Validation

- [ ] 3.1 Run lake/floodplain/live-parity/product acceptance tests.
- [ ] 3.2 Validate this OpenSpec change and `bun run openspec:validate`.
