## 1. Investigation And Spec

- [ ] 1.1 Record current observed Earthlike balance failures and proof boundary.
- [ ] 1.2 Audit existing world-balance metrics and identify missing dimensions.
- [ ] 1.3 Split downstream behavior repairs into separate OpenSpec changes before
  implementation.

## 2. Implementation

- [ ] 2.1 Extend world-balance stats with terrain relief, mountain/hill coverage,
  continental elevation-profile diagnostics, pedology/soil, humidity/aridity,
  and per-family feature density outputs.
- [ ] 2.2 Add Earthlike gates that require product-visible mountains, forests,
  taiga, reefs, and atolls across representative seeds.
- [ ] 2.3 Add config parity checks for shipped Swooper Earthlike, standard
  Earthlike preset, and Studio default posture.
- [ ] 2.4 Add mechanical runtime evidence requirements for balance closure.

## 3. Verification

- [ ] 3.1 Run focused world-balance diagnostics tests.
- [ ] 3.2 Run config schema/parity tests.
- [ ] 3.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [ ] 3.4 Run `bun run openspec -- validate earthlike-balance-diagnostic-gates --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Run `git diff --check`.
