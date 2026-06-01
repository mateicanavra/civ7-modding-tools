# Runtime State Sources

Status: `active-reference`.

## Frame

Use local disk and direct-control for different jobs:

- Direct-control/HUD is the live-state authority for blockers, selected
  entities, validators, and sends.
- Local SQLite/resource files are strong for static definitions, text,
  enrichment, and offline joins.
- Autosaves are useful forensic snapshots, but they are not a low-latency,
  documented live-state API.

This is why the support tools still poll the game UI/runtime directly. The
question is not whether SQLite exists on disk; it does, and the files are
readable. The question is whether it is the current game-state database with
stable live schemas and freshness semantics. Current evidence says the obvious
SQLite files are static/debug catalogs or forensic stores, not that live
contract.

## Why Not Just Read SQLite

The direct-control surface is still necessary because the live play question is
usually not "what does this ruleset contain?" It is "what is the player allowed
to do right now, against this selected city/unit/notification, after the last
animation or human click?"

SQLite is good at stable data. It can answer static and historical questions:
type names, localization, loaded catalog rows, known game-history rows, mod
inventory, and log-like summaries. It does not currently provide a proven live
contract for:

- active end-turn blocker type and notification id;
- selected or first-ready unit/city;
- current pending modal or notification decision surface;
- operation validators such as `canStart` and returned placement plots;
- before/after postconditions after a send;
- freshness while the game process is still mutating state.

That means local DB reads can reduce lookup cost, but they cannot replace the
runtime read that decides whether an action is legal and current.

## Local Evidence

Useful SQLite files found under `~/Library/Application Support/Civilization VII`:

- `Debug/gameplay-copy.sqlite`
- `Debug/frontend-copy.sqlite`
- `Debug/localization-copy.sqlite`
- `Debug/images-copy.sqlite`
- `Debug/colors-copy.sqlite`
- `Mods.sqlite`
- `LocalStorage.sqlite`
- `HallofFame.sqlite`

`Debug/gameplay-copy.sqlite` contains static game catalog tables such as
`Constructibles`, `Units`, `Notifications`, `TurnPhases`, and balancing tables.
It is useful for answering "what is this type/id?" and "what official
definition exists?" It does not expose the current turn's selected unit,
pending notification queue, city production blocker, or validator result as a
live, documented table set.

`HallofFame.sqlite` contains historical game and player tables such as `Games`,
`GamePlayers`, `GameObjects`, and data-point value tables. It can identify
played games and outcomes, but it is not a live turn-decision API: it does not
carry the current notification queue, selected entity, modal state, or validator
answers needed for safe play actions.

Autosaves and manual saves live under `Saves/**` and use `.Civ7Save`; those are
state snapshots, not a direct read model for the running process. They may lag
the active UI and require reverse engineering before they can support safe
agent decisions.

## Norm

For live play:

1. Use `game play notifications`, `game play ready-unit`, and targeted
   direct-control reads for current blockers and required inputs.
2. Use local SQLite copies for enrichment: names, categories, definitions,
   costs, text, and cross-reference joins.
3. Use validators before sends. A static DB row proves an item exists; it does
   not prove the current player/city/unit can choose it now.
4. Treat autosaves as forensic evidence until a stable parser and freshness
   contract exist.

The durable direction is hybrid: build more local definition indexes to reduce
expensive UI enumeration, while keeping the runtime HUD as the source of truth
for the current decision and its legal operation args. See
`local-catalog-enrichment.md` for the catalog/HUD split and candidate local
shortcuts.

## Materialized View Policy

The useful materialized view is not a replacement database. It is a short-lived
decision cache built from live runtime reads, then enriched with local catalogs.

| Field family | Source of truth | Cache use |
| --- | --- | --- |
| Current blocker, notification target, selected entity | Direct-control App UI/runtime read | Refresh on every decision loop and after every send |
| Legal operation args, `canStart` result, placement plots | Direct-control validators | Never reuse after a mutation or visible human input |
| Type names, costs, categories, localization | SQLite/resource catalogs | Cache freely with file mtime/version metadata |
| Logs and saves | Bounded forensic reads | Use for explanations, not current legality |

The notification HUD is the first version of this pattern. It reads live
blockers and required inputs, then presents the smallest useful "what decision
am I blocked on?" surface to the play agent. Future local data shortcuts should
feed that HUD with labels and explanations, not bypass it.
