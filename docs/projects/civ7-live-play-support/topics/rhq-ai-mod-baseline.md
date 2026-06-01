# RHQ AI MOD Baseline

Status: `advisory-reference`.

Sources:

- Steam Workshop: `https://steamcommunity.com/sharedfiles/filedetails/?id=3507042742`
- Change notes: `https://steamcommunity.com/sharedfiles/filedetails/changelog/3507042742`
- Historical CivFanatics mirror:
  `https://forums.civfanatics.com/resources/rhq-artificially-intelligent-ai-mod.31881/`

## Frame

RHQ AI MOD is useful because it shows what a serious Civ7 AI-improvement mod
can change inside the game's static AI/resource layer. It is not the same kind
of tool as the direct-control play agent.

Use RHQ as the baseline for native AI manipulation over autoplay:

- it changes loaded AI definitions, operation definitions, behavior trees,
  team composition, tactical priorities, pseudo-yields, and production/repair
  biases;
- it is tested through autoplay and behavior observation;
- it improves what native AI does when the game is choosing for an AI player.

Use the watcher/direct-control layer for player-side adaptive strategy:

- it reads live blockers, ready entities, validators, and postconditions;
- it can revise objectives turn by turn;
- it can explain why a command should or should not be sent now.

The two approaches can complement each other, but they solve different
problems. RHQ changes the policy substrate. Direct-control runs a live decision
loop.

## Public RHQ Claims

The current Workshop description says RHQ AI MOD v3.0 was rebuilt for Civ VII
1.4.0 "Test of Time" and enhances military operations, naval warfare, air
force, tactical decisions, and faster/core-biased settling.

The public changelog is more specific. Recent entries claim:

- F10 autoplay support, AI repair buying, and AI building buying;
- v3.1 air and repair changes: bombers built and used, Air Patrol/Strike
  recruitment changes, command-type mappings for aircraft, and a large
  `PSEUDOYIELD_REPAIR_BONUS` increase;
- v3.0 Test of Time rebuild: air patrol/strike operations, dedicated behavior
  trees, airfield priority, custom naval city attack, cavalry raids, city
  attack/defense improvements, commander combat priorities, settlement and
  expansion tuning, team composition changes, and tactical priority systems;
- removal of victory/diplomacy overrides in v3.0 because Civ VII 1.4.0 changed
  the base system toward Triumphs and improved native AI;
- older naval-war work around behavior-tree assignment, `CreateUnits`, time
  limits, target types, fleet composition, operation cleanup, and age-transition
  reapplication.

These are author claims from the Workshop page, not locally verified RHQ source
proof. Treat them as a research baseline to compare against official resource
surfaces and future downloaded mod files.

## Public Status Caveats

The public Steam state observed on June 1, 2026 is contradictory. The item page
still exposes the RHQ AI MOD title, description, file size, subscriber count,
posted date, May 31 update date, changelog entries, and recent author comments,
but Steam also displays removal and Civ VII incompatibility warnings. Treat the
page as a source for author claims and changelog history, not proof that the mod
is currently installable or loaded in a local game.

The CivFanatics mirror is useful for lineage and older compatibility notes, but
it appears stale relative to the Steam v3.x/Test of Time branch. It should not
be used as proof of current v3.x implementation details.

Recent author notes also describe limits that matter for our baseline:

- v3.1 still had partial air-operation caveats: Air Patrol could fire once per
  civ early in Modern, and some civs might still build zero bombers.
- Comments around late May 2026 describe over-war behavior as a recent issue
  the author believed was solved, plus possible Steam update delivery problems
  that may require unsubscribe/resubscribe.
- User comments report mixed behavior: improved armies/play in some games, but
  also concerns about no ships, over-aggression, idle units, hard alliances, and
  defensive city-states. These are anecdotes, not validated behavior.
- Older mirror notes describe AI-mod compatibility conflicts, including the
  practical support norm that only one AI-overhaul mod should usually be active
  while testing behavior.

For our work, this means RHQ is a comparator, not an authority. The durable
measurement is bounded autoplay telemetry: settlement distance, city-founding
cadence, naval production/use, air recruitment/use, repairs, war declarations,
city attacks, raids, and independent/city-state attacks.

Support norm: if a local run claims RHQ is installed but behavior or files look
stale, first verify Workshop delivery before analyzing game behavior. Refresh
the subscription, restart Steam and Civ VII, ensure only one AI-overhaul mod is
active, and then verify the loaded rows or downloaded files.

## Official Surfaces That Match The Claims

The official gameplay schema has tables that match RHQ's claimed levers:

- `AiFavoredItems`, `AiLists`, and `AiListTypes` define weighted list items and
  connect them to AI systems such as unit, constructible, government, tag,
  pseudo-yield, and settlement evaluation biases.
- `AiOperationDefs` connects operation names to behavior trees, target types,
  war/coastal/unit requirements, target strength/distance gates, priority, and
  self-start behavior.
