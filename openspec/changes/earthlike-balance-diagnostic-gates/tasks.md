## 1. Investigation And Spec

- [x] 1.1 Record current observed Earthlike balance failures and proof boundary.
- [x] 1.2 Audit existing world-balance metrics and identify missing dimensions.
- [x] 1.3 Split downstream behavior repairs into separate OpenSpec changes before
  implementation.

## 2. Implementation

- [x] 2.1 Extend world-balance stats with terrain relief, mountain/hill coverage,
  continental elevation-profile diagnostics, pedology/soil, humidity/aridity,
  and per-family feature density outputs.
- [x] 2.2 Add Earthlike gates that require product-visible mountains, forests,
  taiga, reefs, and atolls across representative seeds.
- [x] 2.3 Add exact config posture checks for shipped Swooper Earthlike,
  legacy realism callers, and Studio default posture.
- [x] 2.4 Add mechanical runtime evidence requirements for balance closure.

## 3. Verification

- [x] 3.1 Run focused world-balance diagnostics tests.
- [x] 3.2 Run shipped config schema and default-posture checks.
- [x] 3.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 3.4 Run `bun run openspec -- validate earthlike-balance-diagnostic-gates --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Run `git diff --check`.
