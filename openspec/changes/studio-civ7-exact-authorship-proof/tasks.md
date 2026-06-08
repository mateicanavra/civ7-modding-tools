## 1. Proof Packet Assembly

- [x] 1.1 Inspect current Studio Run in Game request assembly and record any
  missing proof fields.
- [x] 1.2 Add focused Studio proof assembly/request-status coverage where current
  test harness permits it.
- [x] 1.3 Capture visible Studio config identity, seed, setup fields, and hashes
  for the selected proof run packet.
- [x] 1.4 Capture materialized source script and deployed mod script paths and
  content hashes in the operation proof packet.

## 2. Live Proof

- [x] 2.1 Add exact proof packet fields for Civ setup row visibility after the
  current deploy/reload boundary.
- [x] 2.2 Add exact proof packet fields for setup seed/readback and post-start
  runtime seed/dimensions.
- [x] 2.3 Parse Swooper log request id, config hash, envelope hash, seed,
  dimensions, and completion payload for the Studio request.
- [x] 2.4 Record the exact-authorship proof packet on completed Run in Game
  operation status.

## 3. Realignment And Validation

- [x] 3.1 Update downstream `studio-run-current-map-config` task/proof state.
- [x] 3.2 Record live-run proof limitations or results before closure.
- [x] 3.3 Run focused tests/checks for touched packages.
- [x] 3.4 Run `bun run openspec -- validate studio-civ7-exact-authorship-proof --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
