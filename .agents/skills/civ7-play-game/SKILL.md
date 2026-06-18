---
name: civ7-play-game
description: |
  Use in the Civ7 Modding Tools repo to PLAY a live Civilization VII game turn-by-turn through the `civ7` CLI (`node packages/cli/bin/run.js game ...`) and the FireTuner control surface — reading game state and issuing unit, city, research, civic, diplomacy, and end-turn actions. Trigger phrases include "play Civ", "play the game", "take a turn", "play through to turn N", "end the turn", "move this unit", "found a city", "set city production", "choose research", "respond to the notification", "what should I do this turn", and "drive a live Civ7 game". Do NOT use for designing/refactoring the control surfaces themselves (use civ7-orpc-control-architecture), for map generation (use civ7-mapgen-workstream), or for build/deploy/log debugging (use civ7-operational-debugging).
---

# Civ7 Play Game

## Purpose

Drive a live, already-running Civilization VII game from the CLI: read what
needs a decision, issue the action, confirm it landed, and end the turn — then
repeat. This skill makes turn-by-turn play reliable for a small agent by leaning
on one fact: **the CLI is self-describing.** Read commands hand you the exact
IDs and parameters to feed back into action commands. You never invent IDs,
hashes, or coordinates — you echo what the reads surface.

## When To Use

- The human has launched a Civ7 game and asks you to play, take a turn, or play
  through to some turn number.
- Any single in-game action: move a unit, found a city, set production, pick
  research/civics, respond to a notification/diplomacy, end the turn.
- Deciding "what should I do this turn?" against the game's own priority view.

## Non-Goals

- **You do not launch or save the game.** The human owns starting Civ7 and
  reaching a playable in-game state. If it is not playable, stop and report
  (see `references/setup-and-recovery.md`).
- Not for designing the oRPC/CLI control surfaces (use
  `civ7-orpc-control-architecture`), map generation (`civ7-mapgen-workstream`),
  or log/build/deploy debugging (`civ7-operational-debugging`).
- Do not store game/session state, save logs, or move history in this skill.

## How It Works (read this once)

- **One CLI, one prefix.** Every command is `node packages/cli/bin/run.js game …`
  run from the repo root. The global `civ7` alias is stale — always use the node
  bin path. Connection defaults to the tuner at `127.0.0.1:4318`; **no host/port
  flags are needed.**
- **Always pass `--json`** so you parse structured output, not prose.
- **Reads → Actions.** Read commands (`priorities`, `ready-unit`,
  `ready-city`, `choose-tech --options`, …) return candidate actions with their
  exact parameters and IDs. Action commands (`unit-target`, `build-production`,
  `choose-tech`, `end-turn`, `operation`, …) take those same parameters back.
- **Validate, then `--send`.** Action commands run as a dry-run validation by
  default; add `--send` to actually issue. After sending, read the result
  envelope's `postcondition`/`verified` to confirm it landed.
- **`legalOperations` is the key.** `ready-unit`/`ready-city` list legal
  `{family, operationType}` pairs. Anything without a dedicated command (founding
  a city, fortify, skip) is issued by echoing that pair into `game operation`.

## The Turn Loop (core procedure)

Run this loop once per turn. Full decision tables, command syntax, and the
founding/movement/production procedures live in the references — open them.

1. **Confirm playable.** `game status --json`. Require `playable:true` and a
   readiness that allows mutation. If not → STOP, report, do not fabricate
   (`references/setup-and-recovery.md`).
2. **Triage.** `game play priorities --compact --json`. Read `decisionHud`
   (turn, `canEndTurn`, `readyUnit`, `readyCity`) and the ranked `priorities[]`;
   each carries a `nextAction` telling you what to do next. Work the list
   top-down.
3. **Resolve choice decisions** (research, civics, government, narrative,
   celebration, attribute points, diplomacy/first-meet). For each: run the
   `… --options --json` read to list candidates, pick one per
   `references/strategy.md`, then send the matching `choose-*`/`respond-*`
   command. Confirm the postcondition.
4. **Order every ready unit.** Drain `game play ready-unit --json` one unit at a
   time until none remain idle: move, found, fortify, or skip. See
   `references/turn-loop.md` → "Units".
