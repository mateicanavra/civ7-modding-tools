# Lane A Report: Save, Log, And Corpus Trace

Agent: Codex
Lane: A - Save, Log, And Corpus Trace
Date: 2026-06-03
Goal: determine how much strategy-relevant game history can be recovered from
`.Civ7Save` files, local logs, debug SQLite/gameplay-state files, and native AI
logs, and classify whether they can support a strategy corpus, turn-by-turn
reconstruction, measured-run scoring, or only partial observation.

## Summary Classification

Current local evidence does not support recovering a complete ordered
turn-by-turn or play-by-play command history from existing `.Civ7Save` files,
debug database copies, or current-session logs. The local sources can support a
strategy corpus only as partial observation and measured-run enrichment unless
future direct-control instrumentation records actions prospectively.

| Source family | Classification | Product outcome |
| --- | --- | --- |
| Forward direct-control traces | Production candidate | Best canonical strategy corpus path, but must be instrumented prospectively. |
| Hall of Fame SQLite | Production candidate for scoring metadata | Good outcome and aggregate scoring labels; not a play-by-play source. |
| `Mods.sqlite` and debug DB copies | Production candidate for run context / loaded-row checks | Good measured-run metadata and static profile verification; not current game history. |
| Native AI CSV logs | Probe candidate / observation-only signal | Some useful turn/player/target/movement facts; current capture is sparse. |
| `ReflectionArchive.log` | Deferred reverse-engineering thread | Rich state/reflection trace with one observed operation payload; no proven complete diary. |
| `GameCoreSerialization.log` | Probe candidate for state schema | Component-size/state-shape map; not semantic action history. |
| `.Civ7Save` files | Deferred reverse-engineering thread | Extractable setup/module/player strings and stable sample windows; no ordered action parser. |
| `LocalStorage.sqlite` | Observation-only signal | UI/mod settings only in current sample. |
| `frontend/colors/images/localization` debug DBs | Observation-only signal | Static catalog support only. |

## Sources Inspected

Repo authority and project docs:

- `AGENTS.md`
- `docs/projects/civ7-intelligence-layer/open-threads-investigation-frame.md`
- `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/PROJECT-civ7-intelligence-layer.md`
- `docs/projects/civ7-intelligence-layer/ai-lever-reference.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-intelligence-layer/agent-reports/README.md`

Official/static resources:

- `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `.civ7/outputs/resources/Base/modules/base-standard/data/AI_Base.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/behaviortrees.xml`
- `.civ7/outputs/resources/Base/modules/age-*/data/AI_*.xml`

Local Civ7 data:

- `/Users/mateicanavra/Library/Application Support/Civilization VII/Saves/**/*.Civ7Save`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/*.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/HallofFame.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/LocalStorage.sqlite`

## Commands And Probes Run

All probes were read-only. No live game action was sent and no Civ7 data file
was modified.

- `git status --short --branch`
- `find ... -name '*.sqlite' -print0 | xargs -0 ls -lh`
- `find .../Saves -type f -name '*.Civ7Save' | wc -l`
- `find .../Saves -type f -name '*.Civ7Save' -print0 | xargs -0 ls -lh`
- `find .../Logs -maxdepth 1 -type f -print0 | xargs -0 ls -lh`
- `sqlite3 <db> "select count(*) ...; select name from sqlite_schema ..."`
- `sqlite3 HallofFame.sqlite` schema, game/player/object, and datapoint probes
- `sqlite3 Mods.sqlite` mod/action/action-item probes
- `sqlite3 gameplay-copy.sqlite` AI/table row-count and schema probes
- `head` over AI CSVs and gameplay CSVs/logs
- `tail -n +2 <csv> | wc -l` over AI and gameplay CSVs
- `file`, `xxd -g 1 -l 256`, `strings -n`, `strings -t d -n`, `shasum`, and
  `cmp -l` over selected `.Civ7Save` files
- `rg` over local logs, project docs, and official resources for save/log/AI
  table and trace terms
