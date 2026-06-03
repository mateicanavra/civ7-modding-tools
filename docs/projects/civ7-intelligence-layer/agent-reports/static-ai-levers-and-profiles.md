# Static AI Levers And Generated Profiles

Agent: Codex.
Lane: Lane B, static AI levers and generated profiles.
Date: 2026-06-03.

## Objective

Investigate which Civ7 static AI levers and generated-profile mechanisms are
actually available, when they load, and whether script-like surfaces could act
as static or live bridge levers. The product question is what a strategy/profile
compiler can safely change now, what belongs in probes, and what should be
eliminated or deferred.

## Sources Inspected

- `docs/projects/civ7-intelligence-layer/open-threads-investigation-frame.md`
- `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/ai-lever-reference.md`
- `docs/projects/civ7-intelligence-layer/rhq-reference.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`
- `.civ7/outputs/resources/Base/modules/age-antiquity/age-antiquity.modinfo`
- `.civ7/outputs/resources/Base/modules/age-exploration/age-exploration.modinfo`
- `.civ7/outputs/resources/Base/modules/age-modern/age-modern.modinfo`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base_Naval.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/pseudoyields.xml`
- `.civ7/outputs/resources/Base/modules/age-antiquity/data/AI_Antiquity.xml`
- `.civ7/outputs/resources/Base/modules/age-exploration/data/AI_Exploration.xml`
- `.civ7/outputs/resources/Base/modules/age-modern/data/AI_Modern.xml`
- `.civ7/outputs/resources/Base/modules/age-*/data/victories.xml`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525/ai.modinfo`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525/modules/**`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/{Database.log,Modding.log,UI.log,Scripting.log}`

## Commands And Probes Run

- `git status --short --branch && git branch --show-current && gt status`
- `rg -n "BoostHandlers|ScriptConsumer|TargetScript|AI_BUDGET_SCRIPTING|TriggeredBehaviorTrees|BehaviorTrees|AiOperationDefs|AiTactics|Strategies|StrategyConditions|Strategy_Priorities|AiFavoredItems|PseudoYields" .civ7/outputs/resources/Base/Assets/schema .civ7/outputs/resources/Base/modules -S`
- `sed -n '450,775p' .civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `sed -n '3488,3720p' .civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `rg -n "<BoostHandlers|<TriggeredBehaviorTrees|TargetScript=|AI_BUDGET_SCRIPTING|ScriptConsumer|<AiEvents|<Row EventType=|<Row Budget=|<Row Component=\"ScriptConsumer\"|AiComponent=\"ScriptConsumer\"" .civ7/outputs/resources/Base/modules/... -S`
- `sed -n '15,90p' .civ7/outputs/resources/Base/modules/age-antiquity/age-antiquity.modinfo`
- `sed -n '19,92p' .civ7/outputs/resources/Base/modules/age-exploration/age-exploration.modinfo`
- `sed -n '19,90p' .civ7/outputs/resources/Base/modules/age-modern/age-modern.modinfo`
- `rg -n "AI_Base|AI_Antiquity|AI_Exploration|AI_Modern|behaviortrees|AI_Base_Naval|victories.xml|pseudoyields.xml" .civ7/outputs/resources/Base/modules/*/*.modinfo -S`
- `sqlite3 /Users/mateicanavra/Library/Application\ Support/Civilization\ VII/Mods.sqlite ...`
- `sqlite3 /Users/mateicanavra/Library/Application\ Support/Civilization\ VII/Debug/gameplay-copy.sqlite ...`
- `rg -n "rhq|RHQ|civmods-rhq|ai_trees|BoostHandlers|TriggeredBehaviorTrees|TargetScript|change_banner|error|Error|ERROR" .../Logs/{Database.log,Modding.log,Scripting.log,UI.log} -S`

All probes were read-only. No live-game state mutation was attempted.

## Findings

1. `[verified-local]` The repo/workstream is already on
   `codex/investigate-civ7-intelligence-threads`, with existing untracked
   investigation docs. This report is the only file edited by this agent.

2. `[source-backed]` Official age modules use `ActionCriteria` with
   `AgeInUse` and separate action groups. Antiquity has both
   `antiquity-age-current` and `antiquity-age-persist`; Exploration has
   `exploration-age-current` and `exploration-age-persist`; Modern has
   `modern-age-current`. Each age module loads age-specific database files such
   as `AI_Antiquity.xml`, `AI_Exploration.xml`, `AI_Modern.xml`,
   `pseudoyields.xml`, and `victories.xml` through `UpdateDatabase`.
   This proves the mod system supports age-scoped static data layering.

3. `[hypothesis]` Generated profile swap/layering at an actual age transition
   is plausible but not runtime-proven here. The official resources prove
   age-conditioned action groups and age-specific AI rows; they do not prove
   that a newly generated or changed local mod file is re-evaluated during an
   already-running transition without reload, nor that native AI re-reads every
   affected row after transition. Treat start/load as reliable, age transition
   as a high-priority probe boundary.

4. `[verified-local]` The gameplay schema exposes the core profile compiler
   surface: `AiFavoredItems`, `AiLists`, `AiListTypes`, `PseudoYields`,
   `Strategies`, `StrategyConditions`, `Strategy_Priorities`,
   `Strategy_YieldPriorities`, `AiOperationDefs`, `AllowedOperations`,
   `AiOperationTeams`, `OpTeamRequirements`, `AiTactics`,
   `AIUnitPrioritizedActions`, `BehaviorTrees`, `BehaviorTreeNodes`, and
   `TreeData`.

5. `[source-backed]` Official resources actively use those static AI surfaces.
   Examples: `AI_Base.xml` defines AI components, budgets, base operations,
   operation teams, tactical lists, city strategies, and favored items;
   `AI_Base_Naval.xml` adds naval operation rows; age AI files add
   age-specific favored items, tactics, operations, teams, and strategies;
   age `victories.xml` files define strategy conditions and priority lists.

6. `[verified-local]` `BehaviorTrees` are a real static graph surface. Official
   `behaviortrees.xml` defines node shapes, node definitions, node data
   definitions, data types, named trees, `BehaviorTreeNodes`, and `TreeData`.
   Official `AiOperationDefs` assign operation rows to named trees such as
   `Simple City Assault`, `Simple City Defense`, `Settle New Town`, and
   `Explore Distant Lands`.

7. `[source-backed]` A generated profile can author or modify behavior-tree
   graphs only from the known native node vocabulary. The data can compose
   graphs and assign them to operations or strategies, but current evidence
   does not show a way to add new native node implementations or arbitrary
   tactical code.

8. `[verified-local]` `TriggeredBehaviorTrees` are present in schema. The table
   has `TriggerType`, `AIEvent`, optional `OperationName`, `Priority`, and
   `TreeName`; it references `AiEvents` and `BehaviorTrees`. The local
   definitions file in RHQ describes it as behavior trees or operations
   triggered by AI events, with operation taking precedence over tree name.

9. `[eliminated]` No official resource rows and no active RHQ module rows were
   found inserting `TriggeredBehaviorTrees`. The local debug gameplay database
   reports `COUNT(*) = 0` for `TriggeredBehaviorTrees`. This eliminates
   TriggeredBehaviorTrees as a production candidate today; it remains a probe
   candidate because the schema and definitions are concrete.

10. `[verified-local]` `BoostHandlers` are present in schema with
    `HandlerId`, optional `BehaviorTree`, optional `OperationName`, `Script`,
    `UniquenessTag`, and `WinnowFunction`. The local definitions file marks it
    as C++ backed and says `WinnowFunction` returns whether not to pursue the
    boost.

11. `[eliminated]` No official resource rows and no active RHQ module rows were
    found inserting `BoostHandlers`. The local debug gameplay database reports
    `COUNT(*) = 0` for `BoostHandlers`. This is not a current production
    strategy lever. It is deferred reverse-engineering unless a minimal
    disposable probe can show a handler script or operation effect.

12. `[verified-local]` `TargetScript` exists on `AiOperationDefs`. The local
    definitions file says it is called only when a target type needs a script
    and must return a plot index plus optional integer range. No official AI
    resource row, active RHQ row, or debug gameplay snapshot row was found with
    a non-empty `TargetScript`.

13. `[eliminated]` `TargetScript` is not a production lever for the compiler
    today because there is no local example of script name resolution,
    callable language, return convention in practice, or working row. It is a
    deferred/probe candidate for custom operation targeting only.

14. `[verified-local]` `ScriptConsumer` is an AI component in `AI_Base.xml`,
    assigned to major and minor leader definitions. The debug gameplay database
    contains `AiComponents.Component = 'ScriptConsumer'` with
    `Consumer = 1` and `DefaultPriority = AI_PRIORITY_HIGH`.

15. `[source-backed]` `AI_BUDGET_SCRIPTING` is a baseline AI budget in
    `AI_Base.xml`. Official resources define budget-biased favored items for
    many leaders and strategies, but not an official favored item targeting
    `AI_BUDGET_SCRIPTING` in the inspected files.

16. `[verified-local]` RHQ has a commented-out `Major Budget Biases` block that
    includes `AI_BUDGET_SCRIPTING`, but the block is inside a SQL comment and
    the debug gameplay snapshot did not show a loaded `AiFavoredItems` row for
    `Item = 'AI_BUDGET_SCRIPTING'`. Treat RHQ's scripting-budget note as design
    intent, not active evidence.

17. `[source-backed]` `AI_BUDGET_SCRIPTING` and `ScriptConsumer` likely refer
    to engine/native AI budget and component scheduling, not a modder-supplied
    live script bridge. They are static AI participation knobs until a script
    surface demonstrates external input, execution, and behavior effect.

18. `[verified-local]` Local RHQ is a static AI data overhaul. `ai.modinfo`
    declares `AffectsSavedGames=1`, depends on base plus all three ages, uses
    `AgeInUse` criteria, loads SQL/XML through `UpdateDatabase`, and registers
    a `UIScripts` action for `ui/change_banner.js`. That UI script and
    `modinfo.xml` are both zero-byte files.

19. `[verified-local]` `Mods.sqlite` registers RHQ action groups and items:
    always-load behavior trees, always-load core SQL/op/diplomacy/settler/vict
    files, Antiquity-specific settlers/ops/tactical files, Exploration-specific
    tactical/victory/ops files, and Modern-specific victory/ops files. It does
    not register `modules/behaviortrees/ant_ai_trees.xml`,
    `modules/data/city_strategies.sql`, or `modules/vict/ant_vict.sql`.

20. `[verified-local]` Local logs show RHQ action groups loading, including
    `modules/behaviortrees/ai_trees.xml` and the registered SQL files.
    UI logs show `fs://game/rhq/ui/change_banner.js` was requested and read as
    0 bytes. This confirms no active RHQ live script bridge exists locally.

