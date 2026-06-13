# Review Disposition Ledger - S4.1 Game Door Invariant

| ID | Severity | Source | Finding | Disposition | Repair Evidence | Blocks Closure |
|---|---:|---|---|---|---|---|
| S4.1-W1 | P1 | watcher Rawls `019ec217-32d7-7561-9b52-768885b9fed8` | S4.1 invariant deliverables absent: guard test and Habitat-style invariant doc required. | accepted-repaired | Added `docs/system/direct-control/GAME-DOOR-INVARIANT.md` and `packages/studio-server/test/gameDoorInvariant.test.ts`. | No |
| S4.1-W2 | P1 | watcher Rawls | Legacy Zod success schemas remained without S4.1 closeout. | accepted-repaired | Migrated `packages/studio-server/src/contract/{shared,studio,civ7,live,runInGame,mapConfigs}.ts` to TypeBox/Standard Schema and removed direct `zod` dependency from `@civ7/studio-server`. | No |
| S4.1-W3 | P1 | watcher Rawls | `mapgen-studio-tuner-session` still had unresolved task closeout. | accepted-repaired | Updated tuner-session tasks: per-flow sessions closed by game-door invariant; Restart Civ7 affordance moved to `DEF-015`. | No |
| S4.1-W4 | P2 | watcher Rawls | Stale coexistence/bridge comments remained in live code. | accepted-repaired | Updated `packages/studio-server/src/context.ts` and `packages/studio-server/src/router/index.ts` comments. | No |

## Cleared Watcher Checks

- No production `new Civ7DirectControlSession` outside the shared session owner
  and direct-control package wrapper.
- No live `RunInGameHttpError` symbol in current app/package code.
- No old satellite client/source files for `civ7ControlOrpcClient`,
  `recipeDag/client`, `studioServerClient`, `nodeWebBridge`, or `rpcPath`.
- No operation polling hook, daemon watchdog hook, live runtime poll delay, live
  status timer, or localStorage request-id bridge in current app/package source.
- Vite dev proxy is a single `/rpc` rule.