- `du -sh` over local `Logs`, `Debug`, and `Saves`

Representative sample files:

- `Saves/Single/auto/AutoSave_00_0018.Civ7Save` through
  `AutoSave_00_0027.Civ7Save`
- `Saves/Single/auto/prev/AutoSave_00_0031.Civ7Save` through
  `AutoSave_00_0040.Civ7Save`
- `Saves/Single/quick/Quick Save.Civ7Save`
- `Saves/Single/Progress.Civ7Save`

## Findings

### 1. Local artifact inventory

- [verified-local] The local Civ7 app directory contains 8 SQLite files:
  `HallofFame.sqlite`, `Mods.sqlite`, `LocalStorage.sqlite`, and debug copies
  `colors-copy.sqlite`, `frontend-copy.sqlite`, `gameplay-copy.sqlite`,
  `images-copy.sqlite`, and `localization-copy.sqlite`.
- [verified-local] The local save tree contains 149 `.Civ7Save` files across
  `Single`, `Multi`, `auto`, `auto/prev`, and `quick` subtrees. A later
  max-depth-limited count saw 121 files, so 149 is the total recursive count
  from the direct save-tree probe.
- [verified-local] Local logs contain 77 files and about 740 MB. The largest
  current files are `ReflectionArchive.log` at about 690 MB,
  `GameEffects.log` at about 13 MB, `output.log` at about 8.4 MB, and
  `UI.log` at about 3.8 MB.
- [verified-local] The debug DB directory is about 34 MB. The save directory is
  about 712 MB.

### 2. SQLite schemas and structure

- [verified-local] `HallofFame.sqlite` has 12 tables: `Games`, `GamePlayers`,
  `GameObjects`, `GameDataPointValues`, `ObjectDataPointValues`,
  `RulesetDataPointValues`, `DataSets`, `DataSetValues`, `Rulesets`,
  `RulesetTypes`, `Migrations`, and `sqlite_sequence`.
- [verified-local] `HallofFame.sqlite` currently has 4 games and 160 game-player
  rows. `Games` includes ruleset, game mode, turn count, game speed, map size,
  map, start age, victor team, victory type, and last played. `GamePlayers`
  includes local/AI/major flags, leader, civilization, difficulty, score,
  player ID, and team ID.
- [verified-local] Hall of Fame data points include aggregate labels such as
  favorite unit, natural wonders discovered, units trained, cities founded,
  wonders constructed, combats, religions founded, units killed/lost, and wars
  declared. Object datapoints include culture, gold, science, population, food,
  production, buildings, districts, and turn founded.
- [verified-local] `Mods.sqlite` has 22 tables and records registered mods,
  properties, scanned files, action groups, actions, and action items. It
  confirms RHQ registration, `AffectsSavedGames = 1`, and RHQ `UpdateDatabase`
  items for behavior trees, diplomacy, operations, settlers, tactical, and
  victory SQL/XML. This is run-context metadata, not gameplay history.
- [verified-local] `LocalStorage.sqlite` has one table, `Values`, with one
  current row: `id = fs://game`, `key = modSettings`, and a JSON-like settings
  value. It does not expose turn/action state in the sampled data.
- [verified-local] `gameplay-copy.sqlite` has 492 tables and is primarily a
  static gameplay catalog/debug copy. Relevant row counts include
  `AiFavoredItems` 927, `AiLists` 364, `AiOperationDefs` 11,
  `BehaviorTrees` 22, `BehaviorTreeNodes` 269, `Strategies` 13,
  `TriggeredBehaviorTrees` 0, `Units` 103, and `UnitOperations` 45.
- [source-backed] Official resources contain the same static AI/control
  families in XML, including `AiLists`, `AiFavoredItems`, `AiOperationDefs`,
  `Strategies`, `Strategy_Priorities`, `BehaviorTrees`, and
  `BehaviorTreeNodes`. These prove static load-time data shape, not runtime
  history.