21. `[verified-local]` The debug gameplay snapshot contains RHQ's
    `Naval Superiority Tree v2` and `Simple City Defense v2` behavior trees,
    including node/data rows. It does not show active operations using those
    `v2` trees. The only local file wiring `Naval Superiority Tree v2` to an
    operation is `ant_ai_trees.xml`, which the active manifest comments out and
    `Mods.sqlite` does not register.

22. `[source-backed]` RHQ actively changes static AI categories useful to a
    compiler: favored items, pseudo-yields, operation definitions/team
    parameters, allowed operations, operation team requirements, unit
    efficiency bonuses, tactical priority lists, diplomacy action/pseudo-yield
    biases, strategy conditions, strategy priority lists, and leader/civ
    priorities.

23. `[verified-local]` The debug gameplay snapshot confirms several RHQ-like
    loaded effects, including `RHQ_GLOBAL_DIPLOMATIC_BIASES`,
    `RHQ_GLOBAL_WAR_PSEUDOYIELDS`, and the `v2` behavior trees. It also confirms
    zero loaded `BoostHandlers`, zero loaded `TriggeredBehaviorTrees`, and no
    non-empty `TargetScript` rows.

## Actuation-Path Classification

| Lever/path | Classification | Compiler can change | Load boundary | Product implication | Safety risk |
| --- | --- | --- | --- | --- | --- |
| `AiLists` / `AiListTypes` / `AiFavoredItems` | production candidate, static-only lever | Lists, attached systems, favored items, values, difficulty bounds | reliable at game/mod load; age-scoped via action criteria; transition reload unproven | Best first compiler target for small auditable bias recipes | Overbroad values can distort AI globally; require narrow recipe and A/B metric |
| `PseudoYields` | production candidate, static-only lever | Default values and list-item biases | load / age-scoped | Good for strategic valuation profiles | Large values can swamp other scoring |
| `Strategies` / `StrategyConditions` / priority tables | production candidate, static-only lever | Activation thresholds, conditions, city/victory strategy priorities, behavior-tree references | load / age-scoped | Compiler can express posture and victory/city focus | Conditions are opaque engine functions; bad rows may activate too early or never |
| Operations (`AiOperationDefs`, `AllowedOperations`, `AiOperationTeams`, `OpTeamRequirements`, limits) | production candidate, static-only lever | Operation availability, target constraints, team composition, tree assignment, odds/war/coastal/unit gates | load / age-scoped | Strong profile surface for expansion, war, naval, defense, exploration | Can crash or stall AI if target/team/tree references are invalid or too broad |
| Tactics (`AiTactics`, `AIUnitPrioritizedActions`, tactical favored lists) | production candidate, static-only lever | Tactical priority rows and unit action preferences | load / age-scoped | Useful for tactical bias, not precise turn control | Native action primitive remains engine-owned |
| Behavior tree graphs | production candidate for known nodes; static-only lever | Named trees, node graph rows, tree data, operation/strategy assignment | load / age-scoped | Compiler can generate auditable graph variants from existing node vocabulary | Invalid graphs may fail load or produce stalled operations |
| `TriggeredBehaviorTrees` | probe candidate | Potential event-triggered tree/operation rows | schema load only proven; no active row evidence | Could become generated reactive profile mechanism if minimal probe works | Event semantics and loop risk unknown |
| `BoostHandlers` | deferred reverse-engineering thread | Potential boost-to-tree/operation/script handler rows | schema load only proven; no active row evidence | Not part of product baseline | Unknown script/winnow semantics; no examples |
| `TargetScript` | deferred reverse-engineering thread | Potential custom operation target resolver name | column exists; no active row evidence | Could help custom operation targeting, not live control | Script language/name resolution unknown |
| `ScriptConsumer` | observation-only signal | Component presence/priority only | baseline load | Shows native AI has a script consumer component, but not a bridge | Misleading name can invite false live-control claims |
| `AI_BUDGET_SCRIPTING` | static-only lever, currently weak | Budget bias rows in principle | baseline budget exists; favored item use not locally proven | Possible budget-bias dimension, not bridge | Meaning is opaque; requires one-lever probe |
| RHQ UI script path | eliminated path for RHQ; probe candidate for separate companion bridge | RHQ itself changes nothing live; file is 0 bytes | UI script registered and loaded as empty file | RHQ is not a live controller | None from RHQ; companion bridge remains separate Lane C |

