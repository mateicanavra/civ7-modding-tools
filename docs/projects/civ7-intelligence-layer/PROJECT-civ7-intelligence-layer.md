# Project: Civ7 Intelligence Layer

**Status:** Framed for workstream kickoff
**Timeline:** Begins after direct-control/live-play surface stabilization
**Teams:** Codex workstream lead plus peer investigators for data corpus,
direct-control play, static AI modding, and verification

## Purpose

This document is the operating frame for building a Civ7 intelligence layer:
a strategy corpus and decision system that can improve AI play either by
driving a player through the live direct-control surface or by compiling
strategy knowledge into modded AI database/profile changes.

The core product question is not "can we automate Civ7?" The direct-control
work has already shown that live control is possible. The question is whether
we can make play strategically better by accumulating evidence from official
resources, local runtime artifacts, logs, saves, direct-control observations,
and RHQ-style AI mod patterns, then turn that evidence into reusable strategy.

## Frame

The intelligence layer has two complementary execution lanes:

1. **External live-play intelligence.** An agent observes the current game
   through `@civ7/direct-control`, chooses short-horizon objectives, validates
   legal actions, sends approved operations, and records outcomes. This is the
   strongest near-term path for hotseat and local live play.
2. **Static native-AI profile intelligence.** A generated mod changes Civ7's
   loaded AI data: operation definitions, behavior-tree assignments, team
   requirements, pseudo-yields, tactical priorities, settlement preferences,
   diplomacy biases, and victory/legacy strategies. This improves the native
   AI policy substrate before or during load/age transitions.

Do not collapse these lanes. Direct-control owns adaptive live decisions and
proof-backed sends. Static AI mods own coarse native policy changes. A hybrid
loop can observe games externally and compile better static profiles for later
runs, but live mutation of native AI database rows is not a proven contract.

## Selection And Salience

In scope:

- A source-labeled intelligence corpus for strategy facts, state snapshots,
  action audits, outcome deltas, static AI profiles, mod patches, and run
  metrics.
- A live strategy runner over direct-control reads, validators, sends,
  postconditions, and bounded autoplay.
- Static XML/SQL AI profile mods that tune official AI levers.
- A/B verification harnesses using loaded-row checks and fixed-seed autoplay.
- Investigation of save/log/debug database surfaces as data sources, with
  explicit proof boundaries.

Foregrounded:

- Proof boundaries by source class. Static schema, local debug copies, logs,
  saves, direct-control runtime reads, and public mod claims prove different
  things.
- Forward data capture. Existing local artifacts are useful, but the best
  intelligence corpus will come from instrumented future turns.
- Reusable strategy representations. The product target is a corpus and
  playbook/profile layer, not one-off live play transcripts.

Exterior:

- Unsupported memory-editing tools, live process patching, and blind writes
  into local SQLite files.
- Claims that an opaque save file contains ordered human decisions without a
  parser or schema proving it.
- Claims that a loaded static AI row can be changed mid-game and immediately
  re-read by native AI without a runtime mutation/reload proof.
- Treating native autoplay as a strategy API. Autoplay advances turns under
  whatever policy substrate is already loaded.

## Evidence We Found

Read this section as concrete evidence, not as product direction. The operating
decisions come later.

### Claim Strength And Authority

Use these labels when adding to this project:

| Label | What it can prove | What it cannot prove |
| --- | --- | --- |
| `official-static` | Game schema/resources and load-time database shape | Current runtime row values or behavior outcomes |
| `local-static-copy` | Local catalog/debug copy content and row counts | Fresh live state, legality, or safe mutation |
| `runtime-live` | Current state read through direct-control or live `GameInfo` | Durable history unless persisted separately |
| `forensic-log` | What a bounded log window recorded | Absence of an event, full action order, or current legality |
| `save-snapshot` | Existence of an opaque state snapshot and extractable strings/chunks | Ordered human action intent without a parser |
| `public-mod-claim` | Mod-author intent and plausible lever families | Local loaded rows or measured behavior |
| `local-mod-source` | Concrete SQL/XML edits shipped in a local mod | That the game loaded or used those rows in a run |
| `measured-run` | Outcome under a recorded setup, mod set, and seed/run context | Universal strategy quality |