- [verified-local] `frontend-copy.sqlite`, `colors-copy.sqlite`,
  `images-copy.sqlite`, and `localization-copy.sqlite` are static catalog
  mirrors: frontend setup/challenge/map/leader tables, colors, icons, and
  localized text.

### 3. `.Civ7Save` structure and recoverability

- [verified-local] Sample saves have `CIV7` magic at offset 0 and `file` reports
  them as generic `data`, not SQLite or another recognized container.
- [verified-local] The first 256 bytes of multiple saves expose immediate text
  strings such as `GAMESPEED_STANDARD`, `MAPSIZE_STANDARD` or `MAPSIZE_HUGE`,
  difficulty localization JSON, and local game version text like
  `1.4.0 (1252419)`.
- [verified-local] `strings` on `AutoSave_00_0027.Civ7Save` exposes setup and
  catalog strings including `AGE_ANTIQUITY`, `LEADER_ALEXANDER`,
  `CIVILIZATION_GREECE`, other leader/civilization option lists, DLC/module
  names, and localization JSON.
- [verified-local] The same string scan did not find common direct action
  markers such as `UNITOPERATION`, `Operation`, `Turn`, `LOC_CITY`, or `UNIT_`
  in the selected autosave sample. It found many civ/leader/catalog strings
  but not an accessible command diary.
- [verified-local] Consecutive same-window autosaves
  `AutoSave_00_0018.Civ7Save` through `AutoSave_00_0027.Civ7Save` are similar
  sized files with monotonic growth from about 2,626,743 bytes to 2,673,528
  bytes. `cmp -l` between `00_0026` and `00_0027` shows localized early
  differences and then larger binary differences beginning around offset
  380204.
- [hypothesis] The autosave window can likely support a bounded binary
  diff/reverse-engineering probe for stable chunks and state deltas. Current
  evidence does not identify a chunk schema or ordered action-history section.
- [eliminated] Existing `.Civ7Save` files are eliminated as a near-term source
  for complete ordered human or native-AI action reconstruction. They remain a
  deferred reverse-engineering thread for metadata, state extraction, and
  save-to-save delta analysis.

### 4. Logs and native AI traces

- [verified-local] `AI_BehaviorTreeManager.csv`,
  `AI_CityDevelopment.csv`, `AI_CityDevelopment_RequestLedger.csv`,
  `AI_CityDevelopment_Unit.csv`, `AI_CityYields.csv`,
  `AI_ConstructibleBroker.csv`, `AI_DiplomaticActionBroker.csv`,
  `AI_Market.csv`, `AI_Operation.csv`, `AI_ProjectBroker.csv`,
  `AI_ResearchBroker.csv`, `AI_Resources.csv`, and `AI_UnitBroker.csv` are
  header-only in the sampled current logs.
- [verified-local] Populated AI CSVs in the sampled logs are:
  `AI_Knowledge.csv` with 118 data rows, `AI_MovementPlanning.csv` with 30,
  `AI_Targets.csv` with 82, and `AI_UnitEfficiency.csv` with 207.
- [verified-local] `AI_MovementPlanning.csv` records game turn, player, unit ID,
  category, move lists, and target lists. `AI_Targets.csv` records target type,
  target owner, target ID, and location. These are semantically useful but do
  not show final chosen AI policy or full action order in the current capture.
- [verified-local] Gameplay CSV/log samples include: `CityBuildQueue.csv` 1
  data row, `DiplomacySummary.csv` 40, `Game_Gossip.csv` 95,
  `Game_PlayerScores.csv` 1, `Game_RandomEvents.csv` 1, `Player_Stats.csv` 1,
  `Player_Treasury.csv` 1, and `UnitOperations.log` 1.
- [verified-local] `UnitOperations.log` has the shape
  `Game Turn, Mode, Player, Unit, Operation` and one observed row:
  turn 27, adding a settler `UNITOPERATION_MOVE_TO`.
