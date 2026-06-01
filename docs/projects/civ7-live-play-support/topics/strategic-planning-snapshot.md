# Strategic Planning Snapshot

Status: `reference-with-gap`.

## Frame

The play agent needs a planning surface that looks past the immediate blocker
without becoming a second mutation authority. The right unit is a read-only,
5-10 turn snapshot: enough context to choose objectives and tradeoffs,
short-lived enough that the agent will re-read live state before acting.

The snapshot should answer four questions:

- What must be resolved before the turn can move?
- What is our current strategic posture: settlements, units, production, and
  visible threats?
- How do met rivals compare on public or UI-equivalent signals?
- Which legacy, victory, or triumph lane is currently plausible, and what would
  falsify that lane over the next few turns?

It should not tell the agent to send operations directly. Every mutation still
flows through `game play notifications`, ready views, validators, and
postconditions.

## Contract

A future `game play strategic-snapshot --json` shortcut should compose only
read-only surfaces:

- live turn/date, local player id, blocker, HUD decision queue, selected city,
  selected unit, and first ready unit;
- ready-unit view when a ready unit exists, including legal operations and
  nearby occupied plots;
- ready-city view when a city/town blocker is present or selected;
- local-player city and unit summaries, with counts split by settlement,
  civilian, combat, ranged, naval, commander, and wounded-state categories when
  available;
- settlement count, settlement cap, and nearby settlement recommendations if
  the official UI-equivalent recommendation API is available for the current
  player or settler;
- met major players, public score/legacy progress rows, diplomacy-visible
  relationship hints, and visible rival settlement/unit counts;
- enabled legacy path definitions, current path scores, final milestone
  thresholds, and historical legacy points exposed by the official victory UI
  model;
- stale-risk markers: restart/reconnect mismatch, long poll latency, human
  visible input since the snapshot, mutation since read, or turn advance.

Hidden information must stay scoped. The default snapshot should mirror
official UI visibility: local player, met players, humans, and visible map
facts. Developer/debug flags can expose more, but they must label the result as
debug-only so planning advice does not quietly become omniscient.

## Existing Surfaces

The CLI already exposes most building blocks:

```bash
bun packages/cli/bin/run.js game play rehydrate --json
bun packages/cli/bin/run.js game play notifications --json
bun packages/cli/bin/run.js game play ready-unit --json
bun packages/cli/bin/run.js game play ready-city --json
bun packages/cli/bin/run.js game status --json
bun packages/cli/bin/run.js game map --summary --json
bun packages/cli/bin/run.js game visibility --player-id 0 --bounds x,y,w,h --json
bun packages/cli/bin/run.js game play target-candidates --x <front-x> --y <front-y> --json
bun packages/cli/bin/run.js game play battlefield-scan --x <front-x> --y <front-y> --radius 8 --json
bun packages/cli/bin/run.js game play destination-analysis --from-x <unit-x> --from-y <unit-y> --to-x <x> --to-y <y> --json
bun packages/cli/bin/run.js game gameinfo --table LegacyPaths --json
```

Direct-control already has read wrappers for map summary, plot/grid snapshots,
player summaries, unit summaries, city summaries, visibility summaries,
GameInfo rows, notifications, ready-unit, ready-city, target candidates,
battlefield scan, destination analysis, and restart rehydration. Those are
sufficient for a first planning snapshot around the local player and visible
board. The missing first-class pieces are a terrain-aware path/front read, a
victory/legacy progress read, and a diplomacy/relationship read shaped like the
official UI.

## Official Evidence

The official victory manager reads `Game.VictoryManager.getVictories()` and
`getVictoryProgress()`, collects major alive players, filters public rival data
to met players, the local player, or human players, and reads each player's
legacy score with `player.LegacyPaths?.getScore(...)`. It also computes final
milestone thresholds from `GameInfo.AgeProgressionMilestones` and score rows
from historical legacy points.

The victory-points model sorts the processed score data by total age score and
groups teams for display. That makes it the right model for "compare us to met
civs" context, not for hidden tactical knowledge.

The local yield banner reads `player.Stats.numSettlements` and updates on
settlement-cap changes. Settlement recommendations call
`player.AI?.getBestSettleLocationsForSettler(...)` from the official lens,
which is useful for planning only when scoped to our player and current
settler-visible context.

The age-specific `victories.xml` files define legacy-path scoring,
requirements, AI strategies, strategy conditions, and strategy priority lists.
In Antiquity, for example, the expansion strategy is tied to the military
legacy path and biases standing army, exploration, new-city value,
settlement-cap increase, production, and military tags. These rows are static
context for why a plan might prioritize expansion or defense; they do not prove
current action legality.

