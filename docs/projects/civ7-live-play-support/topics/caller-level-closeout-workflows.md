# Caller-Level Closeout Workflows

Status: `live-command-surface`.

Sources:

- `packages/cli/src/utils/game-play-shared.ts`
- `packages/cli/src/commands/game/play/change-tradition.ts`
- `packages/cli/src/commands/game/play/buy-attribute.ts`
- `packages/cli/src/commands/game/play/set-town-focus.ts`
- `packages/civ7-direct-control/src/index.ts`
- Live play support threads where progression and town-focus choices required
  a primary operation followed by a review closeout.

## Frame

The play agent should experience a selected choice as one caller-level action,
even when Civ7 requires multiple runtime operations behind the scenes. The
important distinction is not "one socket message"; it is "one player decision
with one approval reason, fresh validation, and explicit postcondition
accounting."

This matters for blockers like tech, culture, traditions, attributes, and town
focus:

- The primary operation changes the selected tech, culture, policy, attribute,
  or focus.
- The closeout operation tells the game that the review surface has been
  considered, or records the matching full-tree target node.
- If the caller has to remember both operations manually, it wastes turns and
  creates stale-state risk between steps.

## Current Bundled Workflows

Use these when the selected action and the closeout should be handled together:

- `game play traditions --player-id <id> --json`
  reads the current live active/unlocked/recent tradition packet, slot counts,
  activate/deactivate enum values, and per-tradition action hints before any
  mutation.
- `game play change-tradition --player-id <id> --tradition-type <type> --action <action> --send --closeout --reason '<why>'`
  sends `CHANGE_TRADITION` then `CONSIDER_ASSIGN_TRADITIONS`.
- `game play buy-attribute --player-id <id> --node <node> --send --closeout --reason '<why>'`
  sends `BUY_ATTRIBUTE_TREE_NODE` then `CONSIDER_ASSIGN_ATTRIBUTE`.
- `game play choose-tech --player-id <id> --node <node> --send --closeout --reason '<why>'`
  sends `SET_TECH_TREE_NODE` then `SET_TECH_TREE_TARGET_NODE`.
- `game play choose-culture --player-id <id> --node <node> --send --closeout --reason '<why>'`
  sends `SET_CULTURE_TREE_NODE` then `SET_CULTURE_TREE_TARGET_NODE`.
- `game play choose-government --player-id <id> --government-type <government-type> --action <activate> --send --reason '<why>'`
  sends `CHANGE_GOVERNMENT` with the exact government/action pair returned by
  `choose-government --options`.
- `game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why>'`
  sends `CHANGE_GROWTH_MODE` then `CONSIDER_TOWN_PROJECT`.

The standalone closeout commands still matter when no primary change is needed
or the primary change has already been applied:

- `game play consider-traditions`
- `game play consider-attributes`
- `game play consider-town-project`
- `game play set-tech-target`
- `game play set-culture-target`

## Norms

- Treat the bundled command as one caller-level operation and the runtime steps
  as implementation detail with visible evidence.
- Keep `--send` and `--reason` mandatory for mutation; the reason covers the
  selected workflow, not just the first runtime step.
- Validate and send steps in sequence. A closeout should not be sent before the
  selected primary operation in the same workflow.
- Re-read the HUD after a bundled workflow. The closeout may reveal another
  blocker, and a valid operation result does not prove the turn is clean.
- Keep category guidance advisory. The command gives the caller a safe
  workflow shape; it does not choose which tradition, attribute, or town focus
  is strategically correct.
- For traditions, use `game play traditions` before choosing an action. The
  official policy screen reads active/unlocked slots from the player `Culture`
  object and uses `PlayerOperationParameters.Activate` or `Deactivate`; a
  stale log-derived tradition id is not enough.

## Proof Boundary

Local tests prove the CLI emits the intended sequential operation families and
aggregates per-step verification. Live validation still depends on the current
game state, runtime enum values, and whether the closeout surface remains
available after the primary operation.