When sources conflict, prefer direct live runtime proof for current play,
official resources for static schema shape, local mod source for row deltas,
and measured runs for behavior claims. Public claims and logs can seed probes,
but they do not settle product behavior by themselves.

### Active Direct-Control Stack

The active live-play/direct-control work was found in:

```text
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly
```

The branch moved while the investigation was running. It was first observed on
`codex/plan-effect-cli-surface-workstream`, then later clean on
`codex/extract-direct-control-restart-lifecycle-tests`. The stack is large and
includes direct-control extraction, oRPC/control planning, CLI play shortcuts,
HUD/blocker reads, tactical lenses, play-agent references, and restart/lifecycle
test work. Treat that worktree as an active peer worktree; do not mutate it
from this project without an explicit integration step.

The current direct-control package boundary is `packages/civ7-direct-control`.
Its router says it owns developer-process control of a running Civ7 instance
through the tuner socket protocol. CLI, Studio, and future callers must stay
above that package rather than implementing raw socket framing, state discovery,
or reconnect polling locally.

### Live-Play Surface

The repo-owned live-play path exposes enough surface to support an external
strategy runner:

- Session/readiness and local player state through App UI/Tuner snapshots.
- Turn/date, loading, network/session, autoplay, alive players, and map size.
- Notification HUD and blocker materialized views.
- Ready-unit and ready-city views.
- Operation validators and approved send helpers for unit, city, and player
  operation families.
- Tactical lenses for unit target candidates, unit move preview, settlement
  recommendations, battlefield scan, destination analysis, and related context.
- Postcondition and re-read patterns after mutation.
- CLI commands for play priorities, production, unit target, diplomacy,
  narrative/culture/technology choices, end-turn handling, notification
  dismissal, local data inspection, and autoplay.

This proves live play can be driven by an external agent. It does not by itself
create a historical dataset unless the runner persists observations, proposed
actions, sends, and outcome deltas.

### Official Static AI Levers

Official resources and local debug database copies prove that Civ7 AI behavior
is materially data-driven at load time. Important anchors:

```text
.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql
.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml
.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base_Naval.xml
.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml
.civ7/outputs/resources/Base/modules/age-antiquity/data/AI_Antiquity.xml
.civ7/outputs/resources/Base/modules/age-exploration/data/AI_Exploration.xml
.civ7/outputs/resources/Base/modules/age-modern/data/AI_Modern.xml
```

The relevant schema/resource surfaces include:

- `AiFavoredItems`, `AiLists`, and `AiListTypes` for favored items, yields,
  pseudo-yields, budgets, tags, constructibles, governments, diplomatic actions,
  and settlement evaluation biases.
- `AiOperationDefs`, `AllowedOperations`, `AiOperationTeams`, and
  `OpTeamRequirements` for operation eligibility, behavior-tree assignment,
  target requirements, strength gates, and team composition.
- `BehaviorTrees`, `BehaviorTreeNodes`, and `TreeData` for named behavior
  trees, node ordering, and node data.
- `Strategies`, `StrategyConditions`, `Strategy_Priorities`, and
  `Strategy_YieldPriorities` for activation rules and priority list attachment.
- `AIUnitPrioritizedActions`, `AiTactics`, diplomacy tables, settlement
  preferences, pseudo-yields, victory scoring, and game-effect requirements.

This is strong evidence for static AI profile mods. It is not proof of safe
live mutation.

### Local Civ7 Data

Local user data under:

```text
~/Library/Application Support/Civilization VII
```

contains useful sources:

