# Setup & Recovery

What to do when the game is not in a clean, playable, your-turn state. Default
disposition: **diagnose with reads, recover only what is safe, and STOP +
report rather than guess.** The human owns launching and saving the game.

**Contents:** [Readiness states](#readiness-states) · [Connection](#connection) ·
[Not your turn](#waiting-through-ai-turns) · [Blocked end-turn](#blocked-end-turn) ·
[Rejected action](#rejected-action) · [When to stop](#when-to-stop-and-report) ·
[Launching](#launching-out-of-scope)

## Readiness states

Gate every turn on `game status --json`. The `readiness` field:

| Readiness | Meaning | What you do |
|---|---|---|
| `app-ui-game` / in-game (playable) | A game is loaded and it is a live turn | Play (run the loop). |
| `begin-ready` | Setup complete, game not begun | STOP — ask the human to begin the game (or see Launching). |
| `loading` | Game is loading | Wait, re-poll `game status`. |
| `shell` | Main menu, no game | STOP — the human must start/load a game. |
| `tuner-ready` / no game | Tuner connected, nothing loaded | STOP — no game to play. |
| unavailable / unreachable | Civ7 not running or tuner socket closed | STOP — Civ7 is not running. |

Require `capability.canMutate:true` before sending any action. `canObserve` only
means you can read.

## Connection

- **`Error: Cannot find module '@oclif/core'`** (or similar) = the CLI's
  dependencies are not installed in this checkout/worktree. Run from a checkout
  where deps are installed, or install them first (`bun install`). The bin is a
  plain Node script (`#!/usr/bin/env node`); the global `civ7` link is stale, so
  always invoke `node packages/cli/bin/run.js`.
- The CLI talks to the FireTuner socket at `127.0.0.1:4318` by default. Civ7 must
  be **running** for the socket to be open.
- "tuner unreachable" / "status-unavailable" almost always means **Civ7 is not
  running**, not a bug. Do not retry forever — report it.
- `game health --json` gives a quick tuner + app readiness check.
- These are read-only diagnostics; deeper tuner/log debugging belongs to the
  `civ7-operational-debugging` skill.

## Waiting through AI turns

After `end-turn --send` returns `turn-advanced`, the other players take their
turns. To detect your next turn:

```bash
$CLI game play priorities --compact --json   # poll; look at decisionHud.turn + canEndTurn
```
- Poll every few seconds. When `decisionHud` shows a new `turn` and either
  decisions to make or `canEndTurn`, resume the loop at Step 2.
- Alternatively `game watch --json` streams state changes.
- If many polls pass with no change, run `game status --json` — the game may have
  paused, hit a modal, or transitioned Ages. If an **Age transition** screen is
  up, it may need a human/UI action; report it.

## Blocked end-turn

`end-turn --send` returned `turn-completion-blocked` (or `end-turn` validate lists
blockers):

1. Read the blockers from the `end-turn --json` validation or
   `game play notifications --json`.
2. Each blocker maps to a handler in `turn-loop.md` (unit to order, city to set,
   choice pending). Clear them.
3. Re-validate `end-turn --json`; send only when clear.
4. Never re-send `--send` against a known block — fix the cause first.

## Rejected action

A `--send` returned `verified:false` or an error:

1. Re-read the source view (`ready-unit`, `ready-city`, `choose-* --options`) —
   the candidate may have changed, be disabled, or need different inputs.
2. Confirm you echoed the ids/coords **exactly** as the read returned them
   (component-id JSON shape, integer types).
3. For operations, confirm the `{family, operationType}` is still in the entity's
   current `legalOperations`.
4. Retry **once** with corrected inputs. If it fails again → STOP and report
   (see below). Do not loop on a rejecting action.

## When to stop and report

Stop the loop and report to the human (with the relevant `--json` output) when:

- `game status` is not playable (shell/loading/begin-ready/unreachable).
- The same action is rejected twice after corrected inputs.
- A modal/Age-transition/crisis screen appears to need a UI action you cannot
  drive from the CLI.
- The human asked to be consulted on this kind of decision (e.g. declaring war,
  a major strategic fork).
- You reached the human's target turn.

Reporting honestly beats forcing a move. Quote the envelope; say what is blocking.

## Launching (out of scope)

This skill does **not** launch games — the human does. If the human explicitly
asks you to launch one, that path lives elsewhere:
`runCiv7SinglePlayerFromSetup` (from `@civ7/direct-control`) and the cold-boot
sequence are documented in the `civ7-operational-debugging` skill and the
project memory on launching/capturing a live map. Bring that in deliberately;
keep this skill focused on playing an already-running game.

[← Back to SKILL.md](../SKILL.md)
