# Turn Playbook

The detailed, deterministic version of the loop in SKILL.md. Commands assume
`CLI="node packages/cli/bin/run.js"` run from the repo root, and `--json` on
everything. Resolve *what to choose* with `strategy.md`; resolve *exact flags*
with `command-reference.md`.

**Contents:** [Loop](#the-loop) · [Triage by priority kind](#step-2-triage-by-priority-kind) ·
[Choice decisions](#step-3-choice-decisions) · [Units](#step-4-units-drain-ready-units) ·
[Found a city](#founding-a-city) · [Cities](#step-5-cities-set-production) ·
[End turn](#step-6-end-turn) · [Wait](#step-7-wait-for-your-turn) · [Success signals](#success-signals)

## The loop

```
status (playable?) -> priorities (triage) -> resolve choices
  -> drain ready units -> set city production -> end-turn validate
  -> clear blockers -> end-turn --send -> wait -> repeat
```

One mutation per step; confirm its postcondition before the next.

## Step 1 — Confirm playable

```bash
$CLI game status --json
```
Proceed only if `playable:true` and `capability.canMutate:true`. Otherwise →
`setup-and-recovery.md` (STOP and report; the human launches/advances).

## Step 2 — Triage by priority kind

```bash
$CLI game play priorities --compact --json
```
`decisionHud` tells you `turn`, `canEndTurn`, whether a `readyUnit`/`readyCity`
is waiting. Work `priorities[]` top-down. Map each `kind` to the handler:

| `priority.kind` / signal | Handler |
|---|---|
| research / tech choice pending | Step 3 → `choose-tech` |
| culture / civic choice pending | Step 3 → `choose-culture` |
| government / tradition / attribute available | Step 3 → `choose-government` / `change-tradition` / `buy-attribute` |
| narrative / era event | Step 3 → `choose-narrative` |
| celebration available | Step 3 → `choose-celebration` |
| diplomacy / first-meet request | Step 3 → `respond-diplomacy` / `respond-first-meet` |
| ready unit needs orders | Step 4 |
| city needs production / population to place | Step 5 |
| informational notifications piling up | `dismiss-notification-queue --send` (after reading) |
| `canEndTurn:true`, nothing pending | Step 6 |

If `priorities` is sparse, cross-check with `game play notifications --json`
(its `hud.decisionQueue[]` enumerates pending decisions with `requiredInputs`).

## Step 3 — Choice decisions

Pattern for every choice: **read options → pick → send → confirm.**

```bash
# Research (civics identical with choose-culture)
$CLI game play choose-tech --options --json          # -> enabledOptions[].nodeType + name
$CLI game play choose-tech --node <nodeType> --send --json   # confirm result.verified
```

- **Tech / civics:** pick per `strategy.md` (terrain-driven early; then steer to
  your Legacy Path). Use `set-tech-target`/`set-culture-target` to aim at a
  deeper node the game will auto-path toward.
- **Narrative:** echo all three of `{targetType, target, action}` from the
  chosen `enabledOptions[]` entry. Prefer the option whose `reward` matches your
  path; avoid options with a `cost` you cannot afford.
- **Government / tradition / attribute / celebration:** read options, choose per
  strategy, send. Spend attribute points into the tree matching your path.
- **Diplomacy / first-meet:** read `notifications`; the decision item carries the
  ids to echo into `respond-diplomacy` (`--action-id`, `--response-type`) or
  `respond-first-meet` (`--met-player-id`, `--response-type`/`--response`) — see
  `command-reference.md`. Default: accept friendly/neutral first-meets; do not
  declare war unless told to.

Re-run `priorities` after clearing choices to see what surfaced next.

## Step 4 — Units: drain ready units

Repeat until no unit is "ready" (idle). Each pass handles the
selected/first-ready unit:

```bash
$CLI game play ready-unit --json     # -> unitId, unit (type/pos/moves), legalOperations[]
```

Decide from `legalOperations` + unit role:

| Unit situation | Do |
|---|---|
| Scout / military with moves, map to explore | Move toward unexplored/objective: get a plot from `unit-move-preview --unit-id '…'`, then `unit-target --unit-id '…' --x <x> --y <y> --send`. |
| Settler / founder on/near a good site | [Found a city](#founding-a-city). |
| Military on a border, nothing to do | Fortify: echo the FORTIFY/`SKIP_TURN`-adjacent op from `legalOperations` into `game operation … --send`. |
| Unit genuinely has nothing useful | Skip: `game operation --family unit-operation --operation-type SKIP_TURN --unit-id '…' --send` (only if it appears in `legalOperations`). |
| Commander with units to pack/move | Use the pack/move op from `legalOperations`; see `strategy.md` → Commanders. |

After each `--send`, check the postcondition (`target-reached` good;
`path-shortfall` = multi-turn move in progress, fine). The same unit should no
longer appear ready on the next pass — that is how you avoid infinite loops.

### Founding a city

1. Find a site: `game play settlement-recommendations --json` → take a top
   suggestion's `location{x,y}` (or use the settler's current plot if it is
   already a recommended spot).
2. Move the settler there: `game play unit-target --unit-id '<settlerId>' --x
   <x> --y <y> --send --json`. If `path-shortfall`, the move continues next turn
   — end the turn and resume.
3. When the settler is **on** the target plot, found it:
   ```bash
   $CLI game play ready-unit --unit-id '<settlerId>' --json   # FOUND_CITY now in legalOperations
   $CLI game operation --family <family-from-legalOps> \
        --operation-type <FOUND_CITY-from-legalOps> \
        --unit-id '<settlerId>' --send --json
   ```
   The exact `family`/`operationType` come from that unit's `legalOperations`
   (founder units carry the `FoundCity` capability). Confirm `verified:true`.
   New settlements start as **Towns** — respect the settlement cap
   (`strategy.md`).

## Step 5 — Cities: set production

Repeat until no city is "blocking" (needs a production choice):

```bash
$CLI game play ready-city --compact --json   # -> cityId, productionCandidates[], townFocusOptions[], expansionCandidates[]
```

- **Pick production** from `productionCandidates[]` (each has `kind`, `type`,
  `name`, `cost`, `turns`, `valid`). Choose per `strategy.md` build order, then:
  ```bash
  $CLI game play build-production --city-id '<cityId>' --unit-type <type> --send --json
  # constructible: --constructible-type <type> [--x --y from placementPlots]
  # project:       --project-type <type>
  ```
- **Towns:** set focus once per Age from `townFocusOptions[]`:
  `set-town-focus --city-id '…' --growth-type <g> --project-type <p> --send`.
  Towns convert production to gold and feed food to connected cities — usually
  leave them on a growth/food/production focus and let them grow.
- **Place population / expand** when `populationPlacement`/`expansionCandidates`
  surface: `expand-city --city-id '…' --x --y --send` using a candidate plot.

## Step 6 — End turn

```bash
$CLI game play end-turn --json          # validate: enumerates blockers, shows canEndTurn
```
- If it lists blockers (units to order, cities to set, choices pending) → go back
  to the relevant step, clear them, re-validate.
- When clear:
  ```bash
  $CLI game play end-turn --send --json   # expect postcondition: turn-advanced
  ```
- `turn-completion-blocked` → something is still pending; read the blocker, do
  not re-send blindly.

## Step 7 — Wait for your turn

After `turn-advanced`, the AI players take their turns. Poll until it is yours
again:

```bash
$CLI game play priorities --compact --json   # until decisionHud shows your turn + decisions/canEndTurn
```
Poll every few seconds; if nothing changes for a long time, check `game status`
(see `setup-and-recovery.md`). Then return to Step 2 for the new turn.

## Success signals

| After | Good signal | Bad signal → do |
|---|---|---|
| any `--send` | `result.sent:true` + `verified:true` | `verified:false`/error → read validation, fix inputs, retry once |
| `unit-target --send` | `target-reached` or `path-shortfall` | `no-state-change` → unit blocked; pick another plot or skip |
| `build-production --send` | `verified:true` | invalid candidate → re-read `ready-city`, pick a `valid:true` candidate |
| `choose-tech/culture --send` | `verified:true` | re-read `--options`; node may be disabled now |
| `end-turn --send` | `turn-advanced` | `turn-completion-blocked` → handle blockers, re-validate |

[← Back to SKILL.md](../SKILL.md)