- [verified-local] `Telemetry.log` records app/game session IDs, campaign setup
  IDs, selected civilizations, activity heartbeats, and at least one unit
  telemetry payload with `UnitType: UNIT_SETTLER`. It is useful for session
  metadata but not a full command trace in the sampled data.
- [verified-local] `GameEffects.log` records modifier/effect processing with
  turn annotations, useful for load/effect diagnostics but not action history.
- [verified-local] `UI.log` confirms UI runtime and resource/script loading
  context, useful for bridge diagnostics but not strategy reconstruction.

### 5. Serialization and reflection traces

- [verified-local] `GameCoreSerialization.log` has 66,438 lines and describes
  serialized game-state component structure and sizes. It includes
  `CurrentTurn`, map components, player manager, city components, unit
  components, unit operations, player stats, diplomacy, resources, visibility,
  and other state families.
- [verified-local] `Serializer.log` records save/load lifecycle events. It
  shows `LoadRecorderState - Skipped (not implemented)` during load and a
  successful quick save at
  `Saves/Single/quick/Quick Save.Civ7Save`. This is evidence against relying on
  a built-in recorder trace in current local logs.
- [verified-local] `ReflectionArchive.log` has 156,210 lines and is a large
  reflection/delta trace. It records current turn 27, sync random seed/call
  count, AI control manager flags by player, player/city/unit instances,
  visibility instances, and one observed `UnitCommand`/`UnitOperation` payload
  with `UNITOPERATION_MOVE_TO`, destination, push turn 27, and activity fields.
- [verified-local] `ReflectionArchive.log` block counts are dominated by
  visibility changes: 8,868 `PLOT_VISIBILITY_CHANGED` blocks, 207
  `BLOCK_FORMATION_ADD_UNIT`, 206 `BLOCK_FORMATION_REMOVE_UNIT`, and one each
  of `BLOCK_UNIT_PLACE`, `BLOCK_UNIT_MOVE`, `BLOCK_UNITS`, and
  `BLOCK_FORMATIONS`.
- [hypothesis] `ReflectionArchive.log` may be parseable into partial state
  deltas and occasional operation events if logging is enabled during a
  controlled run. It is not yet a proven complete turn-by-turn action record.

## Product Implication

The product should not try to behavior-clone past human games from local saves.
Existing saves and logs should be treated as partial state, setup, event, AI
planning, and outcome evidence.

The strategy corpus should be built prospectively from direct-control
instrumentation:

- turn-boundary snapshots;
- proposed actions and strategic intent;
- validator outputs;
- sent operations;
- postconditions and outcome deltas;
- current mod/profile context;
- save/log/Hall-of-Fame enrichment;
- source labels and freshness on every record.

Measured-run scoring is feasible with local artifacts if the run harness
records context. The strongest local scoring bundle is:

- `Mods.sqlite` for loaded/registered mod and profile context;
- `gameplay-copy.sqlite` or runtime `GameInfo` loaded-row checks for static AI
  profile proof;
- AI/gameplay CSVs for partial turn and AI-planning observations;
- direct-control snapshots for actual per-turn state;
- `HallofFame.sqlite` for outcome and aggregate score labels;
- save files as reproducible start/end artifacts or deferred state-delta inputs.

Without forward instrumentation, the local sources support only partial
observation and outcome labeling. They do not support complete play-by-play
reconstruction.

## Safety Risk

- Save/log/debug inspection is read-only and low risk.
- Do not write to local Civ7 SQLite files. Debug copies and `Mods.sqlite` are
  evidence sources, not mutation surfaces.
- Do not advance the live game just to enrich logs. Controlled logging probes
  should use a disposable session or explicit supervisor coordination.
- Treat `ReflectionArchive.log` and save reverse engineering as forensic
  analysis only. Do not build product authority on inferred binary fields until
  parser outputs are validated against live/direct-control observations.
- Log files may contain large session data and should be sampled or parsed with
  bounded commands; avoid copying large logs into docs.

## Source Classifications

