# Unit Move Preview

Status: `reference-with-gap`.

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
  `plots` and `turns`.
- `Units.getQueuedOperationDestination(unitId)` for existing queued movement.

The official right-click action order remains the target-action baseline:
naval, air, ranged, overrun, swap, then `MOVE_TO`.

## Proposed Command

```bash
bun packages/cli/bin/run.js game play unit-move-preview \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --include-paths \
  --include-post-move-actions \
  --json
```

Defaults should select the current head-selected unit, then first ready unit.

## Response Contract

The useful response shape is:

- `unitId`, `selectedUnitId`, `firstReadyUnitId`;
- unit summary with location, movement remaining, attacks remaining, damage;
- reachable movement plots;
- reachable zone-of-control plots;
- reachable target plots;
- queued destination, if any;
- per-destination path preview when requested;
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
