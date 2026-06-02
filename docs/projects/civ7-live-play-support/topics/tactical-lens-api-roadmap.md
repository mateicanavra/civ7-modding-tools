# Tactical Lens API Roadmap

Status: `reference-with-gap`.

Sources:

- Live play support commands in this branch: `game play battlefield-scan`,
  `game play formation-snapshot`, `game play front-summary`,
  `game play destination-analysis`,
  `game play target-candidates`, `game play ready-unit`,
  `game play ready-city`, `game watch`, and `game play unit-target`.
- `@civ7/direct-control` runtime reads for map, player, city, unit,
  visibility, GameInfo, and operation validation.
- Official resources under `.civ7/outputs/resources`, especially AI schema,
  behavior trees, pseudo-yields, and age AI XML.
- RHQ AI MOD public Steam Workshop and changelog pages:
  `https://steamcommunity.com/sharedfiles/filedetails/?id=3507042742` and
  `https://steamcommunity.com/sharedfiles/filedetails/changelog/3507042742`.

## Frame

The active play agent needs wider tactical lenses, not a predefined strategy.
Individual ready-unit commands answer "what can this unit do now?" but campaign
play also needs to know what pressure, targets, routes, civilians, and fronts
surround that unit.

The tactical-lens layer should stay read-only by default. It should produce
cheap deterministic facts, scores, and inspection priorities that help the
agent decide which validator-backed action to inspect next. It should not move
units, declare war, choose a fixed strategy, or pretend to be the Civ7 pathing
engine.

This is the runtime counterpart to the RHQ/static-AI lane:

- RHQ-style mods change the loaded policy substrate for native AI and autoplay.
- Direct-control tactical lenses help the player-side runner read the current
  board, frame objectives, validate actions, and revise after postconditions.
- The evented decision-stream lane can make those lenses cheaper to consume by
  publishing semantic topic updates and latest views, but it must preserve the
  same read-only, freshness, and validator boundaries.

## Current Usable Lenses

Use these now during live play:

1. `game play priorities --json` materializes the current HUD, ready
   unit/city, and local battlefield POIs into ranked next inspections. Use it
   as the first broad read when a live state combines a HUD item and a ready
   entity.
2. `game watch --include-ready-unit --include-ready-city --jsonl`
   materializes the current blocker, next decision, ready unit/city, and
   freshness markers. `readyUnit.legalOperationScope` is `no-target`; zero
   no-target operations does not prove that plot movement or attack is
   impossible.
3. `game play battlefield-scan --origin <x,y> --radius <n> --json` describes
   local friendly and non-friendly units, cities, owner pressure, wounded
   friendlies, civilian exposure, and nearby fronts around an origin. The
   `--x <x> --y <y>` form remains available.
4. `game play formation-snapshot --x <x> --y <y> --json` composes a ready-unit
   origin with local civilians, friendly screens, non-friendly threats, and
   next inspections. Use it when the tactical question is whether a unit should
   screen, hold, or validate a concrete move around a civilian cluster.
5. `game play target-candidates --x <x> --y <y> --json` ranks opponent owners
   and known city targets from a formation origin.
6. `game play front-summary --origin <x,y> --destination <x,y> --json` composes
   target candidates, local pressure, and inferred or supplied endpoint pressure
   into a front posture and next-inspection list.
7. `game play destination-analysis --origin <x,y> --destination <x,y> --json`
   samples endpoint and corridor pressure with explicit pathing limits.
8. `game play civilian-route-triage --x <x> --y <y> --json` composes
   ready-unit, settlement recommendation, battlefield, and destination reads
   into a proof-labeled civilian movement triage.
9. `game play unit-target --unit-id '<id>' --x <x> --y <y> --json` remains the
   plot-action validator before any movement, ranged attack, naval attack,
   overrun, or swap send.

## Live Turn-117 Example

A fresh watcher read on June 1, 2026 showed turn 117 / 1280 BCE with a Warrior
at `(16,22)`. `game watch` reported `legalNoTargetOperationCount: 0`, but
`game play unit-target --unit-id '{"owner":0,"id":589830,"type":26}' --x 13 --y 17 --json`
validated `MOVE_TO`.

The wider lenses changed the interpretation:

- `battlefield-scan --x 16 --y 22 --radius 6` showed a strong friendly siege
  cluster, nearby Napoleon and independent units, and the independent city at
  `(13,17)`.
- `target-candidates --x 16 --y 22` showed owner `11` units as closer pressure,
  while owner `9` at `(13,17)` remained the nearest concrete city objective.
- `destination-analysis --from-x 16 --from-y 22 --to-x 13 --to-y 17` reported
  high endpoint pressure and high corridor contact.

The tactical conclusion is not "move directly to `(13,17)`." The conclusion is
"owner `9` remains the first conquest target, but the Warrior should be staged
or screened through fresh validators while Ballistas and Archers create the
attack posture."

## Candidate API/Command Families

The next layer should prioritize these read-only commands:

