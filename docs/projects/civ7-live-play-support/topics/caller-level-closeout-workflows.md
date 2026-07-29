# Caller-Level Native Workflows

Status: `live-command-surface`.

Sources:

- `plugins/cli/topics/game/src/commands/game/play/`
- `services/civ7-control/src/service/modules/progression/router/`
- `services/civ7-control/src/service/modules/city/router/town-focus.ts`
- `services/civ7-control/src/service/modules/government/router/choice.ts`
- `packages/civ7-direct-control/src/play/progression/`
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

The CLI is a thin client for the control service. Progression choice discovery
calls a service `options` procedure, dry runs call a service `check` procedure,
and explicit `--send` modes call a service `request` procedure. The CLI does
not sequence native primitives or derive a postcondition locally.

Use these when the selected action should be handled as one service-owned
native workflow:

- `game play traditions [--player-id <id>] --json`
  reads the selected player's live active/unlocked/recent tradition packet,
  defaulting to the ambient local player, before any mutation.
- `game play change-tradition --tradition-type <type> --action <activate|deactivate> [--send [--closeout]]`
  checks or requests the semantic tradition change. On a request only,
  `--closeout` asks the service to compose and observe the optional tradition
  review closeout.
- `game play buy-attribute --node <node> [--send [--closeout]]`
  checks or requests the attribute purchase. On a request only, `--closeout`
  asks the service to compose and observe the optional attribute review
  closeout.
- `game play choose-tech --node <node> --send`
  requests the complete technology chooser workflow. The service owns the
  native choice, the unconditional
  `SET_TECH_TREE_TARGET_NODE { ProgressionTreeNodeType: NO_NODE }` clear, and
  bounded progression/blocker observation.
- `game play choose-culture --node <node> --send`
  requests the same service-owned workflow for culture: native choice,
  unconditional `SET_CULTURE_TREE_TARGET_NODE {
  ProgressionTreeNodeType: NO_NODE }` clear, and bounded
  progression/blocker observation.
- `game play set-tech-target --node <node> --send` and
  `game play set-culture-target --node <node> --send`
  request deliberate full-tree targets. The service checks the target first,
  optionally performs the same-node choice, rechecks the target, then sends
  the target and observes the result.
- `game play choose-government --government-type <government-type> --send`
  requests the exact government choice through the government control service.
- `game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send`
  requests the selected town focus through the city control service.

The standalone closeout commands still matter when no primary change is needed
or the primary change has already been applied. They are explicit service
checks without `--send` and service requests with `--send`:

- `game play consider-traditions`
- `game play consider-attributes`
- `game play consider-town-project`

`game play set-tech-target` and `game play set-culture-target` are full-tree
planning commands, not standalone chooser closeouts.

## Norms

- Treat the bundled command as one caller-level operation and the runtime steps
  as implementation detail.
- Search official App UI modules, notification handlers, FireTuner/dev-tool
  resources, GameInfo/runtime APIs, and relevant community mods before adding
  repo-owned orchestration.
- Keep `--send` mandatory for mutation. The command result and postcondition
  cover the selected workflow, not just the first runtime dispatch. A `sent`
  value is dispatch evidence, not confirmation.
- Within progression commands, `--closeout` is optional only for
  `buy-attribute` and `change-tradition` requests. It requires `--send`, is
  never part of a check input, and asks the service to compose the review step.
- For tech and culture chooser requests, the service sequences the native
  choice followed by an unconditional runtime `NO_NODE` target clear. For a
  full-tree target request, it checks the target first, optionally performs the
  same-node choice, rechecks the target, and only then sends the target.
- The control service owns bounded state and blocker observation, semantic
  postcondition classification, and no-repeat guidance. The CLI renders that
  result; it does not perform its own postcondition verification.
- Do not treat successful native dispatch as workflow success while a matching
  chooser or review blocker remains live. Follow the service's semantic
  classification and `do-not-repeat` next step after any unverified outcome.
- Keep category guidance advisory. The command gives the caller a safe
  workflow shape; it does not choose which tradition, attribute, or town focus
  is strategically correct.
- For traditions, use `game play traditions` before choosing an action. The
  official policy screen reads active/unlocked slots from the player `Culture`
  object and uses `PlayerOperationParameters.Activate` or `Deactivate`; a
  stale log-derived tradition id is not enough.

## Proof Boundary

CLI tests prove command modes route to the intended service
`options`/`check`/`request` procedures and keep request-only inputs off checks.
Service behavior tests prove sequencing, bounded observation, semantic result
contracts, and no-repeat policy; direct-control tests prove the focused native
atoms. These local tests do not prove every live Civ7 blocker state. Live
validation still depends on the current game state, runtime enum values, and
whether the native game primitive sequence for that decision has been
correctly identified.
