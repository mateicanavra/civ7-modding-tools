---
name: civ7-play-game
description: |
  Use in the Civ7 Modding Tools repo for "play Civ", "take a turn", "play through turn N", "what should I do this turn", "move this unit", "choose research", "set city production", "respond to diplomacy", "clear turn blockers", or "end the turn" in an already-running Civilization VII game. Uses the actor-facing game-play CLI and public Play capability, which consumes only the public controller client for typed native operations.
---

# Civ7 Play Game

## Purpose

Drive an already-running Civ7 game through actor-facing play operations: observe
the situation, check one choice, request it, reconcile the result, and choose
the next lawful action.

The ownership chain matters:

```text
terminal actor
  -> game-play CLI projection
  -> public play client
  -> actor-facing observation/check/request/reconciliation policy
  -> public controller client
  -> exact native fact or operation
  -> play-owned outcome and next action
  -> CLI projection
```

The CLI is self-describing. Candidate reads provide the exact component ids,
types, coordinates, and action descriptors needed by checks and requests. Echo
those values; never invent them.

## Use This For

- Playing one or more turns in a live session.
- Resolving research, culture, government, celebration, narrative, diplomacy,
  notification, unit, city, and turn decisions exposed by the play projection.
- Asking what to do next from the play-owned priority and planning views.
- Reconciling an uncertain action without repeating it.

## Non-Goals

- Launching Civ7, preparing setup, deploying mods, inspecting logs, or probing
  raw Tuner state. Use `civ7-operational-debugging` for those tasks.
- Map generation or Run in Game orchestration. Use
  `civ7-mapgen-workstream` and the MapGen-runs surface.
- Designing service, resource, provider, API, or CLI architecture.
- Bypassing a missing actor-facing command with raw execution.

## Establish The Current Command Surface

Run from the repo root:

```bash
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js game play --help
```

Then ask the selected leaf for `--help`. The source-of-truth command tree is
`plugins/cli/topics/game/src/commands/game`. The app supplies bound public
clients; commands do not select providers or construct live state.

Use the globally linked `civ7` executable only after the current `civ7-cli` Nx
project confirms and runs its link target.

## The Turn Loop

1. **Observe readiness.** Select the controller readiness read from native
   game help. Proceed only when its output admits observation and mutation for
   the live session.
2. **Read the situation.** Select the actor-facing situation view from native
   play help and follow its ranked decisions and next-action descriptors.
3. **Resolve actor choices.** Read available options, select one according to
   the live situation and `references/strategy.md`, validate the choice, then
   request it.
4. **Drain ready units.** Re-read each unit after an action. Use only named play
   commands and coordinates returned by fresh planning/movement reads.
5. **Resolve cities.** Choose production, worker placement, expansion, or town
   focus from the candidates returned by the fresh city view.
6. **Check turn completion.** Validate the end-turn request. Route each blocker
   back to its actor-facing module.
7. **Request turn completion.** Send only when the check is clear. Require the
   procedure's own postcondition or reconciliation result.
8. **Wait and re-observe.** Do not infer that the next turn is ready from
   elapsed time or command return alone.

See `references/turn-loop.md` for the operational playbook.

## Mutation Discipline

- Read -> choose -> check -> request -> reconcile.
- One mutation at a time.
- Preserve any operation or no-repeat key returned by play.
- Treat `refused`, `uncertain`, stale, partial, and unavailable as real outcomes.
- If dispatch may have occurred, follow the returned reconciliation/next-action
  guidance. Never repeat the mutation merely because confirmation is missing.
- Stop when the public actor-facing surface does not expose the required
  operation. Report the gap instead of reaching into the controller or
  the Tuner resource.

## Reference Map

| Reference | Open when |
| --- | --- |
| `references/turn-loop.md` | Running one complete observe/check/request/reconcile turn loop |
| `references/command-reference.md` | Discovering command families and applying read-to-action value flow |
| `references/setup-and-recovery.md` | The session is unavailable, not playable, not your turn, blocked, or uncertain |
| `references/strategy.md` | Choosing among lawful options without hard-coding patch-sensitive numbers |

## Invariants

<invariants>
<invariant name="play-owns-actor-meaning">Gameplay observation, checks, requests, reconciliation, no-repeat policy, and next-action meaning belong to Play, not the controller or CLI.</invariant>
<invariant name="play-consumes-public-controller">Play consumes only the public controller client. It never receives Tuner, window capture, provider state, transport, arbitrary JavaScript, or private controller source.</invariant>
<invariant name="discover-command-before-use">Confirm every command and flag from the current game topic and leaf help before use.</invariant>
<invariant name="never-invent-values">Echo ids, types, coordinates, actions, and operation keys from current reads. Never guess or hand-compute them.</invariant>
<invariant name="check-before-request">Validate a mutation before sending it unless the current procedure explicitly defines a single atomic request flow.</invariant>
<invariant name="reconcile-before-repeat">Uncertain dispatch is reconciled through fresh Play/controller facts before any retry.</invariant>
<invariant name="no-raw-bypass">A missing named play action is reported as a capability gap; raw execution is not a gameplay fallback.</invariant>
<invariant name="human-boundaries-hold">Stop at the requested turn, a requested consultation point, a twice-refused action, or an unresolved high-impact decision.</invariant>
</invariants>
