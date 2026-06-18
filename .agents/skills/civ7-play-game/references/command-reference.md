# Command Reference

Exact CLI surface for playing a live Civ7 game. Source of truth is the code in
`packages/cli/src/commands/game/**` and `packages/civ7-control-orpc`; if a flag
here ever disagrees with `… --help`, trust `--help`.

**Contents:** [Invocation](#invocation) · [Result envelope](#result-envelope) ·
[The ID-flow](#the-id-flow-reads--actions) · [Read commands](#read-commands) ·
[Action commands](#action-commands) · [Escape hatches](#escape-hatches-operation--gameinfo)

## Invocation

- Prefix every command with `node packages/cli/bin/run.js` from the repo root
  (the dir containing `packages/cli`). The global `civ7` alias is **stale**.
- Connection defaults to tuner `127.0.0.1:4318` (`DEFAULT_CIV7_TUNER_HOST/PORT`).
  **Omit `--host`/`--port`** unless told otherwise.
- Append **`--json`** to everything you parse.
- Global flags on every command: `--host`, `--port`, `--timeout-ms` (default
  10000 for `status`, 45000 for play commands), `--json`.
- Discover anything live: `… game play --help`, `… game play <cmd> --help`.

## Result envelope

Action/read commands wrap output as `{ ok: true, result|view: … }`. The compact
agent views (`--compact`) and validators carry a semantic envelope
(`civ7.semantic-cli-envelope.v1`) with these slots:

| Slot | Meaning |
|---|---|
| `scope` / `state` | What was inspected; the decision HUD (turn, readiness, `canEndTurn`, ready unit/city). |
| `blockers` | Things stopping turn-end or the chosen action. |
| `decisions` | Pending choices, each with a `nextAction`. |
| `actions` / `nextSteps` | Suggested next action descriptors: `{ kind, label, parameters, readOnly, sendsMutation }`. |
| `result` | `{ status, sent, classification, verified? }`. |
| `evidence` / `notes` | Provenance + caveats. |

**After a `--send`, read these:** `result.sent === true`, `result.verified === true`,
and the `postcondition`/`classification`. Known classifications: `turn-advanced`,
`turn-complete-sent`, `already-complete`, `turn-completion-blocked` (turn);
`target-reached`, `path-shortfall`, `unit-state-changed`, `no-state-change`
(unit move); `not-sent`, `sent-unverified`, `read-only` (generic). `nextStep.kind`
seen: `send-turn-complete`, `end-turn`, `choose-technology`, `target-technology`,
`choose-culture`, `choose-production`, `assign-worker`, `expand-city`,
`choose-narrative`, `do-not-repeat`.

## The ID-flow (reads → actions)

This is what makes play tractable: **read a candidate, echo its ids into the
action.** You never compute ids.

| Decision | Read (lists candidates) | Field(s) to echo | Action command |
|---|---|---|---|
| Research | `choose-tech --options --json` | `enabledOptions[].nodeType` | `choose-tech --node <nodeType> --send` |
| Civics | `choose-culture --options --json` | `enabledOptions[].nodeType` | `choose-culture --node <nodeType> --send` |
| Narrative/era event | `choose-narrative --options --json` | `enabledOptions[].{targetType,target,action}` | `choose-narrative --target-type … --target '…' --action … --send` |
| City production | `ready-city --compact --json` | `productionCandidates[].{kind,type}` (+ `placementPlots` for constructibles) | `build-production --city-id '…' --<unit\|constructible\|project>-type <type> [--x --y] --send` |
| Border/expand | `ready-city --json` | `expansionCandidates[].{x,y}` | `expand-city --city-id '…' --x <x> --y <y> --send` |
| Move a unit | `unit-move-preview` / `target-candidates` / `settlement-recommendations` | candidate plot `{x,y}` | `unit-target --unit-id '…' --x <x> --y <y> --send` |
| Found / fortify / skip / any op | `ready-unit --json` | `legalOperations[].{family,operationType}` + `unitId` | `operation --family <family> --operation-type <opType> --unit-id '…' --send` |
| Settle a Settler | `settlement-recommendations --json` (rank) → move → found | suggestion `location{x,y}`; then the found op from `legalOperations` | `unit-target` to the plot, then `operation` with the found op `{family,operationType}` |
| Diplomacy reply | `notifications --json` | `notification.decision` inputs (`action-id`, `response-type`) | `respond-diplomacy --action-id … --response-type … --send` |

Component ids (`unitId`, `cityId`) are JSON objects `{"owner":N,"id":N,"type":N}`
— pass them quoted exactly as the read returned them. `ready-unit`/`ready-city`
default to the **selected / first-ready** entity when you omit `--unit-id`/`--city-id`,
so draining works without enumerating ids yourself.

## Read commands

| Command | Key flags | Returns |
|---|---|---|
| `game status` | `--json` | `playable`, `readiness`, `capability.{canObserve,canMutate}`, `nextSteps`. Gate every turn on this. |
| `game play priorities` | `--compact --json` (use compact), `--radius N`, `--no-battlefield` | Ranked `priorities[]` (`priority,kind,summary,reason,nextAction`) + `decisionHud`. The per-turn brain. |
| `game play notifications` | `--max 25 --json` | Pending decision queue (`hud.decisionQueue[]`, `notifications[]`), `canEndTurn`, `blocker`, ready unit/city ids. |
| `game play notification-queue` | `--max 50 --json` | Raw notification list. |
| `game play ready-unit` | `--unit-id '…'` (opt), `--radius 2`, `--json` | Selected/first-ready unit: `unitId`, `unit` state, `legalOperations[]`, `nearby`. |
| `game play ready-city` | `--city-id '…'` (opt), `--compact --json` | Selected/blocking city: `cityId`, `productionCandidates[]`, `townFocusOptions[]`, `expansionCandidates[]`, `populationPlacement`. |
| `game play progress-dashboard` | `--player-id N`, `--compact --json` | Tech/culture progress, Legacy Path status, attribute points. |
| `game play settlement-recommendations` | `--x --y` (focus one settler), `--count 5`, `--json` | AI-ranked settle plots per settler/city origin, each with `location{x,y}` + `factors`. Read-only advice. |
| `game play unit-move-preview` | `--unit-id '…' --json` | Reachable/target plots for a unit. |
| `game play target-candidates` | `--unit-id '…' --json` | Attack/interaction target plots. |
| `game play battlefield-scan` | `--x --y --radius --json` | Nearby units/threats (planning heuristic). |
| `game play traditions` / `consider-traditions` | `--player-id N --json` | Active/available traditions + recommendations. |
| `game gameinfo <Table>` | `--lookup <TYPE>`, `--json` | Static GameInfo rows; resolves a TYPE name to its row/id. |
| `game catalog` | `--json` | Capability catalog (what the control layer can do), not enum lookup. |
| `game watch` | `--json` | Streams state changes (alternative to polling). |

## Action commands

All take `--send` to issue (else validate-only) and `--json`. Coordinates are
passed as separate `--x N --y N` integer flags (there is no `--pair` flag).

| Command | Required flags | Notes |
|---|---|---|
| `game play unit-target` | `--unit-id '…'`, `--x N`, `--y N` | Move/path a unit to a plot. Postcondition `target-reached` vs `path-shortfall`. |
| `game play resettle-unit` | `--unit-id '…'`, `--x N`, `--y N` | Resettle command (move-to-settle for eligible civilians). |
| `game play build-production` | `--city-id '…'`, exactly one of `--unit-type` / `--constructible-type` / `--project-type` | Add `--x --y` for placed constructibles (from `placementPlots`). |
| `game play expand-city` | `--city-id '…'`, `--x --y` | Claim/expand to a tile (from `expansionCandidates`). |
| `game play set-town-focus` | `--city-id '…'`, `--growth-type`, `--project-type` | Set a town's focus (once per Age); values from `townFocusOptions`. `--closeout` also runs CONSIDER_TOWN_PROJECT. |
| `game play choose-tech` | `--node <nodeType>` | `--options` to list first. `--player-id` for validation mode. |
| `game play set-tech-target` | `--node <nodeType>` | Queue a research target (path toward a far node). |
| `game play choose-culture` | `--node <nodeType>` | Civics; mirror of choose-tech. |
| `game play set-culture-target` | `--node` | Civics target. |
| `game play buy-attribute` | `--node` | Spend an attribute point into a leader tree. |
| `game play change-tradition` | `--tradition-type`, `--action` | Slot/unslot a Tradition. |
| `game play choose-government` | `--node` | Pick/change government. |
| `game play choose-narrative` | `--target-type`, `--target '…'`, `--action` | Era/narrative event choice. |
| `game play choose-celebration` | `--node` | Celebration bonus choice. |
| `game play respond-diplomacy` | `--action-id`, `--response-type` | Reply to a diplomatic action; `--notification-id` if present. |
| `game play respond-first-meet` | `--met-player-id`, one of `--response-type N` / `--response <str>` | First-contact response (`--player-id` is the local validating player). |
| `game play dismiss-notification-queue` | `--max 50 --max-dismissals 10` | Bulk-dismiss reviewed informational notifications. Fire-and-forget. |
| `game play end-turn` | (none) | Validate lists blockers; `--send` issues `sendTurnComplete()`. |

## Escape hatches: operation & gameinfo

**Any unit/city/player operation** not covered above (FOUND_CITY, FORTIFY,
SKIP_TURN, HEAL, …) goes through the generic validator:

```bash
node packages/cli/bin/run.js game operation \
  --family <unit-operation|unit-command|city-operation|city-command|player-operation> \
  --operation-type <ENUM_KEY> \
  --unit-id '{"owner":0,"id":65536,"type":26}'   # or --city-id / --player-id per family
  [--args '{…}'] --send --json
```

Get the exact `family` + `operationType` for the current entity from
`ready-unit`/`ready-city` `legalOperations[]` — they list only what is legal
right now. Validate first; `--send` only on a legal op; confirm `verified:true`.

**Resolve a name → id** (e.g. you know you want a Settler but need its UnitType):

```bash
node packages/cli/bin/run.js game gameinfo Units --lookup UNIT_SETTLER --json
```

Tables include `Units`, `Constructibles`, `Resources`, etc. Prefer echoing ids
from candidate reads; use `gameinfo` only when a read does not already give it.

[← Back to SKILL.md](../SKILL.md)
