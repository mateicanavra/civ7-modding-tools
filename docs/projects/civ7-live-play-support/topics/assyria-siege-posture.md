# Assyria Siege Posture

Status: `reference-with-gap`.

## Frame

Assyria should treat early conquest as a tempo engine, not a casualty trade.
The live play posture around turn 134 / 940 BCE has a friendly siege mass near
the independent city at `(13,17)`: Archers, Ballistas, Turtanu, melee screens,
and nearby Settler/city support. The first objective is to break that nearby
independent city cleanly, then decide whether the same formation can reform and
pressure Napoleon.

This topic is normative tactical guidance. It does not authorize a declaration,
move, attack, or capture by itself. Every concrete action still needs fresh
`ready-unit`, `front-summary`, `destination-analysis`, and `unit-target`
evidence.

## Tactical Norm

Use the independent city as the first conquest target when the front remains
coherent. Assyria's bonuses reward first-time settlement capture, so a nearby
city with a short land approach is a better tempo target than a long march or a
naval distraction.

Keep the formation intact:

- Ballistas and other siege units are the settlement breakers.
- Turtanu should remain close enough to keep the siege/melee group coherent.
- Archers should chip and cover, not become the front line.
- Melee/cavalry should screen relationship-proven contact and take capture
  opportunities only after defenders and fortified districts are weakened.
- Magarru can exploit mobility, but should not pull the army apart before the
  settlement is ready to fall.

If the destination lens reports high corridor or destination pressure, stage
and screen before entering the city pressure zone. Do not dribble individual
units into `(13,17)` just because a single `MOVE_TO` validates.

## Lens Requirements

The useful read-only lenses for this posture are:

- `front-summary --origin <front> --destination 13,17`: compose target, pressure,
  and next inspections before moving individual units.
- `battlefield-scan --origin <front> --radius 6`: identify nearby owner pressure,
  exposed civilians, and friendly formation shape.
- `destination-analysis --origin <unit-or-front> --destination 13,17`: check
  corridor and endpoint pressure before committing a move sequence.
- `unit-target --unit-id '<id>' --x <x> --y <y>`: validate each concrete attack
  or movement target.

Future tactical lenses should surface:

- siege envelope: which friendly siege/ranged units can pressure the city or
  fortified districts;
- safe fire: ranged targets plus retaliation and escape/hold risk;
- protector screen: melee/cavalry tiles that prevent contact with siege;
- capture path: the supported route into city/district capture, not just the
  current ready unit's immediate target;
- formation drift: distance between siege, commander, melee screen, ranged
  cover, and civilians after each move;
- next-war readiness: whether the same army can heal, reform, and reach French
  borders after the independent city falls.

## Current Live Reading

Fresh turn-134 scans from an origin around `(17,16)` showed:

- owner `9` independent city at `(13,17)` as the nearest concrete city target;
- the direct approach is land and short, roughly four grid tiles;
- friendly Ballistas and Archers already occupy nearby support positions;
- Napoleon units around `(17,18)` and `(14,19)` create contact risk;
- destination pressure is high enough that staging matters more than rushing a
  single unit forward.

The practical instruction is: preserve the siege formation, use ranged/siege
damage first when validators expose safe fire, keep screens between
relationship-proven threats and siege, and capture only after the city/fortified
district path is weakened.

## Provenance

- `.civ7/outputs/resources/DLC/assyria/modules/text/CivilizationText.xml`:
  Assyria gains a Technology when it captures a settlement for the first time;
  Codex economy later depends on Tupsharrutu rather than raw technology awards.
- `.civ7/outputs/resources/DLC/assyria/modules/data/civilizations-antiquity.xml`:
  Assyria is Scientific and Militaristic, with biases toward Magarru, Turtanu,
  Ballista, standing army, science/culture, and Dur-Sharrukin.
- `.civ7/outputs/resources/DLC/assyria/modules/data/units.xml` and
  `units-gameeffects.xml`: Magarru, Turtanu, and Ballista define the local
  conquest posture.
- `.civ7/outputs/resources/Base/modules/age-antiquity/data/units.xml`: Archer
  and Ballista movement/range/combat roles.
- `.civ7/outputs/resources/Base/modules/age-antiquity/text/en_us/TutorialText.xml`:
  siege units are appropriate against settlements but need protection.
- `.civ7/outputs/resources/Base/modules/base-standard/text/en_us/Civilopedia_Concepts_Text.xml`:
  city capture depends on defensible district health, walls, fortification, and
  pressure preventing repair.