5. **Set production for every city/town.** Drain `game play ready-city --compact
   --json`: pick from `productionCandidates`, send `build-production`; set
   `set-town-focus` once per town. See `references/turn-loop.md` → "Cities".
6. **End turn.** `game play end-turn --json` (validate — it lists remaining
   blockers). If blockers remain, handle them (back to step 3) and re-validate.
   When clear: `game play end-turn --send --json`; require postcondition
   `turn-advanced`.
7. **Wait for your next turn.** Poll `game play priorities --compact --json`
   until it is your turn again with decisions/`canEndTurn`. Then go to step 2.

Stop the loop when you reach the human's target turn, hit a decision they asked
to be consulted on, or an action keeps failing (see Invariants).

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Turn playbook | `references/turn-loop.md` | Running the loop: per-`kind` decision tables, founding a city, moving units, production, draining ready entities, success signals |
| Command reference | `references/command-reference.md` | Exact flags for any command, the result envelope, the read→action ID-flow, `game operation`/`gameinfo` escape hatches, name↔id lookup |
| Strategy | `references/strategy.md` | Deciding *what* to choose: ages, Legacy Paths, settlements, yields, units, early-game build/research order, default policy, pitfalls |
| Setup & recovery | `references/setup-and-recovery.md` | Game not playable, tuner unreachable, blocked end-turn, rejected action, readiness states, waiting through AI turns |

## Core Invariants

<invariants>
<invariant name="playable-before-acting">Confirm `game status --json` shows `playable:true` and a mutation-capable readiness before any action. If it shows shell/loading/unreachable, STOP and report — the human owns launching and advancing past non-playable states.</invariant>
<invariant name="cli-is-source-of-truth">The live CLI output is authoritative over anything written here. Trust each read's `nextAction`, `legalOperations`, and candidate IDs. When unsure of a command's shape, run `node packages/cli/bin/run.js game play <cmd> --help`.</invariant>
<invariant name="never-invent-ids">Never hand-compute or guess a type id, component id, hash, node, or coordinate. Echo IDs and parameters straight from the read that surfaced them. Resolve a name to an id only via `game gameinfo <Table> --lookup <TYPE> --json`.</invariant>
<invariant name="read-coords-never-guess">Movement and placement coordinates come from candidate reads (`unit-move-preview`, `target-candidates`, `settlement-recommendations`, `ready-city` placement/expansion candidates) — never from a guess about the map.</invariant>
<invariant name="validate-then-send">Issue mutations by validating first (no `--send`, or read the validation block), then `--send` only when validation/`legalOperations` confirm legality. After sending, read `postcondition`/`verified` to confirm; do not assume success.</invariant>
<invariant name="drain-then-end">Resolve all choice decisions, give every ready unit an order, and set production for every city before `end-turn --send`. Use `end-turn` (validate) to enumerate remaining blockers; clear them, then send.</invariant>
<invariant name="stop-on-repeated-rejection">If the same action is rejected twice, or the game state is ambiguous/irrecoverable, STOP and report with the envelope output. Do not spam `--send` against a blocked engine.</invariant>
</invariants>

## Anti-Patterns To Avoid

- Guessing coordinates or type ids, or hand-computing engine hashes.
- Sending an action without checking its validation or postcondition.
- Ending the turn with idle units or cities building nothing.
- Treating "the command returned" as "my turn" — check `canEndTurn`/`decisionHud`.
- Re-sending `--send` while blocked instead of reading the blocker.
- Playing legal-but-pointless moves: ignore the Legacy Path / strategy layer and
  the game goes nowhere. Pick a path early and steer toward its milestones.
- Recording turn-by-turn state or save logs in this skill.

## Quick Start

```bash
cd <repo-root>            # contains packages/cli
CLI="node packages/cli/bin/run.js"

$CLI game status --json                          # 1. playable?
$CLI game play priorities --compact --json       # 2. what needs deciding?
# 3-5. resolve choices, order units, set production (see references/turn-loop.md)
$CLI game play end-turn --json                   # 6. validate (lists blockers)
$CLI game play end-turn --send --json            #    send when clear -> "turn-advanced"
```

Default play stance when no human steering is given: pursue the **Science**
Legacy Path, expand to the settlement cap (not past it), keep every unit and
city productive, and spend Influence/Gold/Attribute points rather than hoarding.
Details in `references/strategy.md`.
