# Local On-Disk Read Surfaces

## Frame

Local disk reads can enrich live-play support, but they should not replace
direct-control for current decisions. The useful split is:

- Direct-control owns live state: turn blockers, selected/ready entities,
  notification targets, legal operation validation, and runtime `GameInfo`.
- Local disk owns static and forensic evidence: loaded database copies,
  localization/catalogs, mods inventory, save inventory, and bounded log tails.

## Evidence

Observed app-support SQLite files:

```text
/Users/mateicanavra/Library/Application Support/Civilization VII/Mods.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/LocalStorage.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/HallofFame.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/colors-copy.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/frontend-copy.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/images-copy.sqlite
/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/localization-copy.sqlite
```

Proof labels:

- `Debug/gameplay-copy.sqlite` is a SQLite database with 492 tables.
- `Debug/frontend-copy.sqlite` is a SQLite database with 118 tables.
- `HallofFame.sqlite` is a SQLite database with historical `Games`,
  `GamePlayers`, `GameObjects`, and data-point value tables. It can describe
  recorded game/player history, not the active blocker queue or current modal.
- `.civ7/outputs/resources` and the Steam app resources expose XML, SQL schema,
  and UI JavaScript resources, not live SQLite database files.
- Current autosaves under
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Saves` are
  opaque binary data with a `CIV7` header, not SQLite or zip archives.
- Logs under
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs` expose
  useful CSV/log evidence, including `Player_Stats.csv`,
  `Player_Treasury.csv`, `CityBuildQueue.csv`, `CombatLog.csv`, and
  `UnitOperations.log`, but they are append-only observations with stale-read
  risk.

## Norm

Use local SQLite for static catalog enrichment:

- table discovery and row lookup for loaded gameplay/frontend/localization
  data;
- mod inventory from `Mods.sqlite`;
- offline comparison between app-support debug copies and repo
  `.civ7/outputs/resources`;
- stable reference packs for skills.

Use logs only with explicit bounds:

- record file path, mtime, and byte offset/window;
- label the result as logged or forensic evidence;
- do not treat a quiet log search as proof that no live action exists.

Keep direct-control as authority for:

- current end-turn blocker;
- current notification queue and targets;
- selected or first ready unit;
- legal `canStart` operation/command answers;
- live diplomacy action ids and response data;
- live city/unit/player/map state.

## Implemented Shortcut

`game local-data inspect --json` now materializes the local disk evidence layer:

- discovered Civ7 app-support directory;
- SQLite files with mtimes, sizes, and table counts when `sqlite3` is
  available;
- recent save inventory;
- recent log inventory;
- explicit authority labels separating local evidence from live direct-control
  authority.

This is the right first answer to "can we read the same DB locally?" It proves
what is readable on disk and keeps the proof boundary visible.

## Candidate Shortcuts

A later `game play hud --json` or expanded `game play notifications --json`
view should be the play-facing materialized view. It should combine:

- live blocker and selected-entity reads from direct-control;
- validator-backed candidate args for the next known decision family;
- local SQLite/resource labels for ids and type names;
- file mtimes or source versions for any local enrichment;
- a `freshness` field that makes post-mutation and human-input invalidation
  explicit.

The important design point is that local DB data enriches the HUD; it does not
become the HUD's authority for legality.
