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

Local investigation anchors:

- `/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525`
- [agent-reports/static-ai-levers-and-profiles.md](agent-reports/static-ai-levers-and-profiles.md)

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
| `BoostHandlers` | Potential boost-to-tree/operation/script handler | Unknown script or C++ backed hook | Present in schema; no loaded rows found |
| `TargetScript` on `AiOperationDefs` | Potential custom operation target resolver | Unknown script resolver | Column exists; no non-empty local rows found |
| `ScriptConsumer` | Native AI component scheduling | Observation signal | Loaded component, not a bridge proof |
| `AI_BUDGET_SCRIPTING` | Native AI budget dimension | Weak static probe | Budget exists; active favored use not locally proven |
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

## Age Scope

Official age modules use `ActionCriteria` with `AgeInUse` and age-specific
`UpdateDatabase` action groups. This proves a generated profile can mirror the
same shape: common rows, current-age rows, and age-persist rows.

What is reliable today:

- rows can be scoped by age action criteria in the same way official modules
  are scoped;
- a generated mod profile can declare base and age-specific database actions;
- loaded rows can be checked after load with live `GameInfo` and debug database
  readback.

What remains a probe:

- whether a generated profile can be swapped or layered during a running age
  transition without restarting;
- whether native AI components re-read every affected row at transition time;
- whether row visibility at transition produces an actual behavior change.

The compiler should therefore expose age scope as metadata but treat transition
swap as a proof gate.

## Script-Like Surfaces

The investigation looked specifically at surfaces whose names suggest a script
bridge.

| Surface | Evidence | Product classification |
| --- | --- | --- |
| `ScriptConsumer` | Official `AI_Base.xml` defines it as an AI component assigned to major and minor leaders; local debug DB shows it loaded with `Consumer = 1`. | Observation-only signal. It does not prove external script control. |
| `AI_BUDGET_SCRIPTING` | Official resources define the budget. Local RHQ has a commented-out budget-bias block; no active loaded favored item was found. | Weak static-only probe. |
| `TargetScript` | Schema column exists on `AiOperationDefs`; local docs describe a target resolver contract; no official/RHQ/debug row had a non-empty value. | Deferred reverse-engineering thread. |
| `BoostHandlers` | Schema table exists with `Script` and `WinnowFunction`; local/debug count is zero. | Deferred reverse-engineering thread. |
| `TriggeredBehaviorTrees` | Schema table exists and references `AiEvents` and behavior trees; local/debug count is zero. | Probe candidate for generated profiles, not baseline. |

None of these surfaces currently justify a live native-AI bridge claim. Promote
one only after a disposable probe proves load, callback or trigger semantics,
behavior effect, and rollback.

## Control Depth Matrix

| Question | Answer |
| --- | --- |
| Can we change long-term native AI bias? | Yes, through strategies, priorities, pseudo-yields, favored lists, settlement preferences, diplomacy, and victory/legacy rows at load or age boundaries. |
| Can we change which operations native AI considers? | Yes, statically through operation definitions, allowed operations, requirements, limits, teams, and behavior-tree assignment. |
| Can we create behavior trees? | Yes, as static data graphs using native node definitions. |
| Can we create new tactical primitives? | Not from current evidence. Tactical primitives remain engine-owned. |
| Can we automate precise turn tactics through native AI? | Only indirectly through static biases and operation/tactic priority changes. Direct-control is the reliable precise tactical lane. |
| Can we change AI policy mid-game? | Unproven. Treat as a probe, not a product dependency. |
| Can script-like AI tables serve as a live bridge? | Not from current evidence. They are schema or component hints until callback semantics are proven. |
| Can loaded rows be verified after mod load? | Yes for row visibility: live `GameInfo` counts/sample rows matched debug DB copies in the current session. Behavior movement still needs measured runs. |

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

## Exact Probe Sequence

1. **Marker-row load probe.** Generate one harmless unique `AiListTypes` and
   `AiLists` pair, load in a disposable session, and verify both live `GameInfo`
   and `Debug/gameplay-copy.sqlite` see the same keys.
2. **One-lever behavior probe.** Add one modest favored-item or pseudo-yield
   change with a fixed seed and a single expected metric.
3. **Age-scoped profile probe.** Add one always-loaded, one Antiquity-only, and
   one Exploration-only marker row. Verify row visibility before and after an
   approved disposable age transition.
4. **Behavior-tree assignment probe.** Generate a small variant using existing
   node vocabulary, attach it to one operation, and observe load plus operation
   behavior.
5. **Triggered behavior tree probe.** Insert a bounded row using a known
   `AiEvents` entry and record whether the trigger fires.
6. **Script hook falsifiers.** Do not invent script names. Search for real
   resolver/handler examples first; if none exist, keep `TargetScript` and
   `BoostHandlers` deferred.