- `Debug/gameplay-copy.sqlite`, `frontend-copy.sqlite`,
  `localization-copy.sqlite`, `images-copy.sqlite`, and `colors-copy.sqlite`.
- `HallofFame.sqlite`.
- `Mods.sqlite`.
- Logs under `Logs/`, including AI telemetry CSVs, `Player_Stats.csv`,
  `Player_Treasury.csv`, `CityBuildQueue.csv`, `DiplomacySummary.csv`,
  `Game_Gossip.csv`, `Game_PlayerScores.csv`, `GameCoreSerialization.log`,
  `Telemetry.log`, and `UnitOperations.log`.
- Saves under `Saves/**/*.Civ7Save`.

The important finding is negative: these artifacts do not currently prove a
complete, durable, per-save, ordered human action history.

Observed data classes:

- `HallofFame.sqlite` has aggregate game/player/object outcome tables such as
  `Games`, `GamePlayers`, `GameObjects`, `GameDataPointValues`, and
  `ObjectDataPointValues`. It can describe outcomes and some game objects; it is
  not an ordered action diary.
- Logs are latest-session or current-run forensic evidence. Some are rich for
  AI/debug telemetry, but current observed action-level logs were sparse.
  `UnitOperations.log` had the shape `Game Turn, Mode, Player, Unit, Operation`,
  but only sparse rows were observed.
- Saves are opaque `.Civ7Save` binary snapshots with a `CIV7` header. Strings
  reveal some setup/state facts, but no stable action-history schema was found.
- Autosave sequences may support state-delta analysis if we build a parser or
  a reliable binary diff pipeline, but they do not directly encode action
  intent/order in an accessible format from current evidence.

### RHQ And Public AI Mod Evidence

The local RHQ mod exists at:

```text
~/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525
```

Key files include:

```text
ai.modinfo
modules/behaviortrees/ai_trees.xml
modules/behaviortrees/ant_ai_trees.xml
modules/data/art_intelligence_core.sql
modules/data/city_strategies.sql
modules/ops/all_ops.sql
modules/ops/ant_ops.sql
modules/ops/exploration_ops.sql
modules/ops/modern_ops.sql
modules/diplomacy/all_diplomacy.sql
modules/settlers/all_settlers.sql
modules/settlers/ant_settlers.sql
modules/tactical/ant_tactical.sql
modules/tactical/exploration_tactical.sql
modules/vict/**/*.sql
```

`Mods.sqlite` confirms RHQ registration and `UpdateDatabase` action items for
its SQL/XML files. RHQ directly updates or inserts rows in the same AI systems
the official schema exposes: favored items, pseudo-yields, operation defs,
operation teams, allowed operations, strategies, strategy conditions, strategy
priorities, diplomacy preferences, settlement scoring, tactical priorities, and
victory/legacy tuning.

Public sources corroborate the modding pattern:

- Official Civ7 support says Steam Workshop and an initial Modding SDK were
  added with Update 1.2.2, but 2K/Firaxis do not endorse, support, or guarantee
  user-created content:
  `https://support.civilization.com/hc/en-us/articles/44037954953235-Civilization-VII-Third-Party-Party-Mods-FAQ`
- RHQ public pages and changelogs claim AI changes through behavior trees,
  operation definitions, team requirements, settlement tuning, tactical
  priorities, pseudo-yields, diplomacy, victory/legacy strategies, and autoplay
  testing:
  `https://steamcommunity.com/sharedfiles/filedetails/?id=3507042742`
  `https://forums.civfanatics.com/resources/rhq-artificially-intelligent-ai-mod.31881/`
- A CivFanatics behavior-tree architecture thread describes the behavior-tree
  system as database-backed and sensitive to node/reference structure:
  `https://forums.civfanatics.com/threads/civilization-7-behavior-tree-system-architecture.695219/`

Public mod claims are advisory until verified against local files, loaded rows,
and bounded behavior outcomes.

## So What: Operating Decisions

