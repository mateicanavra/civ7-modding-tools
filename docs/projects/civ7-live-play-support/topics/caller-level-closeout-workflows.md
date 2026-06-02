# Caller-Level Native Workflows

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
even when Civ7's official UI composes multiple native primitives behind the
scenes. The product target is not "operation plus closeout." It is one player
decision routed through the same game/UI state machines Civ7 uses itself.

This matters for blockers like tech, culture, narrative, traditions,
attributes, government, town focus, and production:

- The primary operation changes the selected tech, culture, policy, attribute,
  narrative branch, government, production, or focus.
- The official UI may also close a popup, display queue entry, notification,
  chooser target, or review surface.
- Those secondary primitives are command implementation details. If the caller
  has to remember them manually, the command surface is wrong.

## Current Bundled Workflows

Use these when the selected action should be handled as one native workflow:

- `game play traditions --player-id <id> --json`
  reads the current live active/unlocked/recent tradition packet, slot counts,
  activate/deactivate enum values, and per-tradition action hints before any
  mutation.
- `game play change-tradition --player-id <id> --tradition-type <type> --action <action> --send --closeout --reason '<why>'`
  sends `CHANGE_TRADITION` then `CONSIDER_ASSIGN_TRADITIONS`.
- `game play buy-attribute --player-id <id> --node <node> --send --closeout --reason '<why>'`
  sends `BUY_ATTRIBUTE_TREE_NODE` then `CONSIDER_ASSIGN_ATTRIBUTE`.
- `game play choose-tech --player-id <id> --node <node> --send --reason '<why>'`
  sends `SET_TECH_TREE_NODE` then `SET_TECH_TREE_TARGET_NODE`.
- `game play choose-culture --player-id <id> --node <node> --send --closeout --reason '<why>'`
  sends `SET_CULTURE_TREE_NODE` then `SET_CULTURE_TREE_TARGET_NODE`.
- `game play choose-government --player-id <id> --government-type <government-type> --action <activate> --send --reason '<why>'`
  sends `CHANGE_GOVERNMENT` with the exact government/action pair returned by
  `choose-government --options`.
- `game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why>'`
  sends `CHANGE_GROWTH_MODE` then `CONSIDER_TOWN_PROJECT`.

The standalone closeout commands still matter when no primary change is needed
or the primary change has already been applied. Treat them as diagnostics,
compatibility surfaces, or debt to fold into one forward command when the native
workflow is known:

- `game play consider-traditions`
- `game play consider-attributes`
- `game play consider-town-project`
- `game play set-tech-target`
- `game play set-culture-target`

## Norms

- Treat the bundled command as one caller-level operation and the runtime steps
  as implementation detail.
- Search official App UI modules, notification handlers, FireTuner/dev-tool
  resources, GameInfo/runtime APIs, and relevant community mods before adding
  repo-owned orchestration.
- Keep `--send` and `--reason` mandatory for mutation; the reason covers the
  selected workflow, not just the first runtime step.
- Validate and send native primitives in the same order the official UI uses
  for that player decision.
- Verification is command-internal proof of the repo-owned composition. It
  should surface a command-level failure when our composition did not advance
  the native state machine; it should not become a caller checklist.
- Keep category guidance advisory. The command gives the caller a safe
  workflow shape; it does not choose which tradition, attribute, or town focus
  is strategically correct.
- For traditions, use `game play traditions` before choosing an action. The
  official policy screen reads active/unlocked slots from the player `Culture`
  object and uses `PlayerOperationParameters.Activate` or `Deactivate`; a
  stale log-derived tradition id is not enough.

## Proof Boundary

Local tests prove the CLI emits the intended sequential operation families and
command-level postconditions. They do not prove every live Civ7 blocker state.
Live validation still depends on the current game state, runtime enum values,
and whether the native UI/game primitive sequence for that decision has been
correctly identified.
