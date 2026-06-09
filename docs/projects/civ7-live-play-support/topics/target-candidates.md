# Target Candidates

Status: `reference-with-gap`.

## Frame

When the play objective becomes military pressure, the agent needs a strategic
target shortlist before it moves individual units. A ready-unit read can say
what the selected Archer or Ballista can do now; it cannot explain whether the
army should stage toward an independent city, a nearby major civ, or a naval
front.

`game play target-candidates` is the first read-only materialization for that
question. It ranks other-owner contacts from a supplied formation origin using
live runtime city/unit summaries:

```bash
civ7 game play target-candidates \
  --x 18 \
  --y 20 \
  --json
```

The compact coordinate form is:

```bash
civ7 game play target-candidates \
  --origin 18,20 \
  --json
```

Use `--x/--y` from the current siege stack, Settler screen, or ready unit. If no
origin is supplied, the wrapper falls back to a small set of local combat-unit
and city locations, which is useful for broad orientation but weaker for an
active front decision.

## What It Reads

The target-candidates view returns:

- supplied or inferred origins;
- candidate owner id, leader/civilization probes, city count, and unit count;
- a bounded settlement list for that owner, with cheap grid distance, nearest
  origin, and water probe per city;
- nearest city to the origin and cheap grid distance;
- nearby unit summaries plus unit density and best-effort strength estimate
  near the nearest city;
- route hint such as `near-low-density`, `near`, `major-front`, or
  `longer-approach`;
- route kind such as `land`, `sea`, `mixed-or-coastal`, or
  `coastal-amphibious`, based on endpoint water probes and straight-line grid
  samples;
- reasons that explain the ranking.

The ranking is intentionally explainable rather than clever. It favors nearer
targets, lower nearby unit density, and lower apparent strength because those
are the facts an active agent can use while moving a siege stack over the next
few turns.

Treat `nearbyUnits` as the primary detail and `apparentStrength` as a rough
tie-breaker. Some runtime unit definitions do not expose clean combat fields
through the current read, so the score is less authoritative than unit type,
location, damage, and the later tactical validator.

Treat `approach.routeKind` as a planning label, not a pathing result. A `land`
label means the cheap sampled line did not cross water; `mixed-or-coastal`
means a land-to-land target has water in the sampled line and needs a more
careful route/corridor read; `sea` and `coastal-amphibious` indicate naval or
coastal context. Terrain, roads, rivers, relationship-unproven contact zones,
and embarkation legality still require follow-up reads and validators.

## Proof Boundary

This is planning support, not action authority.

- It does not declare war.
- It does not move units.
- It does not prove a path is passable.
- It does not prove a ranged or melee target is legal.
- It does not prove enemy, hostile, opponent, allied, neutral, suzerained, or
  war-target status.
- It may use runtime/debug city and unit summaries that include facts beyond
  normal UI visibility until paired with map/visibility reads.

The response includes `relationshipLabelPolicy.relationshipSource:
"not-classified"` and `relationshipProof: "none"` for non-player owners. Treat
the shortlist as owner/proximity planning evidence until official relationship,
team, diplomacy, independent-power, war-state, or operation-validator evidence
proves more.

After choosing a target, the agent still needs normal live-play discipline:
`game play ready-unit`, `game map` or `game visibility`, `game play
unit-target`, operation validation, and postcondition checks.

## Live Context

Turn 113 exposed the need for this surface. The active agent was told to look
around the map and choose a civ to attack based on distance, apparent strength,
and approach. A one-off runtime read found:

- practical first target: independent owner `9`, city around `(13,17)`, with a
  small visible unit cluster;
- later larger target: Napoleon/French Empire northwest around `(4,1)`, `(4,6)`,
  and `(8,4)`;
- operational posture: settle/found around `(16,15)`, mass Ballistas and ranged
  support, take the independent city first, then use it as staging pressure
  toward Napoleon.

The new shortcut turns that one-off map intelligence pattern into a reusable
read.

## Norms

- Run target-candidates before committing a multi-turn siege direction, not
  before every single unit action.
- Pass an explicit origin from the live front when possible.
- Treat independent or low-density nearby cities as staging targets, not
  automatically as final strategic goals.
- Pair the target shortlist with fresh tactical reads before moving units.
- Use the settlement list to understand whether the opponent is a one-city
  staging target or a distributed front.
- Use `approach.routeKind` to decide whether the next inspection should be
  land staging, naval staging, or a destination/corridor pressure read.
- Label hidden/debug facts in summaries and do not silently treat them as
  normal UI-visible knowledge.

## Remaining Gaps

- Visibility-filtered target ranking that mirrors official UI knowledge.
- Real terrain/pathing, river/coast passability, roads, zones of control, and
  embarkation legality in the route hint.
- Diplomacy and war-state context, including whether attacking the contact opens
  an unwanted major-civ front.
- Formation snapshot integration so the target ranking knows where Settlers,
  escorts, Ballistas, and wounded units currently are.
