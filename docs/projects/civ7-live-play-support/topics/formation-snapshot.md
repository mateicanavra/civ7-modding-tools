# Formation Snapshot

Status: `live-command-surface`.

## Frame

Ready-unit reads are too narrow when the unit is part of a formation, escort,
or screen. A valid move can still be strategically bad if it exposes a Settler,
breaks a siege line, or walks away from nearby pressure.

`game play formation-snapshot` is a read-only tactical lens for that gap. It
does not choose a strategy. It materializes the local shape around the current
ready unit or supplied origin:

- current ready unit and no-target operation count;
- nearby civilians that may need protection;
- friendly non-civilian units that are close enough to act as screens;
- other-owner units close enough to create contact around nearby civilians;
- battlefield POIs and next inspection commands.

## Command

```bash
civ7 game play formation-snapshot --json
civ7 game play formation-snapshot --x 20 --y 18 --radius 6 --json
```

Use the command when:

- a ready combat unit is near a Settler or other civilian;
- a front has multiple friendly units and isolated unit movement would be too
  local a view;
- the agent needs to decide whether to screen, hold, stabilize, or inspect a
  target action before moving.

## Output

The `formation` object has:

- `posture`: `screen-civilian`, `hold-ready-unit`, `stabilize-front`,
  `advance-with-validation`, or `inspect-ready-unit`;
- `headline`: compact count of civilians, local screens, and nearby
  other-owner contacts;
- `reasons`: proof strings from battlefield POIs and formation geometry;
- `civilians`: friendly civilian units in scan scope;
- `screens`: friendly non-civilian units within `--screen-radius` of a
  civilian;
- `otherOwnerContacts`: all other-owner units in scan scope;
- `nearbyContacts`: other-owner units within `--contact-radius` of a civilian;
- `threats`: deprecated compatibility alias for `nearbyContacts`; do not treat
  this field name as proof of hostility, war state, or danger by itself;
- `nextInspections`: commands to re-read priorities, battlefield, civilian
  route triage, and concrete `unit-target` validators.

## Norm

Treat `screen-civilian` as a hold/screen prompt, not as an automatic move. The
next action should be a concrete validator read:

```bash
civ7 game play unit-target \
  --unit-id '<ready-unit-id>' \
  --x <screen-or-contact-x> \
  --y <screen-or-contact-y> \
  --json
```

For Settler movement, pair the formation snapshot with:

```bash
civ7 game play civilian-route-triage --x <settler-x> --y <settler-y> --json
```

The formation snapshot answers "what would this unit leave exposed?" It does
not answer "which exact attack or movement path will succeed?"

## Proof Boundary

This command proves only a bounded runtime scan and derived local geometry.
Distances are cheap grid heuristics. Hidden-info policy follows
`battlefield-scan`. Operation legality and effect still require `unit-target`,
operation validation, and postcondition reads.

Other-owner contact is not relationship proof. Do not call a contact a threat,
enemy, hostile unit, opponent, or war target unless an official
relationship/team/diplomacy/war-state read or a concrete combat validator proves
that stronger label.
