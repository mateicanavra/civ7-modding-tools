## 1. Investigation And Spec

- [x] 1.1 Run fresh shipped-map stats across current configs and representative earthlike seeds.
- [x] 1.2 Identify remaining product-visible balance gaps after archived quality gates.
- [x] 1.3 Draft OpenSpec proposal/spec before implementation edits.

## 2. Implementation

- [x] 2.1 Strengthen world-balance tests so vegetation-family distribution is map-identity specific.
- [x] 2.2 Tune shipped ecology config and/or owner-local feature policies to satisfy the stronger gates.
- [x] 2.3 Keep hydrology lake shape/projection assertions intact and green.
- [x] 2.4 Update adjacent docs/specs only if durable product behavior changes.

## 3. Verification

- [x] 3.1 Run focused world-balance and config tests.
- [x] 3.2 Run focused ecology planner/policy tests affected by the change.
- [x] 3.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 3.4 Run targeted and global OpenSpec validation.
- [x] 3.5 Run `bun run build`.
- [x] 3.6 Deploy the mod from the final tree and verify deployed artifact parity.
- [x] 3.7 Run `git diff --check`.
- [x] 3.8 Run fresh FireTuner restart proof from the deployed final tree:
  `codex-010` submitted raw `Network.restartGame()` at 2026-05-30 17:04:27,
  Civ7 created `MapGeneration` at 2026-05-30 17:04:33, Swooper completed
  50/50 recipe steps by 2026-05-30 17:04:35, and the bounded Swooper log window
  had no Swooper error/failure lines.
