# Civ7 Intelligence Corpus And Trace Reference

Status: reference synthesis for save/log/debug data.
Updated: 2026-06-03.
Primary lane report:
[agent-reports/save-log-corpus-trace.md](agent-reports/save-log-corpus-trace.md).

This reference separates data-source evidence from the solution architecture.
It records which local artifacts can support a strategy database and which
cannot.

## Bottom Line

The current local artifacts do not provide a complete ordered human or native-AI
play-by-play. They are still valuable as run context, outcome labels, loaded-row
proof, partial AI/state observations, and reproducible start/end artifacts.

The canonical strategy corpus should be recorded prospectively by
direct-control and the strategy layer. Existing saves, logs, debug databases,
and Hall of Fame data should enrich those records rather than replace them.

## Local Artifact Map

| Source | Classification | Useful for | Not useful for |
| --- | --- | --- | --- |
| Prospective direct-control trace | Production candidate | Intent, validation, sends, proof layers, per-turn action history | Past games that were not instrumented |
| Hall of Fame SQLite | Production candidate for scoring | Game/player/object outcomes and aggregate score labels | Ordered action sequence |
| `Mods.sqlite` | Production candidate for run context | Registered mods, action groups, loaded profile provenance | Gameplay decisions |
| `Debug/gameplay-copy.sqlite` | Production candidate for loaded-row context | Static loaded rows, AI profile verification, schema snapshots | Runtime decision diary |
| AI CSV logs | Probe candidate / observation signal | Movement, targets, knowledge, unit efficiency in current sample | Complete native-AI decision trace |
| `UnitOperations.log` | Probe candidate | High-value operation record shape | Complete action history in current sample |
| `ReflectionArchive.log` | Deferred reverse-engineering | State/delta blocks and occasional operation payloads | Proven complete replay without parser |
| `GameCoreSerialization.log` | Probe candidate | State component structure and sizes | Semantic decisions |
| `.Civ7Save` files | Deferred reverse-engineering | Metadata, reproducible state artifacts, binary delta windows | Near-term ordered action reconstruction |
| `Telemetry.log` | Observation signal | Session/campaign IDs and coarse unit telemetry | Action-level strategy history |
| `LocalStorage.sqlite` | Observation signal | UI/mod settings, possible controller mirror evidence | Current game history |

## Corpus Record Shape

The first usable strategy database should record forward evidence at source:

- game/session/run identifiers;
- current turn, player, age, map, seed, mod set, and profile hash;
- live state snapshot and tactical lenses;
- strategy objective and time horizon;
- action candidate, validator result, approval, send payload, proof layer, and
  semantic postcondition when available;
- generated profile recipe and loaded-row proof;
- controller method calls, parity records, intent acknowledgements, and
  visible/logged confirmation when used;
- outcome metrics from Hall of Fame, logs, direct-control snapshots, and
  fixed-seed comparisons;
- evidence label and freshness on every record.

This shape matters because a later model must distinguish "the agent intended
this action" from "the native AI appeared to consider this target" and "the
profile rows loaded".

## Save Files

Local `.Civ7Save` samples have `CIV7` magic and expose setup strings such as
speed, map size, age, leader, civilization, version, DLC, modules, and mods.
Same-game autosave windows show stable file-size progression and binary delta
regions.

The current inspection did not find an accessible ordered command diary. Saves
therefore remain useful as reproducible artifacts and future state-delta inputs,
not as the near-term source of strategy traces.

## Logs

Current local logs are uneven.

Some AI logs are populated enough to be useful enrichment:

- `AI_Knowledge.csv`;
- `AI_MovementPlanning.csv`;
- `AI_Targets.csv`;
- `AI_UnitEfficiency.csv`.

Many high-value logs are header-only in the current capture:

- `AI_BehaviorTreeManager.csv`;
- `AI_Operation.csv`;
- city development and broker logs.

`UnitOperations.log` has a high-value schema and at least one current row, but
that is not enough to treat it as a complete operation journal.
`ReflectionArchive.log` is rich but dominated by visibility/state deltas. It
needs a parser and comparison against a controlled action trace before it can
carry product claims.

## Scoring Bundle

A measured run can be scored without a full replay if the run harness records
the missing intent/action trace. The recommended bundle is:

- direct-control trace for action history and proof layers;
- `Mods.sqlite` for mod/profile context;
- `gameplay-copy.sqlite` or live `GameInfo` for loaded-row proof;
- AI/gameplay CSVs for partial planning and state observations;
- Hall of Fame tables for outcome and aggregate labels;
- save files for reproducible start/end state artifacts.

## Required Probes

1. **Fixed disposable logging run.** Execute a short known direct-control action
   sequence in a disposable game, then compare logs, reflection archive,
   serialization logs, and direct-control trace for order and completeness.
2. **ReflectionArchive parser spike.** Extract bounded state and operation
   records, then validate them against direct-control observations from the
   same turn.
3. **Autosave delta spike.** Freeze a same-game autosave window and attempt to
   map binary/string deltas to known turn, unit, city, and action changes.
4. **Hall of Fame scoring model.** Define the durable score record from games,
   players, objects, and datapoint tables.
5. **AI log richness probe.** Determine whether safe debug settings can make
   AI behavior-tree, broker, and operation CSVs more complete in a disposable
   run.

## Product Boundary

Do not behavior-clone past human games from existing saves. Build the corpus
forward from direct-control and strategy-agent instrumentation, then use local
Civ7 artifacts to enrich, verify, and score those records.