- `AllowedOperations`, `AIUnitPrioritizedActions`, and `OpTeamRequirements`
  connect those operations to eligible contexts, unit action priorities, and
  team assembly constraints.
- `BehaviorTrees`, `BehaviorTreeNodes`, and `TreeData` define named behavior
  trees, node ordering, and node data.
- `Strategies`, `StrategyConditions`, `Strategy_Priorities`, and
  `Strategy_YieldPriorities` connect strategy activation to legacy/victory
  lanes and AI priority lists.
- `TriggeredBehaviorTrees` connects AI events to behavior trees.

Official XML resources use those tables in exactly the categories RHQ names:

- base AI definitions and biases in
  `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml`;
- base naval operation definitions and behavior trees in
  `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base_Naval.xml`;
- reusable behavior tree definitions in
  `.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml`;
- age-specific AI lists and operation definitions in
  `.civ7/outputs/resources/Base/modules/age-antiquity/data/AI_Antiquity.xml`,
  `.civ7/outputs/resources/Base/modules/age-exploration/data/AI_Exploration.xml`,
  and `.civ7/outputs/resources/Base/modules/age-modern/data/AI_Modern.xml`;
- age-specific victory/legacy strategies in each age's `victories.xml`.

The Antiquity victory resources show how strategy rows become behavior bias:
the expansion strategy uses conditions such as city count, conquered cities,
top military percent, commanders, and militaristic/expansionist traits; its
priority lists then bias standing army, exploration, new-city value,
settlement-cap increase, production, and military tags. This is the same class
of static lever as RHQ's settlement and military-tactical claims.

## What This Implies For Our Strategy Architecture

There are four plausible architecture paths:

1. **Static mod before the game starts.** Best for changing native AI behavior:
   operation definitions, behavior trees, pseudo-yields, settlement scoring,
   team composition, and age reapplication. This is the RHQ lane.
2. **Local database edits while the game is live.** Not a safe default. The
   repo has useful SQLite/debug/catalog evidence, but we do not yet have a
   contract proving which database is live, which rows are mutable, when the
   engine rereads them, or how to recover from partial writes.
3. **In-game JavaScript strategy bridge.** Plausible later for telemetry or
   low-latency event export. It should start read-only; making it another
   mutation authority would complicate validation and recovery.
4. **External workflow runner over CLI/direct-control.** Best near-term path
   for player-side multi-turn strategy because it already has live blockers,
   validators, postconditions, restart rehydration, and proof labels.

The recommended split is static mod for coarse native AI habits, external
runner for adaptive player strategy, and telemetry-only JS only if it improves
freshness or latency.

## Norms

- Compare our AI-strategy work to RHQ by lever type, not by feature count. RHQ
  changes data the native AI consumes; our runner chooses validated actions.
- Use RHQ claims to seed A/B experiments, then verify with loaded GameInfo rows
  and bounded autoplay outcomes.
- Do not infer live mutability from static schema. A table that is moddable at
  load time is not automatically safe to edit mid-game.
- Keep victory/triumph work patch-sensitive. RHQ's v3.0 notes explicitly say
  it removed victory/diplomacy overrides after Civ VII 1.4.0 changed the base
  system.
- Treat community claims as advisory until the actual mod files are inspected
  or the behavior is reproduced locally.

## Experiment Seeds

Before changing any static AI/resource lever, add a loaded-row read. A useful
`game ai loaded-levers` shortcut would inspect runtime `GameInfo` rows for
`AiOperationDefs`, `AllowedOperations`, `AiFavoredItems`,
`AIUnitPrioritizedActions`, pseudo-yields, and the relevant behavior-tree
assignments. That read would not prove behavior, but it would prove which AI
policy substrate the current session loaded.

- **Settlement pressure:** baseline versus a small `PSEUDOYIELD_NEW_CITY` or
  settlement-plot-evaluation change, measured by city count, settle distance,
  and settle quality by turn threshold.
- **Repair behavior:** baseline versus a repair pseudo-yield increase, measured
  by damaged improvements/buildings repaired over bounded autoplay.
- **Naval operation:** baseline versus one explicit operation/tree assignment
  change, measured by ships built, coastal attack attempts, and target quality.
- **Autoplay telemetry:** summarize bounded runs in RHQ's vocabulary: city
  count, settlement distance, ships built and used, aircraft built and used,
  repairs, war declarations, city attacks, raids, and independent/city-state
  attacks.
- **External runner dry run:** no static mod; run 5 turns in validate-only mode
  and record whether the runner's proposed actions differ materially from
  native autoplay or manual play.

## Remaining Gaps

- Locate or download the actual RHQ mod files for source-level comparison.
- Map RHQ's public claims to exact SQL/XML rows instead of broad official table
  classes.
- Add a loaded-GameInfo verification command for AI operation/list deltas.
- Build a fixed-seed autoplay A/B harness that records the outcome measures
  above.
- Decide whether "Triumph" has a distinct runtime surface in 1.4.0 or is
  exposed to the current UI primarily through legacy/victory progress models.