## Static Victory And Legacy Signals

Use official XML as the rules/threshold layer and direct-control as the current
state layer. The static rows can explain what progress is valuable over the
next few turns, but they cannot prove our current score, relationship state, or
legal operation.

Useful static anchors:

- Legacy classes split into Culture, Economic, Military, and Science across
  `Base/modules/base-standard/data/gameplay.xml` and each age's
  `data/gameplay.xml`.
- Age victory rows live in:
  `.civ7/outputs/resources/Base/modules/age-antiquity/data/victories.xml`,
  `.civ7/outputs/resources/Base/modules/age-exploration/data/victories.xml`,
  and `.civ7/outputs/resources/Base/modules/age-modern/data/victories.xml`.
- Antiquity threshold examples: Culture `2/4/7`, Military `6/9/12`, Science
  `3/6/10`, Economic `7/14/20`.
- Exploration threshold examples: Science `1/3/5`, Military `4/8/12`, Culture
  `6/9/12`, Economic `10/20/30`.
- Modern threshold examples: Science `1/2/3`, Military `10/15/20`, Culture
  `5/10/15`, Economic `150/300/500`.

Strategy notes should convert those rows into reachable deltas. For example,
"settle east with escort" is useful when Military/Expansion scoring and rival
settlement counts make another settlement reachable; "build ranged defense" is
useful when preserving the capital is a prerequisite for every path. A generic
"play safely" note is too weak unless it names which milestone or blocker risk
it is protecting.

## 5-10 Turn Use

The planning note should be deliberately temporary. A good note has:

- objective: one or two near-term goals, such as "settle east with escort" or
  "stabilize capital and build ranged defense";
- assumptions: current blocker, visible enemy pressure, known rival city count,
  settlement cap, and current production/civic/tech plan;
- actions to seek: the kinds of blockers or unit moves the agent should look
  for, not commands to send blindly;
- falsifiers: the live facts that should end or revise the plan, such as new
  enemy pressure, no valid settle command, rival war declaration, blocked
  production, or restart mismatch;
- expiry: a turn number or "after next age/war/blocker change" condition.

For the active turn-96/97 context, the extracted plan is:

- use the free Settler proactively because the local player has fewer
  settlements than leading known rivals;
- pair Settler movement with Ballista/Warrior screening rather than holding all
  units in place;
- keep capital production on ranged/defensive units while enemy pressure
  remains nearby;
- compare legacy/victory signals after the current blocker queue is clean, not
  while a live mutation is pending.

## Norms

- Treat the strategy snapshot as advisory. It ranks what to inspect and why; it
  does not replace live validation.
- Keep hidden-info discipline explicit. If a value is visible only through a
  debug or full-player read, label it and avoid using it as normal play advice.
- Prefer public/met-player comparison signals: settlement count, score/legacy
  points, visible military pressure, diplomacy-visible relationships, and known
  active settlers.
- Re-read after restart, turn advance, human input, long latency, or any send.
- Store temporary strategy notes outside the repo unless the finding is durable
  enough to become a project topic.
- Promote durable patterns into this topic or sibling topics only when they
  explain what changed, why it matters, and what downstream play behavior it
  should affect.

## Shortcut Candidate

`game play strategic-snapshot --json` should be read-only and should advertise
its incompleteness until victory and diplomacy subreads are first-class:

```json
{
  "source": "live-direct-control",
  "purpose": "short-horizon-strategy",
  "horizonTurns": 10,
  "live": { "turn": 97, "date": "1680 BCE", "nextDecision": "production" },
  "posture": { "settlements": 3, "settlementCap": 4, "readyUnit": "UNIT_CHARIOT" },
  "comparison": { "metPlayersOnly": true, "rivals": [] },
  "victory": { "enabledPaths": [], "progress": [], "gaps": ["victory runtime read not yet wrapped"] },
  "notes": ["Advisory only; validate every action before send."]
}
```

The first implementation can compose existing reads. The next promotion gate is
adding direct-control wrappers for official UI-equivalent victory/legacy and
diplomacy relationship data.

## Remaining Gaps

- First-class direct-control victory/legacy snapshot shaped from the official
  victory manager.
- First-class diplomacy/relationship snapshot that follows public UI visibility.
- Live treasury, Influence, and diplomacy-action affordability reads connected
  to the static diplomacy action cost tables.
- Settlement recommendation wrapper that records whether it is using the
  current selected settler, a supplied coordinate, or debug context.
- Visibility-filtered target-candidate ranking that separates met/public facts
  from developer-only all-player reads.
- A validator-backed strategy-runner dry run that records proposed actions and
  missing inputs without sending.
