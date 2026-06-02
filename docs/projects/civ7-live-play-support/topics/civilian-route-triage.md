# Civilian Route Triage

Status: `live-proved-read-surface`.

## Frame

Civilian units need a different tactical read than combat units. A Settler,
Migrant, or Merchant can have a legal `MOVE_TO` operation while the surrounding
board makes the move strategically expensive or tactically exposed. The point of
this topic is to keep the agent from treating settlement recommendations as
movement instructions.

Use this topic when a civilian is ready to move, when a settlement site is being
considered, or when a route crosses a live front.

## Read Stack

Start with the composed command:

```bash
civ7 game play civilian-route-triage --json
```

Use explicit origins and destinations when the decision is about a known
Settler position or candidate site:

```bash
civ7 game play civilian-route-triage \
  --x <civilian-x> \
  --y <civilian-y> \
  --to-x <candidate-x> \
  --to-y <candidate-y> \
  --json
```

The command composes the same underlying reads that were previously run by
hand:

```bash
civ7 game play ready-unit --json

civ7 game play settlement-recommendations \
  --x <civilian-x> \
  --y <civilian-y> \
  --json

civ7 game play battlefield-scan \
  --x <civilian-x> \
  --y <civilian-y> \
  --radius 5 \
  --json

civ7 game play destination-analysis \
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
- `civilian-route-triage` ranks those facts into one proof label:
  `proceed-with-validation`, `hold-or-screen`, `reroute-or-stage`, or
  `inspect-candidate`.

## Decision Rule

Do not move a civilian just because the destination is recommended. Move only
after the exact endpoint still makes sense under current pressure and the live
unit state is fresh.

The normal outcomes are:

1. **Proceed with validation:** endpoint pressure is low, route pressure is
   low, and escort units are nearby enough to make the move plausible.
2. **Hold or screen:** recommendations are good but local/corridor pressure is
   high, the route has non-friendly contact, or the read is stale.
3. **Reroute or stage:** the best official site is too exposed, but a nearer
   defensive staging point or alternate site has lower pressure.
4. **Inspect candidate:** the command did not have enough destination evidence;
   run settlement recommendations or destination analysis before moving.

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

On turn 121 / 1200 BCE, the live priority read showed a ready Settler
`{"owner":0,"id":1441800,"type":26}` at `(18,16)`, with nearby non-friendly
pressure around `(17,18)` and `(17,14)` and the La Venta city front still around
`(13,17)`. That is exactly the `hold-or-screen` case: a legal move is not the
same as a good route, and the next inspection should be battlefield pressure,
settlement recommendations, and destination analysis before `unit-target`.

## Proof Boundary

This command does not add a new validator. It composes existing read-only
surfaces so the agent can avoid civilian moves that are legal but poorly
supported.

The unresolved gaps are:

- no terrain-aware pathfinding;
- no unit-specific move-range endpoint list;
- no explicit escort scoring;
- visibility is still conservative and may include debug-visible pressure;
- founding legality is separate from route safety.
