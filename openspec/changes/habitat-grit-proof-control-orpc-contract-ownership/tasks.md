## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, control-oRPC package
  router, corpus ledger, and proof matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_orpc_contract_ownership --json`.
- [x] 2.3 Run parser inventory over current control-oRPC source with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, blockers, and
  non-claims in this packet.
- [x] 2.5 Repair root-index module-contract schema re-export predicate and
  prove direct plus aliased named schema specifier fixtures.

## 3. Dependency-Bound Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - Current closure records per-rule `grit-control-orpc-contract-ownership`
    Habitat wrapper proof and aggregate `grit-check` proof.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - Current closure records row-specific injected violation/path-control proof;
    aggregate injected-corpus closure remains separate while DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - Current closure records explicit empty baseline ownership and
    `baseline-integrity` through wrapper proof.
- [x] 3.5 Live current-predicate control-oRPC contract ownership disposition.
  - Parser inventory records zero live current-row candidates. Raw acquisition,
    broader architecture closure, apply safety, and product/runtime proof remain
    non-claims.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for taxonomy, invariant corpus,
  discrepancy log, recovery, and command docs unless policy or user-facing
  behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-control-orpc-contract-ownership --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 active-packet language guardrail scan
- [x] 5.5 `git diff --check`
- [x] 5.6 `bun run openspec:validate`
- [x] 5.7 commit via Graphite with a clean worktree
- [x] 5.8 `bun run habitat:check -- --json --rule grit-control-orpc-contract-ownership`
- [x] 5.9 `bun run habitat:check -- --json --tool grit-check`
- [x] 5.10 row-specific injected probe run from clean start
