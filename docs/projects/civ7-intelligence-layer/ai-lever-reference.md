# Civ7 AI Lever Reference

This reference keeps the official AI-surface inventory out of
[SOLUTION-FRAME.md](SOLUTION-FRAME.md). It records what the static game
resources appear to expose, what kind of control each surface implies, and what
cannot yet be claimed.

## Authority

Primary local anchors:

- `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base_Naval.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/pseudoyields.xml`
- `.civ7/outputs/resources/Base/modules/age-*/data/AI_*.xml`
- `.civ7/outputs/resources/Base/modules/age-*/data/victories.xml`

These sources prove static schema and resource shape. They do not prove live
mutation, current runtime row freshness, or behavior quality.

## Lever Families

| Surface | Product use | Control depth | Current status |
| --- | --- | --- | --- |
| `AiFavoredItems`, `AiLists`, `AiListTypes` | Express yields, pseudo-yields, tactical actions, diplomacy, settlement, and other priorities | Bias and scoring | Proven static |
| `PseudoYields` | Tune abstract AI valuation constants | Bias and scoring | Proven static |
| `Strategies`, `StrategyConditions` | Activate strategy posture from conditions | Strategic policy selection | Proven static |
| `Strategy_Priorities`, `Strategy_YieldPriorities` | Attach priority lists to active strategy | Strategic scoring | Proven static |
| `AiOperationDefs`, `AllowedOperations` | Change operation availability, limits, targets, and attached tree | Operation policy | Proven static |
| `AiOperationTeams`, `OpTeamRequirements` | Change team composition and requirements | Operation force shape | Proven static |
| `AiTactics`, `AIUnitPrioritizedActions` | Influence native tactical action preferences | Tactical bias, not custom tactics | Proven static |
| `BehaviorTrees`, `BehaviorTreeNodes`, `TreeData` | Compose native behavior-tree graphs | Declarative graph using native nodes | Proven static |
| `TriggeredBehaviorTrees` | Trigger behavior-tree execution from conditions/events | Potential behavior-tree hook | Present in schema; use unproven |
| Diplomacy action preferences/costs | Bias diplomatic action selection | Diplomacy policy bias | Proven static |
| Settlement and plot evaluation rows | Bias city placement and expansion | Static scoring, native rescoring | Proven static |

## Behavior Tree Control

Behavior trees are real mod data. Official resources define named trees such as
`Settle New Town`, `Simple City Assault`, `Simple City Defense`,
`Naval Superiority Tree`, and `Simple Coastal Defense`.

What appears possible:

- create named behavior trees;
- define behavior-tree nodes;
- attach known node data;
- assign a behavior tree to an operation;
- compose graphs from native node definitions.

What is not proven:

- adding new native node implementations;
- replacing native pathing or tactical evaluators;
- hot-reloading a behavior tree in a running game;
- changing a loaded behavior-tree graph and proving native AI re-read.

The right product claim is "we can author static behavior-tree graphs from known
native node vocabulary," not "we can write arbitrary tactical AI."

## Control Depth Matrix

| Question | Answer |
| --- | --- |
| Can we change long-term native AI bias? | Yes, through strategies, priorities, pseudo-yields, favored lists, settlement preferences, diplomacy, and victory/legacy rows at load or age boundaries. |
| Can we change which operations native AI considers? | Yes, statically through operation definitions, allowed operations, requirements, limits, teams, and behavior-tree assignment. |
| Can we create behavior trees? | Yes, as static data graphs using native node definitions. |
| Can we create new tactical primitives? | Not from current evidence. Tactical primitives remain engine-owned. |
| Can we automate precise turn tactics through native AI? | Only indirectly through static biases and operation/tactic priority changes. Direct-control is the reliable precise tactical lane. |
| Can we change AI policy mid-game? | Unproven. Treat as a probe, not a product dependency. |

## Compiler Implications

The profile compiler should emit small recipes, not broad global rewrites. A
recipe should include:

- intent label;
- source anchors;
- changed tables and rows;
- expected behavior metric;
- generated SQL/XML;
- manifest/load criteria;
- loaded-row check;
- rollback or disable path.

Good first lever candidates are visible and measurable:

- settlement scoring or expansion posture;
- repair and recovery preference;
- operation eligibility/limits for one operation family;
- tactical priority list change for one age;
- one behavior-tree assignment attached to a known operation.

Avoid making behavior quality claims from row existence alone. A loaded-row
check proves the profile loaded; a measured run proves whether behavior moved.