| Command | Inputs | Output | Why it matters |
| --- | --- | --- | --- |
| `game play priorities` | optional focus, player id, max entities | ranked current decisions, blockers, ready entities, threats, missing reads | Gives the agent one turn dashboard before moving through individual commands. |
| `game play actors` | player id, include units/cities/players, max items | bounded player/unit/city summaries with hidden-info label | Avoids ad hoc runtime scripts when choosing fronts or comparing opponents. |
| `game play proximity-scan` | center, radius, fields, player id | bounded plot/unit/city facts and counts around a point | Generalizes battlefield scans for non-combat terrain, resource, and city decisions. |
| `game play pressure-map` | bounds, player id, visible-only flag | pressure-by-plot summaries with contributors and assumptions | Helps front planning, civilian safety, and siege staging. |
| `game play route-analysis` | origin, destination, unit id, corridor width | hazards, unknowns, blockers, friendly screens, proof label | Separates route safety from exact Civ7 pathfinding. |
| `game play civilian-route` | civilian unit id, destination, radius | visible threats, safer alternatives, escort/context notes | Turns the civilian triage topic into a reusable read-only command. |
| `game play tactical-plan` | focus unit/city/bounds, turn horizon | status, actors, map window, legal-action probes, risks, missing inputs | Supports short-horizon runner dry runs without sending actions. |
| `game play stream` | topic filters, replay cursor, freshness policy | semantic events for blockers, ready entities, POIs, routes, validators, watcher health | Lets agents subscribe to derived tactical facts without manual reconciliation. |
| `game play view` | optional focus/topic filters | latest materialized decision view with source keys and freshness leases | Lets an agent read one current state cache instead of rerunning every lens. |

Names can change, but the command contracts should preserve the same split:
bounded read, explicit hidden-info policy, proof label, and no mutation.

## Proof Boundaries

- Map and unit summaries prove observed runtime facts for the sampled scope.
  They do not prove visibility-equivalent player knowledge unless paired with
  visibility filtering.
- Corridor and route analysis are cheap deterministic approximations until a
  native reachable-tile or path-cost API is proven.
- Operation validators prove only the specific operation/args pair they test.
  They do not prove tactical effect; postconditions still decide whether a
  sent action worked.
- Target rankings are planning support. They do not declare war, choose
  diplomacy, or authorize attacks.
- Static GameInfo and AI resources enrich the lens vocabulary but do not prove
  the current board or live legality.
- RHQ public claims are useful for vocabulary and A/B experiment design, not
  proof that the local game loaded RHQ or that live AI rows can be safely
  mutated.

## Design Norms

- Default to read-only outputs. Any mutation belongs in existing
  validator-backed command families with explicit `--send` and approval reason.
- Keep every scan bounded: radius, bounds, max plots, max entities, and omitted
  counts should be visible.
- Label hidden information. Prefer player-visible mode for play support and
  developer-diagnostic mode for debugging.
- Distinguish fact, score, and recommendation. Scores can rank inspection
  priority; recommendations should state the facts they depend on and their
  falsifier.
- Expire snapshots after mutation, turn advance, restart, human input, or a
  slow read that crosses the stale-risk threshold.
- Use official AI/resource concepts as comparison vocabulary, not as a reason
  to bypass live reads.

## Relationship To Strategy Runner

The strategy runner should first run in validate-only mode:

1. Rehydrate or watch the live HUD.
2. Build a tactical-priority read from blockers, ready entities, active fronts,
   target candidates, pressure, and civilian risk.
3. Propose actions with reasons and falsifiers.
4. Validate each candidate action.
5. Record what would be sent and what evidence is missing.

Only after the validate-only loop gives complete, fresh, validator-backed
decisions should a one-turn send loop be tested. Autoplay can advance clean
turns, but it should not be treated as a strategy API.

For multi-turn supervision, prefer an evented materialized view before a full
strategy runner. The runner should subscribe to `play.blocker`,
`play.ready-unit`, `play.ready-city`, `play.battlefield-poi`,
`play.civilian-route`, `play.validator`, and `play.postcondition` topics, then
propose actions from those fresh views. If the stream cannot replay into the
same latest view or cannot invalidate after sends, keep using direct snapshot
commands.

## Relationship Authority Criterion

Treat owner ids as insufficient for tactical threat labels. Current battlefield
and destination lenses reduce owner relation to friendly versus other; that is
safe only for neutral wording like `non-friendly`. Before any lens labels units
or cities as enemy, hostile, opponent, allied, neutral, suzerained, or
war-targeted, prove the relationship through official App UI, Tuner,
diplomacy, team, independent-power, or war-state APIs and include the proof
source in the response. This criterion should outrank queued-destination work
when an active tactical decision depends on whether a nearby owner is actually
a threat.

## Open Questions

- Is there a native API for reachable plots, movement costs, road/river/zone
  effects, or unit-specific path previews?
- Which relationship/team APIs can separate war enemies, hostile
  independents, neutral rivals, allies, and unmet owners?
- Should player-facing lenses default to visible-only, while support research
  commands require an explicit `--debug-omniscient` flag?
- What is the smallest `game play priorities` output that helps the active
  play agent without becoming an opaque strategy script?
- Can static AI profile mods and bounded autoplay telemetry provide a stable
  baseline for judging whether external runner choices are better than native
  autoplay?
- Does an evented watcher reducer materially reduce redundant reads and stale
  reconciliation, or is a latest-snapshot cache enough?
