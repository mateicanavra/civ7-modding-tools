# Unit Move Preview

Status: `implemented-read-lens-with-mutation-gap`.

## Frame

Single-tile action views are too narrow for military play. A human can see
movement reach, attackable targets, and path previews in the Civ7 UI before
committing a move. The play agent needs the same read-only lens: not just "what
can this unit do on the current plot?", but "where can it go this turn, what
path will that use, and what actions become available from those candidate
destinations?"

This should be a direct-control read lens, not a mutation helper.

## Official UI Evidence

The official UI uses runtime movement preview APIs:

- `Units.getReachableMovement(unitId)` for reachable movement plots.
- `Units.getReachableZonesOfControl(unitId, true)` for zone-of-control overlay.
- `Units.getReachableTargets(unitId)` for target overlay.
- `Units.getPathTo(unitId, destination)` for hover path preview, including
  `plots`, `turns`, and `obstacles` based on official UI usage.
- `Units.getQueuedOperationDestination(unitId)` for existing queued movement.

The official right-click action order remains the target-action baseline:
naval, air, ranged, overrun, swap, then `MOVE_TO`.

## Destination Queue Question

Movement preview and movement execution are not the same requirement. The
play agent needs both:

- current-turn move execution: send a move/target operation to a reachable
  destination and verify the unit's resulting location, movement, activity, or
  ready-queue state;
- queued multi-turn destination: set the same kind of future destination a
  human can set in the UI, then track the unit while it advances automatically
  across later turns.

`Units.getPathTo(unitId, destination)` and
`Units.getQueuedOperationDestination(unitId)` prove that the UI exposes path
preview and queued-destination state. See `unit-destination-queue.md` for the
current official-resource read: the UI appears to set long-distance destinations
through the same `MOVE_TO` operation, while reading queued path state through
`Units.getQueuedOperationDestination`; live direct-control smoke is still needed
before treating that as a proved mutating shortcut.

The proposed mutation should therefore stay provisional:

```bash
civ7 game play set-unit-destination \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --x 30 \
  --y 24 \
  --send \
  --reason "move toward the Napoleon front while avoiding the exposed city edge"
```

The read lens should expose `queuedDestination` and, when a unit has one, a
minimal in-motion HUD entry:

- unit id, type, location, movement, damage, and attacks;
- queued destination and path turns remaining when available;
- `risk: "unknown" | "none-detected" | "risk-detected"`;
- expandable risk reasons such as other-owner contact, wounded unit, exposed
  civilian, relationship-unproven city/contact zone, unseen/fogged path, or
  stale preview.

Do not label a contact as enemy or hostile from this lens alone. Those labels
need official relationship, war-state, team, diplomacy, or independent-power
evidence.

This warning is advisory. A queued destination does not keep the unit safe; it
only records intent and lets Civ7 continue movement later.

## CLI Surface

```bash
civ7 game play unit-move-preview \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --destination 30,24 \
  --json
```

Defaults should select the current head-selected unit, then first ready unit.
The command-surface design may later expose the same lens as:

```bash
civ7 game play unit preview move \
  --unit unit:next \
  --to 30,24 \
  --json
```

Keep the current flat command compatible until aliases and tests prove the
nested grammar.

This command is read-only. It exposes official preview facts:

- `reachableMovement` from `Units.getReachableMovement`;
- `reachableZonesOfControl` from `Units.getReachableZonesOfControl`;
- `reachableTargets` from `Units.getReachableTargets`;
- `queuedDestination` from `Units.getQueuedOperationDestination`;
- `queuedPath` and `requestedPath` from `Units.getPathTo`.

It also returns `relationshipPolicy`, because this lens does not prove whether
another owner is hostile, allied, neutral, suzerained, or a war target. Use
neutral labels such as `other-owner contact`, `non-friendly pressure`, or
`relationship-unproven` unless an official relationship API supplies that
proof.

The policy fields are intentionally explicit:

- `relationshipSource: "not-classified"`;
- `relationshipProof: "none"`;
- `unprovenLabel: "relationship-unproven"`.

## Response Contract

The useful response shape is:

- `unitId`, `selectedUnitId`, `firstReadyUnitId`;
- unit summary with location, movement remaining, attacks remaining, damage;
- reachable movement plots;
- reachable zone-of-control plots;
- reachable target plots;
- queued destination, if any;
- per-destination path preview when requested;
- normalized path shape: `plots`, per-step locations, `turns`, `obstacles`,
  and final ETA when available;
- per-destination target/action candidates when requested;
- confidence label: `runtime-preview` when backed by official preview APIs,
  `fallback-validator` when derived from bounded validator scans.

## Fallback

If a runtime state does not expose the official movement preview APIs, use a
bounded validator scan over nearby revealed plots and label the result
`fallback-validator`. That fallback proves validator legality for sampled
plots; it does not prove the same path, turn count, or UI preview a human sees.

## Boundary

Move preview is planning evidence. It does not reserve a path and does not
authorize a move. Before sending, the agent must re-read current unit state,
validate the chosen operation, send through direct-control, and inspect the
unit operation postcondition.

For queued multi-turn destinations, also re-read every turn. The command may
still be valid while the tactical situation has become unacceptable.
