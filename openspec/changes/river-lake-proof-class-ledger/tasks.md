## 1. Proof Taxonomy

- [x] 1.1 Inventory current proof statuses in live parity, exact-authorship, and
  product acceptance records.
- [x] 1.2 Add typed proof labels for river/lake/floodplain claims.
- [x] 1.3 Preserve exact-authorship completion while preventing it from implying
  terrain, metadata, visual, or product completion.

## 2. Consumers

- [x] 2.1 Update live-parity output and fixtures to emit labeled river/lake
  proof claims.
- [x] 2.2 Update product acceptance ledgers to consume labeled claims.
- [x] 2.3 Confirm Studio/run-in-game status does not currently consume
  final-surface parity proof packet summaries; no display vocabulary update is
  required in this proof-ledger slice.

## 3. Validation

- [x] 3.1 Add tests for `terrain-match-metadata-divergent` and visual-missing
  cases.
- [x] 3.2 Validate this OpenSpec change.
- [x] 3.3 Run focused parity/product proof tests and `bun run openspec:validate`.