## Product Implications

The viable product boundary is a static profile compiler plus measured-run
promotion. The compiler should emit small SQL/XML recipes that alter one lever
family at a time, carry source anchors, declare intended age/load scope, and
include loaded-row checks. It should not claim live native-AI steering.

Age-aware generated profiles are worth designing. The official mod system
already distinguishes always, current-age, and persist-style action groups.
The compiler can mirror that structure by generating base/common rows plus
age-specific rows. The product claim should be "profile loads at start/load and
is designed for age-scoped layering"; "hot swap at age transition" remains a
probe result, not a baseline.

Behavior-tree generation is real enough for a compiler, but only as static
composition over native nodes. The compiler contract should expose tree
selection/assignment and graph-template parameters, not arbitrary tactical code.

Script-named surfaces should not be sold as bridges. `ScriptConsumer`,
`AI_BUDGET_SCRIPTING`, `BoostHandlers`, `TargetScript`, and
`TriggeredBehaviorTrees` are either engine scheduling/data surfaces or
unexercised schema hooks. They may become bridge-like only after a disposable
probe proves load, callback semantics, behavior effect, and rollback.

RHQ should be mined as a recipe library, not forked. Its loaded local behavior
is static SQL/XML. It proves that broad AI profiles can load and that specific
rows appear in the debug gameplay copy; it does not prove live script behavior
or active use of its experimental behavior-tree wiring.