### Build The Corpus From Forward Instrumentation

Do not wait for save reverse engineering before building the intelligence
layer. The best first corpus comes from direct-control instrumentation:

- Snapshot every turn and after every mutation.
- Persist the live HUD, blocker, selected/ready unit/city, relevant tactical
  lenses, local player summaries, visible map hashes, and known objectives.
- Persist proposed actions, validator outputs, sent operations, postconditions,
  and outcome deltas.
- Attach source labels and freshness to every record.

Existing local artifacts can enrich this corpus, but they cannot replace it.

### Treat Human History As State/Outcome Evidence, Not Imitation Data

Current saves, logs, and Hall of Fame data can support:

- outcome analysis;
- aggregate performance comparisons;
- save-to-save state-delta experiments;
- map/player/city/unit snapshot enrichment;
- prior-game result labeling.

They do not currently support:

- exact historical action imitation;
- ordered action-intent reconstruction;
- per-save complete command diaries;
- safe live decision authority.

This means the near-term intelligence layer should learn strategy principles
and outcome relationships, not try to behavior-clone old human games.

### Keep Static AI Profiles Small And Verifiable

The static mod lane should begin with one-lever profiles, not a broad AI
overhaul. Good first profile families:

- expansion pressure through `PSEUDOYIELD_NEW_CITY`, settlement cap, and
  settlement plot preferences;
- repair behavior through repair pseudo-yields and city development biases;
- naval or air operation behavior through operation definitions, team
  requirements, allowed operations, and behavior-tree data;
- victory/legacy preference profiles through strategy priority lists;
- diplomacy tendency profiles through diplomatic action biases.

Every profile needs:

- a static diff of rows changed;
- loaded-row proof from the running session;
- fixed-seed baseline/modded runs;
- outcome metrics;
- rollback and save-compatibility notes.

### Use Direct-Control For Adaptive Strategy

Adaptive tactical play belongs in the external runner lane because it already
has the right proof boundary:

- current blocker and notification state;
- current selected/ready unit or city;
- legal validators and placement candidates;
- post-send re-read;
- human input and mutation invalidation;
- bounded/unbounded autoplay control;
- restart rehydration.

The live runner should make short-horizon plans, usually 5 to 10 turns, and
discard them on turn advance, restart, human input, mutation, stale reads, or
changed threat context.

### Build Hybrid Learning As Compile-Time Feedback First

The strongest hybrid shape is:

```text
observe human/direct-control/native-autoplay runs
  -> store source-labeled turn state, action audits, and outcome deltas
  -> infer strategy patterns and candidate bias/profile changes
  -> compile static AI profiles or live-agent playbook rules
  -> run fixed-seed A/B verification
  -> promote only changes that move measured outcomes
```

Do not start with live observer-to-database writes. That is the most fragile
and least supported path.

## Opportunities Worth Pursuing

### Intelligence Database V1

Create a compact data model with these first tables or document collections:

- `source_snapshot`: source path/runtime wrapper, observation time, turn/date,
  proof label, freshness, and hash/version metadata.
- `turn_state`: player, city, unit, map, blocker, notification, diplomacy, and
  progress summaries at a turn boundary.
- `action_audit`: proposed action, validator result, send payload, approval
  reason, postcondition, and stale/failure classification.
- `outcome_delta`: changes between snapshots after an action or turn advance.
- `static_ai_profile`: profile id, intended behavior, modified table families,
  compatibility constraints, and expected metrics.
- `mod_patch`: generated SQL/XML row edits and loaded-row proof.
- `run_metric`: city count, settlement quality, military composition, repair
  behavior, naval/air use, war declarations, city attacks, diplomacy outcomes,
  legacy/triumph progress, and win/loss/end-state summaries.

Keep the schema source-labeled rather than pretending every record has the same
authority.

### Live Strategy Snapshot

Build a `strategic-planning-snapshot` over existing direct-control reads. It
should answer:

