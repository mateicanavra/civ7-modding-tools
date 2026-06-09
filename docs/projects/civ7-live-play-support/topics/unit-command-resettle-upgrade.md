# Unit Command Resettle And Upgrade

Status: `ready-with-postcondition-gap`.

## Frame

`COMMAND_UNITS` can expose `unit-command` actions that are not ordinary
`unit-operation` moves, holds, or attacks. Two live-play examples now matter for
the watcher support surface:

- `UNITCOMMAND_RESETTLE`: a population/Migrant command that joins an owned
  settlement district as population;
- `UNITCOMMAND_UPGRADE`: an eligible unit upgrade command that spends the
  required cost and changes the unit tier/type.

The important operational distinction is family selection. The friendlier
`--family unit` alias normalizes to `unit-operation`; these commands require
`--family unit-command` or a named wrapper that hard-codes the family.

## CLI Surface

For resettling a population unit after the live acquire-tile view has identified
the owned district target:

```bash
civ7 game play resettle-unit \
  --unit-id '{"owner":0,"id":1703951,"type":26}' \
  --x 17 \
  --y 25 \
  --json
```

For upgrading an eligible unit after the live ready-unit/action-panel read shows
`UNITCOMMAND_UPGRADE` as valid:

```bash
civ7 game play upgrade-unit \
  --unit-id '{"owner":0,"id":1769488,"type":26}' \
  --json
```

Both commands validate by default. Add `--send` only after the
ready-unit/acquire-tile evidence still matches.

The generic fallback remains:

```bash
civ7 game play operation \
  --family unit-command \
  --type UNITCOMMAND_UPGRADE \
  --unit-id '{"owner":0,"id":1769488,"type":26}' \
  --args '{}' \
  --json
```

## Official Evidence

Local official resources define both as `KIND_UNITCOMMAND` rows in
`.civ7/outputs/resources/Base/modules/base-standard/data/unit-commands.xml`.
`UNITCOMMAND_RESETTLE` is visible, active-primary, requires an ability, and uses
the `ABILITY_RESETTLE` name/description. `UNITCOMMAND_UPGRADE` is visible,
passive-primary, holds cycling, and uses the unit-upgrade name/description.

`ABILITY_RESETTLE` is assigned to `UNIT_CLASS_POPULATION` in
`.civ7/outputs/resources/Base/modules/base-standard/data/units.xml`, and the
ability row points back to `CommandType="UNITCOMMAND_RESETTLE"`.

The official resettle UI handler in
`.civ7/outputs/resources/Base/modules/base-standard/ui/unit-interact/unit-action-handlers.js`
switches to `INTERFACEMODE_ACQUIRE_TILE`. The acquire-tile commit path in
`.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-acquire-tile.js`
sends:

```js
Game.UnitCommands.sendRequest(context.UnitID, "UNITCOMMAND_RESETTLE", args);
```

where `args` contains `X` and `Y`.

The generic unit action panel validates unit commands through
`Game.UnitCommands.canStart(...)`. For non-target commands, including ordinary
upgrade, it sends `Game.UnitCommands.sendRequest(unit.id, command.CommandType,
parameters)`.

## Live Proof

The active play thread captured both operation shapes on 2026-06-01:

- Migrant resettle: `unit-command RESETTLE`, unit
  `{"owner":0,"id":1703951,"type":26}`, args `{ "X": 17, "Y": 25 }`, matching
  the official acquire-tile path.
- Warrior upgrade: `unit-command UPGRADE`, unit
  `{"owner":0,"id":1769488,"type":26}`, args `{}`, upgraded Warrior to
  Spearman, with a reported cost of `120 Gold`.

Proof label: `live-thread-exercised`. The operation family and argument shape
are proven enough for named wrapper commands. The remaining gap is richer
postcondition polling in the CLI result itself.

## Norms

- Start with `game play notifications --json` and `game play ready-unit --json`.
- Use `resettle-unit` only for a population/Migrant unit whose live command list
  exposes resettle and whose target plot is a current owned district/acquire-tile
  candidate.
- Use `upgrade-unit` only when the live unit command validator reports upgrade as
  valid. Failure reasons such as insufficient gold, missing resource access, or
  friendly-territory requirements are authoritative for the current unit.
- Use `--family unit-command`, not `--family unit`, when falling back to the
  generic operation command.
- Re-read after failed validation, visible human input, animation delay, turn
  advance, or any unit command send.
- Treat these commands as tactical/economic actions, not strategy selectors. The
  wrapper proves how to send, not when an upgrade or resettle is worth it.

## Postconditions

For `RESETTLE`, count success only after the unit disappears or changes state and
the destination settlement/population state changes as expected.

For `UPGRADE`, count success only after the unit type/tier/combat strength and
treasury/resource state reflect the upgrade.

`sendRequest` or validator success alone is not enough. This follows the same
live-play rule as target actions: transport proof is weaker than board-state
proof.

## Remaining Gaps

- Read-only acquire-tile cataloging should expose resettle candidate plots with
  coordinates and district/settlement labels.
- Upgrade support should expose cost, upgrade target unit, territory/resource
  requirements, and projected combat change before sending.
- Post-send polling should report the concrete unit and settlement/treasury
  changes rather than leaving the operator to inspect manually.
