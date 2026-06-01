# Civilian Route Triage

Status: `reference-with-gap`.

## Frame

Civilian units need a different tactical read than combat units. A Settler,
Migrant, or Merchant can have a legal `MOVE_TO` operation while the surrounding
board makes the move strategically expensive or tactically exposed. The point of
this topic is to keep the agent from treating settlement recommendations as
movement instructions.

Use this topic when a civilian is ready to move, when a settlement site is being
considered, or when a route crosses a live front.

## Read Stack

Start with live authority:

```bash
bun packages/cli/bin/run.js game play ready-unit --json
```

Then gather planning context:

```bash
bun packages/cli/bin/run.js game play settlement-recommendations \
  --x <civilian-x> \
  --y <civilian-y> \
  --json

bun packages/cli/bin/run.js game play battlefield-scan \
  --x <civilian-x> \
  --y <civilian-y> \
  --radius 5 \
  --json

bun packages/cli/bin/run.js game play destination-analysis \
  --from-x <civilian-x> \
  --from-y <civilian-y> \
  --to-x <candidate-x> \
  --to-y <candidate-y> \
  --json
```

Each read has a different job:

- `ready-unit` proves the current unit, location, and legal operation surface.
- `settlement-recommendations` ranks candidate sites from the official
  settlement lens, but does not prove movement, escort quality, or founding
  legality.
- `battlefield-scan` identifies local civilian exposure and nearby pressure.
- `destination-analysis` checks endpoint and corridor pressure for one
  candidate route, but still does not prove reachability.

## Decision Rule

Do not move a civilian just because the destination is recommended. Move only
after the exact endpoint still makes sense under current pressure and the live
unit state is fresh.

The normal outcomes are:

1. **Proceed with validation:** endpoint pressure is low, route pressure is
   low, and escort units are nearby enough to make the move plausible.
2. **Hold or wait:** recommendations are good but local/corridor pressure is
   high, the route has non-friendly contact, or the read is stale.
3. **Re-route:** the best official site is too exposed, but a nearer defensive
   staging point or alternate site has lower pressure.
4. **Inspect escort first:** the civilian is exposed and a nearby Warrior,
   Archer, Galley, or Commander decision should be resolved before moving it.

## Live Example

On turn 116, the live Settler at `(17,13)` had valid movement operations, and
the settlement lens recommended distant sites including `(26,9)`, `(27,30)`,
and `(23,38)`. A battlefield scan around `(17,13)` still reported
`civilian-risk`, with non-friendly naval pressure at `(15,13)`, another scout
near `(13,14)`, and the independent city front at `(13,17)`.

That combination means the recommendation is useful for planning, but weak as a
movement order. The next useful step is either to inspect/resolve escort units
or run `destination-analysis` for a specific near-term endpoint, then re-read
`ready-unit` before any send.

## Proof Boundary

This topic does not add a new validator. It composes existing read-only
surfaces so the agent can avoid civilian moves that are legal but poorly
supported.

The unresolved gaps are:

- no terrain-aware pathfinding;
- no unit-specific move-range endpoint list;
- no explicit escort scoring;
- visibility is still conservative and may include debug-visible pressure;
- founding legality is separate from route safety.
