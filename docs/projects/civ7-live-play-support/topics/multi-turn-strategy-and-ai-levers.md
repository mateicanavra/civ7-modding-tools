# Multi-Turn Strategy And AI Levers

Status: `reference-with-gap`.

## Frame

The live-play workstream now has enough single-turn evidence to support a
multi-turn strategy layer, but the strategy layer should not be confused with
native Civ7 AI. There are three different control surfaces:

- **External strategy runner:** reads live state through direct-control,
  chooses objectives and actions, validates, sends, verifies, and advances or
  stops autoplay.
- **Static AI/resource mod:** changes loaded AI database rows such as
  pseudo-yields, operation definitions, team requirements, behavior tree links,
  unit priorities, settlement evaluations, and production biases.
- **Native autoplay:** advances turns under the game's current AI/control
  policy. It is a clock and handoff mechanism, not a policy engine by itself.

The near-term normative path is an external runner over the existing CLI/HUD.
The RHQ-style AI mod path is useful for baseline AI/autoplay improvement and
A/B experiments, but it is static tuning unless a live mutation contract is
proven. A future in-game JavaScript bridge should start as telemetry only.

## Observed Play Heuristics

The strongest extracted play pattern is threat-responsive defense without
freezing expansion. The agent and watcher choices repeatedly favored defensive
production, wounded-unit preservation, ranged-first attacks, and conservative
diplomacy while still resolving population, production, Settler, Migrant, and
town-focus blockers when the board allowed it.

Candidate multi-turn objectives:

1. Defend capital and coastal towns before chasing remote targets.
2. Preserve commanders, wounded melee, and wounded naval units unless a
   live-validated finishing attack has a favorable postcondition.
3. Use ranged and bombard units first when they can hit from protected plots.
4. Keep production flowing toward the current threat profile.
5. Expand safely, but do not walk civilians toward active combat without an
   escort and destination proof.
6. Resolve blockers and restart bounded/unbounded autoplay only from clean
   App UI evidence.

These are conditional heuristics, not a universal opening. Reframe them when
fresh live state shows a different bottleneck: happiness, settlement cap,
economy, victory progress, diplomacy, or a change in enemy pressure.

## Official AI Levers

Official resources show that Civ7 AI behavior is heavily data-driven, with the
native engine solving the per-turn policy. Relevant schema and resource
surfaces include:

- `AiComponents`, `AiDefinitions`, and priorities for selecting AI systems.
- `AiLists` and `AiFavoredItems` for unit, constructible, government, tag,
  yield, pseudo-yield, and settlement biases.
- `AiOperationDefs`, `AllowedOperations`, `AiOperationTeams`, and
  `OpTeamRequirements` for operation eligibility, behavior trees, target
  requirements, strength gates, and team composition.
- `AIUnitPrioritizedActions` for unit-specific AI actions.
- `PlotEvalConditions` and settlement plot evaluation lists.
- `BehaviorTrees` plus behavior-tree node user data such as Operation Recruit
  Units `Create Units`, `Range`, and `Time Limit`.

Important local anchors:

- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base_Naval.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/pseudoyields.xml`
- `.civ7/outputs/resources/Base/modules/age-antiquity/data/AI_Antiquity.xml`
- `.civ7/outputs/resources/Base/modules/age-exploration/data/AI_Exploration.xml`
- `.civ7/outputs/resources/Base/modules/age-modern/data/AI_Modern.xml`
- `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`

Treat these as load-time/mod-resource levers until proven otherwise. A row
loaded through a mod can bias native AI. A row changed in a local SQLite copy
or guessed live database surface does not prove the current native solver will
consult the changed value.

## RHQ Baseline

RHQ's Steam Workshop page and changelog describe a Civ7 AI mod that targets the
same official levers: behavior tree assignment, operation definitions, team
requirements, allowed operations, pseudo-yields, repair priorities, coastal
building and naval production bias, air patrol/strike operations, unit command
mapping, and age-transition reapplication. The page currently reports
compatibility/removal caveats, so use these as author claims cross-checked
against official resources, not as downloaded source proof.

The claims are credible because official resources contain matching surfaces:
`AiOperationDefs.BehaviorTree`, `AiOperationTeams` strength gates and caps,
`AllowedOperations`, `OpTeamRequirements`, `AIUnitPrioritizedActions`, behavior
tree user data for unit recruitment, naval operation definitions, and
`PSEUDOYIELD_REPAIR_BONUS`.

RHQ is therefore a baseline for static AI manipulation over autoplay. It is
not a replacement for the external strategy runner because it does not expose
live tactical intent, action validation, postconditions, or adaptive objective
revision for the player's current turn.

The dedicated reference is `rhq-ai-mod-baseline.md`. Load it when designing
static AI A/B experiments, evaluating live database mutation ideas, or comparing
an external strategy runner against native autoplay behavior.

## Short-Horizon Strategy Snapshot

A multi-turn runner needs a read-only planning contract before it needs a new
mutation shortcut. The dedicated reference is
`strategic-planning-snapshot.md`.

The snapshot horizon should stay short, usually 5-10 turns. It should compose
the live HUD, ready-unit/city views, local settlement and unit posture,
UI-equivalent rival comparison, and victory/legacy progress. Its job is to
decide what the agent should inspect and what objectives are currently
plausible. It must expire after turn advance, restart, human input, mutation,
or long-latency reads, and it must never replace operation validators before
send.

## Autoplay Boundary

Native autoplay should be treated as a turn-runner. Official UI automation uses
`Autoplay.setTurns`, `setReturnAsPlayer`, `setObserveAsPlayer`, `setPause`, and
`setActive`, and the game exposes `AutoplayStarted` and `AutoplayEnded` events.
The local CLI wraps this through `game autoplay` with explicit approval and
state verification.

Use autoplay for:

- bounded A/B runs;
- handing control to native AI after a clean turn;
- timing experiments around strategy mods;
- observing whether static AI/resource changes move outcomes.

Do not treat autoplay as a strategy setting API. Starting autoplay does not
tell native AI what victory plan, front, production priority, or tactical
constraint to follow beyond whatever static data and native state already say.

## Architecture Recommendation

Prefer a hybrid architecture:

1. **Static AI profile mod:** small XML/SQL mod slices for coarse native AI
   habits, tested with fixed seeds and bounded autoplay.
2. **External strategy runner:** CLI workflow that owns objectives, reads live
   HUD/snapshots, chooses actions, validates, sends, verifies, and decides when
   to pause or resume autoplay.
3. **Telemetry bridge later:** optional in-game JavaScript that listens to
   turn/autoplay events and exports low-latency observations. Keep it read-only
   until it proves lifecycle, failure recovery, and authority boundaries.

This split lets static mods improve native AI behavior while keeping adaptive
multi-turn strategy in the surface that already has live validation and
postcondition proof.

## Experiments

### Static AI Bias A/B

Create a disposable mod that changes one AI lever. Examples:

- `PSEUDOYIELD_NEW_CITY` or settlement plot evaluation weights for expansion.
- `PSEUDOYIELD_REPAIR_BONUS` for damaged-city repair.
- One naval operation definition or `Create Units` recruitment setting.

Run fixed-seed autoplay in baseline and modded sessions. Record loaded
GameInfo rows, turn count, founded city count and location quality, production
mix, military losses, repair behavior, and whether the expected outcome moved.

Two shortcut surfaces would make this repeatable:

- `game ai loaded-levers`: read the loaded runtime `GameInfo` rows for AI
  operations, allowed operations, favored items, unit priorities,
  pseudo-yields, and relevant behavior-tree assignments before an autoplay run.
- `game ai autoplay-telemetry`: summarize bounded autoplay outcomes using the
  same categories RHQ claims to improve: settlement cadence/distance, naval and
  air unit production/use, repairs, war declarations, city assaults, cavalry
  raids, and independent/city-state attacks.

### External Runner Dry Run

Run a five-turn validate-only strategy loop:

1. Rehydrate or read the HUD.
2. Build a strategic snapshot from ready units, ready cities, visible threats,
   production blockers, diplomacy blockers, and current objectives.
3. Propose actions with reasons and falsifiers.
4. Validate all candidate operations.
5. Do not send; record which decisions would have been made and which inputs
   were missing.

Graduate to a one-turn send test only after the dry run produces complete
validator-backed decisions.

### Telemetry-Only JS Bridge

Create no strategy behavior at first. Listen for `TurnBegin`, `TurnEnd`,
`AutoplayStarted`, and `AutoplayEnded`, then write or expose observations that
the external runner can compare with direct-control reads. Promote it only if
it improves freshness or latency without creating a second mutation authority.

## Falsifiers

Reframe the architecture if any of these become true:

- A supported live runtime API safely mutates loaded AI tables and native AI
  immediately consults the changed rows.
- Local SQLite/debug-copy edits are proven to update the live game database
  with reliable freshness and transaction semantics.
- An in-game JS bridge proves safer and more recoverable than the CLI runner
  for validation, mutation, and postcondition handling.
- Static AI mod A/B runs do not move behavior across repeated fixed-seed tests,
  showing that the chosen resource lever is ignored or overridden.

Until then, do not build strategy around live database writes. Use local
resources and SQLite for enrichment, static mods for load-time AI bias, native
autoplay for controlled turn advancement, and direct-control for adaptive
multi-turn decisions.
