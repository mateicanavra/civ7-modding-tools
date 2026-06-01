# Early War Tactical Stale-State Guard

Live Civ7 control has two coupled risks during war turns: poor tactics and
stale state. Treat the control problem as a verification loop first, then make
the tactical choice from the fresh state.

## Frame

Validator success proves the operation path is accepted, not that the board
changed. A unit can move, lose attacks, become damaged, or see its target vanish
between the read and the send. The tactical frame is therefore:

1. Read the current ready unit, health, location, movement, attacks, nearby
   occupied plots, and active notifications.
2. Choose from the current board only.
3. Send one validated action.
4. Re-read the unit and target plot before deciding the next action.

## Norms

- Use ranged attacks before melee when a Slinger, Archer, or other ranged unit
  has a current valid shot. Local tutorial text explicitly teaches ranged-first
  softening before melee commitment.
- Preserve wounded melee unless the attack gives a safe kill, prevents city
  loss, blocks capture pressure, or protects a ranged unit.
- Keep melee units between enemies and ranged/support units. The local
  Civilopedia calls melee-front/ranged-back a core formation pattern.
- Do not chase stale coordinates. If a target plot is empty or the unit's
  damage/location/attacks changed before the resolver ran, discard the old plan.
- Treat naval actions as especially postcondition-sensitive. Antiquity Galleys
  and Quadriremes are range-1 naval units in local data, so a validator-accepted
  naval target that produces no state change should not be repeated blindly.
- Accept harmless diplomacy by default when it costs no Influence. Support only
  when the influence spend has a clear payoff; preserve influence for war
  support, Independent Power actions, or rejecting harmful proposals.

## Tactical Checklist

Before a unit mutation:

```bash
bun packages/cli/bin/run.js game play notifications --json
bun packages/cli/bin/run.js game play ready-unit --json
```

For a concrete plot target:

```bash
bun packages/cli/bin/run.js game play unit-target \
  --unit-id '<current ready unit ComponentID>' \
  --x <current target x> \
  --y <current target y> \
  --json
```

Only send if the resolver's before-state still matches the intended unit and
target. After sending, require proof from location, movement, attacks remaining,
target plot occupancy, or target damage. When `game play unit-target --send`
returns `verification.status == "no-state-change"`, treat the action as
unresolved: re-read the board and do not repeat the same target unless a fresh
read proves the first send was merely delayed.

## Evidence

- Local tutorial: ranged units attack from more than one tile away, defenders do
  not retaliate, and ranged units should weaken enemies before melee. Source:
  `.civ7/outputs/resources/Base/modules/age-antiquity/text/en_us/TutorialText.xml`.
- Local Civilopedia: combat decisions depend on HP, combat strength, ranged
  strength, range, movement, sight, and bombard; it recommends melee in front of
  ranged units. Source:
  `.civ7/outputs/resources/Base/modules/base-standard/text/en_us/Civilopedia_Concepts_Text.xml`.
- Local Antiquity units: Warrior has melee combat 20; Slinger has range 2;
  Galley and Quadrireme have range 1. Source:
  `.civ7/outputs/resources/Base/modules/age-antiquity/data/units.xml`.
- Official combat diary: Civ7 combat emphasizes positioning, unit roles,
  settlement defense, commanders, and tactical combat context. Source:
  <https://civilization.2k.com/civ-vii/game-guide/dev-diary/combat/>.
- Official diplomacy diary: Influence is the diplomatic spend resource; support,
  accept, and reject choices should be weighed against other influence demands.
  Source:
  <https://civilization.2k.com/civ-vii/game-guide/dev-diary/diplomacy-influence-trade/>.

## Proof Boundary

This topic is strategic guidance, not a board solver. Exact coordinates, target
IDs, and diplomacy action IDs must come from the live App UI and Tuner reads.
Official web diaries are useful framing references, but local installed
resources and live runtime state override them for the running game.

## Shortcut Candidates

- `game play tactical-snapshot --around '<settlement-or-plot>' --radius <n>`
- `game play combat-dry-run --attacker '<unit-id>' --target <x,y>`
- `game play stale-guard --unit '<unit-id>' --expect movement-or-attack-change`
- `game play diplomacy-options --action-id <id> --include-response-costs`