## Safety And Live-Game Risk

- Static profile changes can affect saved-game compatibility; RHQ declares
  `AffectsSavedGames=1`. Generated profiles need disable/rollback manifests.
- Behavior-tree and operation changes can create invalid references, stalled
  operations, or runaway operation selection. Probe in disposable sessions
  before use in a shared live game.
- Triggered behavior trees may create loops or repeated operation starts;
  treat them as unsafe until a minimal, bounded event probe proves semantics.
- Script hooks are high uncertainty. Do not allow LLM-authored arbitrary script
  bodies or runtime code execution through them.
- Large RHQ-style values should not be copied wholesale. Reduce to one lever
  and one metric before promotion.

## Exact Next Probes

1. One-lever load probe: generate a minimal profile that adds one unique
   `AiListType`, one `AiLists` row, and one modest `AiFavoredItems` bias for a
   known system. Start a disposable game, query `GameInfo` or
   `gameplay-copy.sqlite`, and verify row visibility.

2. Age-scoped profile probe: create a disposable mod with one always-loaded row,
   one Antiquity-only row, and one Exploration-only row. Start Antiquity,
   verify rows, advance or load into Exploration, and verify whether the
   Exploration row appears and Antiquity-current row disappears without
   restarting. This is the key age transition swap/layering proof.

