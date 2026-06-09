# Local Catalog Enrichment

Status: `active-reference`.

## Frame

The local SQLite files are real and useful. They are not, by current evidence,
the same thing as a safe live-turn control API.

Use them as static catalog authority: names, type ids, localization, costs,
categories, UI text, and cross-reference joins. Keep direct-control as the live
runtime authority for the current blocker, selected entities, validators, send
args, and postconditions.

The blocker is not SQLite readability. `sqlite3` can read the debug copies from
disk. The blocker is freshness and semantics: the files found on disk are
debug/catalog/history surfaces, while the game process owns the mutable turn
state and the validator APIs.

## Evidence Snapshot

Observed local catalog counts:

| Surface | Evidence |
| --- | --- |
| `Debug/gameplay-copy.sqlite` | 492 tables |
| `Debug/frontend-copy.sqlite` | 118 tables |
| `Debug/localization-copy.sqlite` | `LocalizedText` has 41,837 rows |
| `gameplay-copy.sqlite.Types` | 13,714 rows |
| `gameplay-copy.sqlite.Units` | 103 rows |
| `gameplay-copy.sqlite.Constructibles` | 107 rows |
| `gameplay-copy.sqlite.Projects` | 11 rows |
| `gameplay-copy.sqlite.Traditions` | 500 rows |
| `gameplay-copy.sqlite.ProgressionTreeNodes` | 230 rows |
| `gameplay-copy.sqlite.Notifications` | 133 rows |
| `gameplay-copy.sqlite.DiplomacyActions` | 42 rows |

These are exactly the kinds of tables that should make HUD output more
readable. They can explain what a type, notification, unit, constructible,
tradition, or diplomacy action means without asking the UI to enumerate a large
catalog every time.

## Authority Split

| Question | Preferred authority | Why |
| --- | --- | --- |
| What blocker is stopping end turn right now? | Direct-control notification HUD | Needs current runtime queue and freshness after the last click/send. |
| What selected or first-ready unit/city exists right now? | Direct-control ready views | Selection and ready state are live UI/runtime facts. |
| Is this operation legal with these args? | Direct-control validator | `canStart` is contextual and can change after mutations, animations, or human input. |
| What does this type id or hash mean? | Local SQLite or runtime `GameInfo` | Static catalog lookup; safe to cache with source metadata. |
| What text should explain this notification or item? | Local localization/catalog files | Static enrichment; useful for agent-readable HUD labels. |
| What happened in a previous completed game? | `HallofFame.sqlite` and logs | Forensic/history evidence, not current legality. |
| What is in the currently loaded mod/resource set? | Runtime `GameInfo`, then local copies/resources | Runtime wins when loaded set or patch state may differ from copied files. |

## Norm

1. Read the play HUD first for the live decision family.
2. Enrich the HUD from local SQLite/resource catalogs when ids, hashes, names,
   categories, costs, or text are missing.
3. Keep source labels on enriched fields, such as `source: "local-catalog"` or
   `source: "runtime-gameinfo"`.
4. Re-run the live validator before any send. A catalog row proves an option
   exists; it does not prove this player can choose it now.
5. Invalidate live-layer HUD data after every send, visible human input, turn
   advance, or long-latency read. Static catalog enrichment can stay cached.

## Shortcut Candidates

Good next CLI surfaces:

- `game local-data inspect --json`: read-only app-support inventory with
  database paths, mtimes, sizes, table counts, save inventory, and useful log
  mtimes. This answers "what local evidence exists?" without implying live
  control.
- `game local-catalog lookup <table> <key> --json`: bounded local catalog lookup
  for common tables such as `Types`, `Units`, `Constructibles`, `Notifications`,
  `Traditions`, and localization text.
- `game play notifications --json` enrichment: keep the existing live HUD as
  the agent-facing surface, but attach local labels and explanations when the
  live blocker exposes ids or hashes.

Avoid a shortcut that reads local SQLite and directly chooses a live action.
That would collapse static existence into live legality, which is exactly the
failure mode the HUD is meant to prevent.

## Open Edges

Before promoting local SQLite into more than enrichment, prove:

- which debug-copy files refresh while a live game is running;
- whether mtimes or transaction behavior give a reliable freshness contract;
- how mod/DLC/patch resolution differs between runtime `GameInfo` and local
  copies;
- whether a save parser can expose current turn state faster than direct-control
  without stale reads.

Until those are answered, local SQLite should reduce UI enumeration and improve
explanations, not replace runtime polling.