- What is blocking the turn?
- What units/cities are actionable?
- What visible threats and opportunities matter now?
- What objective is plausible for the next 5 to 10 turns?
- What candidate actions need validation?
- What would falsify the current plan?

The snapshot is advisory. Sends still go through validators.

### Static AI Profile Compiler

Build a profile compiler only after one-lever experiments prove stable row
families. The compiler should emit small XML/SQL mods, not mutate local debug
databases. It should target known table families and preserve compatibility
metadata by Civ7 version, DLC/mod load set, age, and map context.

### Autoplay A/B Harness

Use bounded autoplay as a measurement tool:

- baseline versus profile;
- fixed setup and seed where possible;
- loaded-row capture before run;
- outcome metrics at turn thresholds;
- multiple runs when randomness is material;
- explicit mod load and patch version records.

Autoplay proves outcomes under a loaded policy. It does not explain every
decision unless paired with AI logs and snapshots.

### Save And Log Research Spike

The save/log lane is worth a bounded spike, but it should not block V1:

- pick a concrete same-game save window first, such as seven consecutive
  autosaves or the smallest available `auto/prev` sequence, and keep the sample
  fixed throughout the spike;
- compare consecutive autosaves from the same game;
- test whether stable chunks or strings map to known city/unit/player state;
- inspect `GameCoreSerialization.log` and `ReflectionArchive.log` for parsable
  component structures;
- sample `Telemetry.log`/`output.log` for event payload families;
- characterize log rotation and per-session retention.

Success means a documented parser or reliable state-delta extractor. Failure
still leaves direct-control forward instrumentation as the canonical corpus.

## Paths That Are Weak Or Unsafe

### Mining Complete Human Play-By-Play From Existing Saves

Current evidence does not support this. Saves are opaque snapshots, not
accessible action journals. It may become possible with reverse engineering,
but the product should not depend on it.

### Using Local SQLite As Live Authority

`Debug/gameplay-copy.sqlite` and related files are valuable catalogs and
debug/static mirrors. They are not a proven live game-state database with
freshness, transaction, and mutation semantics.

### Live Database Writes To Native AI Policy

Static AI tables are moddable at load/update-database time. That does not prove
the running engine will safely consume mid-game writes or reload behavior-tree
graphs, strategy conditions, or pseudo-yield changes. Treat live AI DB writes
as excluded until a specific runtime reload/mutation proof exists.

### Broad AI Overhaul Before One-Lever Proof

RHQ is useful prior art, but it is not a reason to begin with a large overhaul.
Start with one lever, one metric family, and one proof loop.

### Treating Public Mod Claims As Engine Truth

Public Workshop/CivFanatics claims are useful for hypothesis generation. They
become local product evidence only after source inspection, loaded-row proof,
and bounded outcome measurement.

## Under-Investigated Threads

These are not blockers for V1, but they deserve explicit probes:

- `.Civ7Save` structure: whether stable chunks can be decoded into city/unit/
  player state and compared across autosaves.
- Log retention and rotation: whether older sessions are archived elsewhere or
  overwritten in place.
- `ReflectionArchive.log`: whether its large serialized blocks can expose
  useful schema/state descriptions.
- Telemetry payload taxonomy: whether `output.log` or `Telemetry.log` contains
  richer event families than the sampled activity/triumph events.
- Runtime `GameInfo` loaded-row sampling: whether current sessions expose the
  same AI rows as static resources and RHQ files after mod load.
- Behavior-tree generation safety: whether a higher-level profile can safely
  generate `BehaviorTreeNodes`/`TreeData` without invalid graphs.
- Air/naval operation prior art: public AI Air Force Fix patterns should be
  compared with local resources and RHQ once source files are available.
- Native event hooks: whether in-game JavaScript can export low-latency
  telemetry more safely than polling, while remaining read-only.

## Workstream Structure

Use a small peer team with explicit handoffs rather than one broad agent:

