# Unit Target Actions

Status: live-support topic.

## Frame

The unit-action problem is not just "which operation can validate." During turn
81, live tactical play saw validator-success requests that did not change the
Warrior or Galley state. For tactical play, the useful unit of proof is:

1. choose the target action through the same order the UI uses;
2. send only an accepted candidate;
3. poll the postcondition that would prove the action landed.

## Official Target Order

The right-click path in
`.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js`
routes a selected unit and target plot through this order:

1. `unit-operation UNITOPERATION_NAVAL_ATTACK` with `{ X, Y, Modifiers }`.
2. `unit-operation UNITOPERATION_AIR_ATTACK` with `{ X, Y, Modifiers }`.
3. `unit-operation UNITOPERATION_RANGE_ATTACK` with `{ X, Y, Modifiers }`
   when `Game.Combat.testAttackInto` says the attack is ranged.
4. `unit-command UNITCOMMAND_ARMY_OVERRUN` with `{ X, Y }`.
5. `unit-operation UNITOPERATION_SWAP_UNITS` with `{ X, Y }`.
6. `unit-operation MOVE_TO` with `{ X, Y, Modifiers }`.

The move modifiers are
`UnitOperationMoveModifiers.ATTACK +
UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION`.

There is no generic normal melee `UNITOPERATION_ATTACK` in the official path.
Melee attacks are usually `MOVE_TO` with attack modifiers into the target plot,
unless a special command such as overrun or commander/focused attack applies.

## Target Plots

Attack targets are plot coordinates, not target unit ids. The dedicated
interface modes build valid target sets from `canStart(...).Plots` and reject
clicks outside that set:

- `interface-mode-ranged-attack.js` sends
  `Game.UnitOperations.sendRequest(UnitID, UnitOperationTypes.RANGE_ATTACK,
  { X, Y })`.
- `interface-mode-naval-attack.js` sends
  `Game.UnitOperations.sendRequest(UnitID, "UNITOPERATION_NAVAL_ATTACK",
  { X, Y })`.
- `interface-mode-focused-attack-base.chunk.js` sends
  `Game.UnitCommands.sendRequest(UnitID, UNITCOMMAND_FOCUSED_ATTACK_*, { X, Y })`.
- `interface-mode-commander-attack.js` sends
  `Game.UnitCommands.sendRequest(UnitID, "UNITCOMMAND_COMMANDER_ATTACK",
  { X, Y })`.

For live play, prefer a candidate whose validator succeeds and whose returned
`Plots` includes the target plot when `Plots` is present. A validator success
without target membership is weak evidence.

## Postcondition Gate

Do not count request success as action success. After sending, poll for the
action-specific state change:

- Movement or retreat: unit `location`, origin/target `MapUnits`, movement
  remaining, and readiness changed.
- Ranged/naval attack: attacker `attacksRemaining` or movement changed, or the
  target plot unit list/damage changed.
- Swap: both units' locations changed.
- Overrun/focused/commander command: target plot units or relevant commander
  order state changed.

Immediate reads can race animations or queued pathing. Poll briefly before
declaring a no-op.

Two live caveats matter for interpretation:

- Adjacent enemy land targets can need the official war-confirmation route.
  `WorldInput.checkDeclareWarAt` calls
  `Players.get(unit.owner).Diplomacy.willMoveStartWar(...)` and then runs a
  post-declaration callback. The target shortcut does not prove that dialog
  path was satisfied, so a `MOVE_TO` candidate against a hostile plot is not
  enough without a postcondition.
- Naval reposition can validate through `MOVE_TO` while the UI tracks desired
  destination/path state separately from the unit summary we currently compare.
  Until the shortcut reads stable queued-destination fields, a naval
  `no-state-change` should be treated as unresolved evidence, not as a
  successful screen move.

## CLI Shortcut

`game play unit-target` is the play-facing shortcut for this family. It is
read-only by default and resolves the target through the official right-click
order:

```bash
civ7 game play unit-target \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --x 23 \
  --y 33 \
  --json
```

With `--send --reason`, it sends the selected candidate and returns before/after
unit and target-plot probes with a verification flag and a `verification`
object. If `verification.status` is `no-state-change`, the operation may have
validated and sent, but it should not be treated as a landed tactical action.
Re-read the HUD/ready unit and choose a different proof path instead of
repeating the same target blindly.

Useful interpretation:

- `verified`: at least one postcondition probe changed.
- `verification.unitChanged`: the acting unit changed location, movement,
  attacks, health, or another summarized field.
- `verification.targetUnitsChanged`: the target plot unit list changed.
- `verification.status == "no-state-change"`: validator and send plumbing
  succeeded, but the tactical board did not prove an effect.

## Tactical Norms

These are strategy heuristics, not operation proof:

- Preserve badly wounded Warriors unless the live combat preview shows a safe
  kill or favorable trade.
- Use Slingers to remove enemy ranged units that can finish wounded friendly
  units, then adjacent melee threats.
- Keep melee/body-blocking units in front of ranged units.
- Keep the Galley screening coastal access to the capital and town; do not chase
  if it opens a water approach.
- If a commander has no promotion points, keep it guarded and useful through
  radius/order positioning rather than exposing it.

Live combat preview and runtime probes override static heuristics.