3. Behavior-tree assignment probe: generate a small variant of an existing
   tree using known node definitions, assign it to one operation in a
   disposable mod, verify load, then observe AI operation logs for use.

4. TriggeredBehaviorTrees probe: insert one row using the known
   `AI_EVENT_TRIBE_RAMPAGE` event and an existing harmless tree/operation in a
   disposable session. Success requires load, no DB errors, event delivery, and
   bounded behavior/log evidence.

5. TargetScript probe: search game scripts for target resolver names; if a
   candidate exists, create one operation row with `TargetScript` and verify
   whether the engine resolves it. If no candidate exists, defer rather than
   inventing a script name.

6. BoostHandlers probe: create no product work until a minimal handler can be
   derived from official or debug evidence. First step is corpus search for
   boost handler names or logs; only then try a disposable row.

7. `AI_BUDGET_SCRIPTING` probe: add a modest favored item in a unique,
   controlled list and verify whether it loads and whether any AI logs mention
   scripting budget decisions. Promote only if a behavior or log signal moves.

8. RHQ recipe isolation: choose one active RHQ delta already visible in
   `gameplay-copy.sqlite`, recreate it as a tiny generated profile, and run a
   fixed-seed A/B comparison with a concrete metric.

## Bottom Line

Lane B supports a strategy/profile compiler, but the compiler is a static,
load-scoped product surface. Its reliable levers are favored lists,
pseudo-yields, strategies, operations, tactics, and behavior-tree graphs using
native node vocabulary. Age-aware layering is strongly supported by modinfo
structure, but actual age-transition swapping/reload remains a required probe.
`TriggeredBehaviorTrees`, `BoostHandlers`, `TargetScript`, `ScriptConsumer`, and
`AI_BUDGET_SCRIPTING` do not currently justify a live bridge claim.

Skills used: investigation-design, solution-design, domain-design, api-design.