1. **Frame and Product Owner.**
   Owns this document, scope discipline, product decisions, and acceptance
   criteria. Accountable for keeping evidence and "so what" separate.
2. **Data Corpus Owner.**
   Owns local data inventory, save/log/debug DB probes, schema design, and
   source-label policy.
3. **Live Runner Owner.**
   Owns direct-control strategy snapshots, command audit persistence,
   validator/postcondition integration, and hotseat play loops.
4. **Static AI Profile Owner.**
   Owns official resource/RHQ row mapping, generated mod patches, load-order
   constraints, and one-lever profile experiments.
5. **Verification Owner.**
   Owns fixed-seed setup, loaded-row checks, autoplay A/B metrics, regression
   proof, and falsifier reporting.

Every long-running peer agent gets a goal-style objective before work begins:

- objective and product frame;
- primary and secondary questions;
- evidence policy and source hierarchy;
- exact read/write boundaries;
- output contract;
- stop and reframe conditions;
- repo hygiene expectations.

Do not delegate long investigations as short search prompts.

## First Implementation Slice

The first slice should avoid save reverse engineering and live AI DB mutation.

Deliver:

1. A read-only corpus schema and local storage location for turn snapshots,
   action audits, outcome deltas, and static AI profile metadata.
2. A direct-control observer that persists per-turn and post-action JSON with
   source labels and freshness.
3. A minimal static AI profile mod changing one expansion or repair lever.
4. A loaded-row check proving the profile is active.
5. A bounded autoplay A/B run with metrics.
6. A short playbook rule generated from observations and used by the live
   runner in validate-only mode.

Acceptance criteria:

- No local SQLite writes.
- No memory/process patching.
- Every mutation goes through a generated mod or validator-backed
  direct-control command.
- Every result states what source class proved it.
- One profile or playbook rule is promoted only if a measured outcome moves in
  the expected direction.

## Reframe Triggers

Reframe this project if any of the following become true:

- A stable `.Civ7Save` parser exposes ordered per-turn action history.
- A supported runtime API safely mutates or reloads native AI policy rows
  mid-game with clear freshness and rollback semantics.
- In-game JavaScript proves it can provide safer telemetry and validation than
  the direct-control runner.
- One-lever static AI profile changes repeatedly fail to move behavior across
  fixed-seed tests, indicating the selected rows are ignored or overridden.
- Direct-control cannot reliably provide fresh validators, postconditions, and
  restart recovery for live play.

Until a trigger fires, the operating architecture is:

```text
direct-control for adaptive live play
official resources and generated mods for static native-AI policy
logs/saves/Hall of Fame/debug DBs for enrichment and forensic analysis
forward instrumentation for the real intelligence corpus
```

## Source Pointers

Repo and worktree evidence:

- `packages/civ7-direct-control/AGENTS.md`
- `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`
- Active live-play worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`
- Official resource submodule:
  `.civ7/outputs/resources`

Local Civ7 evidence:

- `~/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite`
- `~/Library/Application Support/Civilization VII/HallofFame.sqlite`
- `~/Library/Application Support/Civilization VII/Mods.sqlite`
- `~/Library/Application Support/Civilization VII/Logs`
- `~/Library/Application Support/Civilization VII/Saves`
- `~/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525`

External evidence:

- Civ7 third-party mods FAQ:
  `https://support.civilization.com/hc/en-us/articles/44037954953235-Civilization-VII-Third-Party-Party-Mods-FAQ`
- RHQ Steam item:
  `https://steamcommunity.com/sharedfiles/filedetails/?id=3507042742`
- RHQ CivFanatics resource:
  `https://forums.civfanatics.com/resources/rhq-artificially-intelligent-ai-mod.31881/`
- Civ7 behavior-tree architecture thread:
  `https://forums.civfanatics.com/threads/civilization-7-behavior-tree-system-architecture.695219/`
