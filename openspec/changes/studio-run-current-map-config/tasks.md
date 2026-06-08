## 1. Swooper Identity Proof

- [x] 1.1 Add stable hash helpers for Studio/server materialization.
- [x] 1.2 Add generated map metadata fields for config/envelope hash.
- [x] 1.3 Add SDK map-generation log markers for request id, map id, seed,
  dimensions, map size, config hash, and envelope hash.
- [x] 1.4 Regenerate Swooper map artifacts via scripts only.

## 2. Studio Run In Game

- [x] 2.1 Add `POST /api/civ7/run-in-game` with structured request validation.
- [x] 2.2 Add durable Save/Run and disposable current-config handling with
  explicit cleanup behavior.
- [x] 2.3 Call `@civ7/direct-control` setup/start wrappers only.
- [x] 2.4 Add separate Run in Game UI state/action without changing browser Run.
- [x] 2.5 Show phase/proof result to the developer.

## 3. Tests

- [x] 3.1 Add Studio request assembly/proof packet validation coverage where
  current test harness permits it.
- [x] 3.2 Add generator/SDK focused checks through generated artifacts and package
  build/check gates.
- [x] 3.3 Add build/check gates for touched packages.

## 4. Live Proof

- [ ] 4.1 Prove row visibility after deploy/reload boundary.
- [ ] 4.2 Prove setup seed/readback and post-start runtime seed.
- [ ] 4.3 Prove Swooper log hash/request id matches the Studio request.

`studio-civ7-exact-authorship-proof` now implements the exact proof packet and
missing/mismatched-link guards needed for these live proof tasks. The tasks
remain unchecked until a fresh Studio Run in Game operation produces a complete
exact-authorship packet from Civ readback/log evidence.