| Source | Status | Rationale |
| --- | --- | --- |
| Prospective direct-control trace | Production candidate | Only path that can capture intent, legality, sends, and postconditions at source. |
| `HallofFame.sqlite` | Production candidate for measured-run scoring | Structured outcome/player/object aggregates exist locally. |
| `Mods.sqlite` | Production candidate for run metadata | Structured mod/action metadata and RHQ actions exist locally. |
| `gameplay-copy.sqlite` | Production candidate for static loaded-row context; observation-only for state | Rich static AI/schema mirror, but no current turn action diary. |
| `frontend/colors/images/localization` copies | Observation-only signal | Catalog/support metadata only. |
| Native AI CSVs | Probe candidate | Useful headers and some populated movement/target/planning rows; many files empty in current capture. |
| `UnitOperations.log` | Probe candidate | Semantically high-value shape but only one observed row. |
| `Telemetry.log` | Observation-only signal | Session/campaign/player metadata and sparse unit telemetry. |
| `GameCoreSerialization.log` | Probe candidate | Structured component map for state parser design; not a semantic history. |
| `ReflectionArchive.log` | Deferred reverse-engineering thread | Rich state/delta names and one operation payload, but dominated by visibility dumps and no proven completeness. |
| `.Civ7Save` | Deferred reverse-engineering thread | Metadata and same-game autosave windows exist; no accessible ordered action parser. |
| `LocalStorage.sqlite` | Observation-only signal | Current sample is UI/mod settings only. |

## Exact Next Probes

1. Fixed disposable-run logging probe:
   Start a new disposable game, perform a known scripted sequence of 3-5
   direct-control actions without advancing unrelated state, then inspect
   `UnitOperations.log`, AI CSVs, `Telemetry.log`, `ReflectionArchive.log`, and
   `GameCoreSerialization.log` to check recall, order, and completeness.

2. ReflectionArchive parser spike:
   Build a read-only parser for `ReflectionArchive.log` block boundaries and
   `Writing <type>, Player <id>, obj <id>` records. Extract `Game::Instance`,
   `Player::Instance`, `City*`, `Unit*`, `UnitCommand`, and `UnitOperation`
   records into JSON for one bounded log, then compare against direct-control
   live/snapshot output from the same turn.

3. Autosave delta probe:
   Freeze the `AutoSave_00_0018` through `AutoSave_00_0027` sample window.
   Extract string offsets, header fields, file sizes, and binary diff ranges.
   Attempt to map differences to known turn, city, unit, and operation changes
   from logs/direct-control. Success requires stable named fields or a
   reproducible state-delta extractor, not just differing bytes.

4. Hall of Fame scoring model:
   Define a minimal measured-run score record from `Games`, `GamePlayers`,
   `GameObjects`, `GameDataPointValues`, and `ObjectDataPointValues`. Include
   game ID, ruleset, map, speed, start age, turn count, victory, player score,
   local/AI flag, civ/leader, aggregate datapoints, and object datapoints.

5. Run-context bundle probe:
   Join `Mods.sqlite` mod/action state with a fixed save, Hall of Fame game ID,
   and debug `gameplay-copy.sqlite` AI row hashes. Use this as the provenance
   header for measured-run comparisons.

6. AI log richness probe:
   Find whether Civ7 has local logging/debug settings that increase AI CSV
   population. If enabled safely in a disposable session, verify whether
   `AI_BehaviorTreeManager`, broker logs, `AI_Operation`, and city development
   logs become populated with decisions rather than only headers.

## Bottom Line

Lane A should classify local save/log/debug sources as useful but insufficient
for canonical strategy history. They can support measured-run scoring,
run-context provenance, static loaded-row checks, and partial AI/state
observation. They cannot currently support complete ordered turn-by-turn or
play-by-play reconstruction from existing artifacts.

The product should make forward direct-control instrumentation the canonical
strategy corpus and treat `.Civ7Save`, reflection logs, AI CSVs, and Hall of
Fame records as enrichment/probe sources with explicit claim labels.
