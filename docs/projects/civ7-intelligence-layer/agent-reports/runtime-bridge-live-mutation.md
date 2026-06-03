# Runtime Bridge And Live Mutation Lane Report

Agent: Codex
Lane: Lane C, Runtime Bridge And Live Mutation
Date: 2026-06-03

Audit note: the follow-up assumption audit tightened this report's bridge
wording. The current architecture treats the companion path as a subordinate
App UI endpoint, not a peer bridge authority; synchronous App UI RPC is the
baseline; `localStorage` queueing is a later mirror/probe; and the LF public API
proof is game-context App UI evidence, not shell-wide or Tuner-wide evidence.

## Objective

Investigate whether a live companion bridge can safely affect Civ7 or should
only observe, queue, display, and confirm intent; determine whether live
`GameInfo` row reads can be compared against debug database copies after mod
load; and classify the runtime paths for the Civ7 intelligence layer.

## Executive Conclusion

The live bridge should not be treated as an independent action authority. App
UI scripts and Tuner both expose operation APIs that can mutate the game, but
using a companion UI script to call `sendRequest` directly would bypass the
repo's direct-control approval, validation, no-replay, and postcondition
discipline. The product-safe path is:

1. Direct-control remains the only live action owner.
2. The companion path starts as annotation/display, visible/logged
   confirmation, and observation enrichment infrastructure.
3. Any future bridge helper action must be a servant of direct-control: a
   bounded, allowlisted request with an approval token, payload hash, visible
   confirmation, and direct-control postcondition readback.

Live `GameInfo` row readback can be compared against
`Debug/gameplay-copy.sqlite`. I verified current live `GameInfo` rows for
`Resources`, `AiOperationDefs`, `BehaviorTrees`, and `Strategy_Priorities`
against the debug gameplay copy by count and first-row order. That proves the
shape of a loaded-row check. It does not prove native AI re-reads changed rows
mid-game or changes behavior.

Product implication: strategy agents should influence the live game through
`@civ7/direct-control` only. A companion bridge is valuable as helper/observer,
not as live native-AI mutation or raw operation execution authority. Static
native AI influence remains a load/age-bound profile compiler path until a
disposable live-reload probe proves row mutation, native AI re-read, behavior
effect, and rollback.

## Sources Inspected

- `docs/projects/civ7-intelligence-layer/open-threads-investigation-frame.md`
- `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-intelligence-layer/ai-lever-reference.md`
- `docs/projects/civ7-intelligence-layer/rhq-reference.md`
- `packages/civ7-direct-control/AGENTS.md`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/orpc/contracts.ts`
- `packages/civ7-direct-control/src/orpc/router.ts`
- `packages/cli/src/commands/game/exec.ts`
- `packages/cli/src/commands/game/gameinfo.ts`
- `packages/cli/src/commands/game/operation.ts`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/app-ui-surface-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/tuner-surface-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-action-surface.md`
- `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/**/*.js`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/LocalStorage.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/Database.log`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/Modding.log`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/UI.log`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525/`
- selected installed UI mods under `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/`

## Commands And Probes Run

All runtime probes were read-only. I did not advance turns, start autoplay, send
operations, edit map state, write runtime databases, or run destructive tests.

- `git status --short --branch`
- `bun run --cwd packages/cli dev game status --json`
- `bun run --cwd packages/cli dev game health --tuner --json`
- `bun run --cwd packages/cli dev game gameinfo Resources --limit 100 --json`
- `bun run --cwd packages/cli dev game gameinfo AiOperationDefs --limit 50 --json`
- `bun run --cwd packages/cli dev game gameinfo BehaviorTrees --limit 50 --json`
- `bun run --cwd packages/cli dev game gameinfo Strategy_Priorities --limit 50 --json`
- `bun run --cwd packages/cli dev game exec <guarded App UI global probe> --state "App UI" --json`
- `bun run --cwd packages/cli dev game exec <guarded Tuner global probe> --state Tuner --json`
- `sqlite3 .../Debug/gameplay-copy.sqlite` table, schema, count, and sample-row queries
- `sqlite3 .../LocalStorage.sqlite` schema and value-prefix queries
- `rg` searches over repo docs/source, official resources, local logs, and local mods

One Tuner probe used optional chaining on an undeclared global and returned
`ReferenceError: Automation is not defined`. It was immediately rerun with
`globalThis` guards; no state change occurred.

## Findings

### Runtime State And Live Surfaces

- `verified-local`: A live Civ7 session was reachable on `127.0.0.1:4318`.
  `game status` reported `playable: true`, `readiness: "tuner-ready"`,
  App UI state `65535`, Tuner state `1`, turn `27`, date `3350 BCE`, map
  `84x54`, and `autoplay.isActive: false`.

- `verified-local`: App UI exposed `GameInfo`, `Database`, `Automation`,
  `localStorage`, `engine`, `Game`, and `GameContext` as objects. It also
  exposed `engine.on`, `engine.call`, `engine.trigger`,
  `Database.getTableNames`, `Database.getTableData`,
  `Database.getPrimaryKeys`, `Database.query`, `Database.makeHash`, and
  `GameInfo.Resources.lookup`.

- `verified-local`: Tuner exposed `GameInfo`, `Database`, `engine`, and `Game`
  as objects. It exposed the same `engine` and `Database` method families and
  `GameInfo.Resources.length = 55`. In this live session, Tuner did not expose
  `Automation`, `localStorage`, or `GameContext`.

- `verified-local`: Both App UI and Tuner exposed operation routers:
  `Game.UnitOperations.canStart/sendRequest`,
  `Game.UnitCommands.canStart/sendRequest`,
  `Game.CityOperations.canStart/sendRequest`,
  `Game.CityCommands.canStart/sendRequest`, and
  `Game.PlayerOperations.canStart/sendRequest`.

- `source-backed`: Prior direct-control reports classify App UI and Tuner as
  separate domains. App UI owns lifecycle/session/control surfaces such as
  restart, begin, loading status, `Automation`, `GameContext`, `localStorage`,
  and UI-facing helpers. Tuner is the stronger post-Begin gameplay/read surface
  for `GameplayMap`, `Players`, `Units`, `Cities`, `Database`, `GameInfo`, and
  operation-router probing.

### Live GameInfo Versus Debug Database Copy

- `verified-local`: `Debug/gameplay-copy.sqlite` contains AI/profile tables
  relevant to static native AI profile verification, including
  `AiOperationDefs`, `AiTactics`, `AllowedOperations`, `BehaviorTrees`,
  `BehaviorTreeNodes`, `Strategy_Priorities`, `Strategy_YieldPriorities`,
  `TriggeredBehaviorTrees`, and `UnitOperations`.

- `verified-local`: Current live `GameInfo` reads matched the debug gameplay
  copy for several tables:
  - `Resources`: live total `55`; debug count `55`; first rows
    `RESOURCE_COTTON`, `RESOURCE_DATES`, `RESOURCE_DYES`.
  - `AiOperationDefs`: live total `11`; debug count `11`; first rows
    `Attack Enemy City`, `Attack Enemy Independent`, `City Defense`.
  - `BehaviorTrees`: live total `22`; debug count `22`; first rows
    `Simple Coastal Defense`, `Settle New Town`,
    `Build Unit-Linked Constructible`.
  - `Strategy_Priorities`: live total `27`; debug count `27`; first rows match
    the debug copy, including RHQ-added `CD_VICTORY_STRATEGY_CULTURAL` entries.

- `verified-local`: Local logs show RHQ update modules loading before gameplay
  initialization, including `modules/ops/all_ops.sql`,
  `modules/settlers/ant_settlers.sql`, `modules/ops/ant_ops.sql`, and
  `modules/tactical/ant_tactical.sql`. The debug database and live `GameInfo`
  therefore reflect loaded mod data, not only base resources.

- `source-backed`: `GameInfo` row readback is bounded in direct-control through
  `getCiv7GameInfoRows` / `civ7 game gameinfo`, which iterates
  `GameInfo[input.table]` and enforces limit/offset. CLI docs explicitly state
  that it reads targeted `GameInfo` rows without exposing arbitrary SQL.

- `hypothesis`: A generated profile compiler can use this as its loaded-row
  proof path after mod load. The exact disposable proof should add a harmless
  unique row pair such as `AiListTypes.ListType =
  C7IL_PROBE_LISTTYPE_<timestamp>` and `AiLists(ListType, System)` in a
  disabled-by-default probe mod, restart/load a disposable session, then compare
  live `GameInfo.AiListTypes` / `GameInfo.AiLists` against
  `Debug/gameplay-copy.sqlite` for the same primary keys.

- `eliminated`: Debug DB copy comparison alone cannot prove live native AI
  re-read or behavior mutation. It proves the database rows loaded and are
  visible through runtime read surfaces.

### Companion UI Scripts And Operation APIs

- `verified-local`: Installed mods prove `UIScripts` load into the App UI game
  script context. Local logs show `UIScripts` registration for installed mods,
  and mod manifests contain `<UIScripts>` entries.

- `verified-local`: Installed UI scripts use `GameInfo`, `engine.on(...)`,
  and `localStorage`. One local mod warns that using multiple `localStorage`
  keys can break storage reads for every mod, then works around this by sharing
  a single `modSettings` key. Local `LocalStorage.sqlite` has a `Values` table
  and currently stores key `modSettings` under id `fs://game`.

- `verified-local`: Installed UI mod code can call mutating operation APIs.
  The local LF policies/yields preview debug panel calls
  `Game.PlayerOperations.sendRequest(..., PlayerOperationTypes.GRANT_TREE_NODE,
  ...)` and directly changes treasury balance. This confirms companion UI code
  can mutate gameplay if it chooses to.

- `source-backed`: Official UI resources use operation APIs broadly:
  `Game.PlayerOperations.sendRequest` for tech/culture, diplomacy, religion,
  policy, great works, resources, and advanced start; `Game.CityOperations` and
  `Game.CityCommands` for build and purchase; `Game.UnitOperations` and
  `Game.UnitCommands` for unit actions. Official UI commonly uses
  `canStart(...)` before `sendRequest(...)`, but exposed `sendRequest` remains
  a broad mutation surface.

- `source-backed`: `@civ7/direct-control` already implements the safer contract:
  oRPC mutating procedures require approval through
  `requireApprovedMutation`; operation requests validate first, send only if
  validation succeeds, reread validation afterward, and do not automatically
  replay after uncertain mutation.

- `eliminated`: A companion script should not directly own
  `Game.*Operations.sendRequest`, `Game.*Commands.sendRequest`,
  `Game.PlayerOperations.sendRequest`, debug `Players.*` grants, direct
  `Units.*` mutation, `WorldBuilder.*`, `MapConstructibles.*`, raw
  `Database.query`, or `Configuration.edit*` as product action surfaces.

- `probe candidate`: A companion script may call read-only `canStart` or gather
  operation target hints as observation enrichment, provided it is visibility
  filtered, bounded, logged, and treated as advisory. Direct-control should
  still own the final action request.

- `deferred`: A companion helper may eventually execute a bounded operation
  only if direct-control creates the approved action record first and verifies
  postconditions afterward. The bridge must not become raw LLM JavaScript
  execution or a hidden replacement for validators.

### Native AI Live Mutation

- `source-backed`: Static AI levers are real load-time data surfaces:
  strategies, strategy priorities, favored lists, pseudo-yields, operation
  definitions, operation teams/limits, tactics, behavior trees, and triggered
  behavior-tree schema.

- `verified-local`: RHQ modifies those surfaces through SQL/XML loaded by
  `UpdateDatabase`; it is a static native-AI profile overhaul, not a live
  controller. Its `ui/change_banner.js` is zero-byte in this local copy, and no
  external message reader or active runtime bridge was found.

- `hypothesis`: A live script might observe rows and might be able to call
  gameplay operations, but no inspected source or live probe showed a supported
  API to mutate `GameInfo` rows in memory and force native AI to re-read them
  mid-game.

- `eliminated`: Treating `Database.query` or debug database files as a live
  mutation path is unsafe and unsupported. The debug copy is evidence, not an
  action target. Blind writes to local SQLite files are outside the product
  boundary.

## Product Implication

Strategy agents can influence live play through direct-control with validated
operations and postconditions. They should not assume they can influence live
native AI policy through a companion bridge or mid-game database mutation.

The bridge's first product role should be:

- intent queue;
- in-game annotation and plan display;
- visible/logged confirmation;
- observation enrichment through `GameInfo`, `Game`, `GameplayMap`,
  `engine.on(...)`, and bounded `canStart` hints;
- optional helper affordance only after direct-control approval and
  postcondition contracts are preserved.

The bridge should not first serve:

- live native-AI policy mutation;
- hot-reloaded behavior trees;
- arbitrary external JS execution;
- direct operation sends owned by the UI mod;
- raw SQL or debug database writes.

## Safety Risk

High-risk surfaces:

- `Game.*Operations.sendRequest` and `Game.*Commands.sendRequest`;
- `Game.PlayerOperations.sendRequest`, especially diplomacy, war,
  resource assignment, progression grants, create/destroy element, and
  extended-game operations;
- direct `Units.*`, `Players.*`, `WorldBuilder.*`, `MapConstructibles.*`, and
  `Visibility.*` mutation helpers;
- `Automation`/autoplay start or stop outside explicit approval;
- `Database.query` if exposed as raw SQL;
- `localStorage` as a bridge queue without namespacing and collision proof.

Primary safety control: keep live action in `@civ7/direct-control`; make bridge
inputs data, not executable code; require allowlists, request ids, payload
hashes, visible confirmation, no automatic replay, and direct-control
postcondition readback for any future helper action.

## Path Classification

| Runtime path | Classification | Rationale |
| --- | --- | --- |
| Direct-control live reads: status, map, players, units, cities, `GameInfo` | production candidate | Existing package wrappers and live read-only probes are bounded and source-backed. |
| Live `GameInfo` versus `Debug/gameplay-copy.sqlite` loaded-row comparison | production candidate after one disposable marker-row probe | Current counts/sample rows match; exact generated-profile probe still needed. |
| App UI companion `UIScripts` loading | production candidate for observation/display | Installed mods and logs prove UI scripts load. |
| App UI global/transient intent variable | probe candidate | Low persistence and low collision risk, but companion receipt/logging still needs proof. |
| App UI `localStorage` intent queue | probe candidate | Durable and visible to UI scripts, but local evidence shows key-collision risk. |
| `engine.on(...)` event observation | observation-only signal / production candidate for enrichment | Official and local scripts use it; event payload contract must be recorded per event. |
| Companion annotations, overlays, visible confirmations | production candidate after cleanup proof | Fits App UI domain and does not require gameplay mutation. |
| Companion `canStart` advisory checks | probe candidate | Likely read-only and useful, but must be visibility filtered and bounded. |
| Companion-owned `sendRequest` gameplay actions | eliminated path as independent authority | Weakens direct-control approval/postcondition discipline. |
| Direct-control-approved bridge helper action | deferred probe candidate | Possible only with tokenized request, allowlist, logging, and direct-control postcondition readback. |
| `Automation`/autoplay from bridge | deferred / direct-control-only action | App UI exposes `Automation`; mutating simulation control needs explicit direct-control approval. |
| Raw `Database.query` as read helper | probe candidate only with SELECT policy | Exposed in both states, but current safer wrapper avoids arbitrary SQL. |
| Raw `Database.query` or debug DB writes as mutation | eliminated path | Unsupported, unsafe, and outside product boundary. |
| Live native AI row/behavior-tree mutation | deferred reverse-engineering thread | No supported live mutation plus native re-read evidence. Needs disposable falsifier. |
| Static AI profile compiler at load or age boundary | production candidate outside Lane C | Static surface is proven by resources/RHQ; behavior effect still needs A/B measurement. |

## Exact Next Probes

1. `GameInfo` loaded-row marker probe:
   - Create a disposable, disabled-by-default probe mod with unique rows:
     `AiListTypes(ListType = C7IL_PROBE_LISTTYPE_<timestamp>)` and
     `AiLists(ListType = same, System = C7IL_PROBE_SYSTEM)`.
   - Load a disposable session with the probe enabled.
   - Run `bun run --cwd packages/cli dev game gameinfo AiListTypes --lookup <key> --json`
     and `bun run --cwd packages/cli dev game gameinfo AiLists --filter ListType=<key> --json`.
   - Query `Debug/gameplay-copy.sqlite` for the same keys.
   - Success: live `GameInfo` and debug copy both show the rows with matching
     primary keys and values.

2. Companion receipt probe:
   - Add a minimal companion `UIScripts` probe in a disposable mod.
   - Direct-control sets a transient App UI global such as
     `globalThis.__C7IL_INTENT_PROBE = { requestId, message, createdTurn }`.
   - Companion reads it on a timer or event, logs a visible harmless
     confirmation, and exposes last-seen state.
   - Direct-control reads the confirmation back. Success proves intent receipt,
     not action authority.

3. `localStorage` queue probe:
   - Use a single shared key, preferably `modSettings`, with a nested
     `c7ilIntentQueue` namespace to avoid the observed multi-key risk.
   - Write a small bounded queue payload from direct-control in App UI.
   - Companion reads and acknowledges by updating only the nested namespace.
   - Success requires `LocalStorage.sqlite`, UI log, and direct-control readback
     agreement.

4. Companion event observation probe:
   - Register `engine.on("PlayerTurnActivated", ...)` or another already
     observed official event in a companion script.
   - Do not advance the current shared game for this lane; run in disposable
     or wait for natural event occurrence.
   - Success records event name, payload shape, current turn/player, and log
     line.

5. Direct-control-approved helper-action probe:
   - Use a disposable session only.
   - Direct-control selects one low-blast-radius action, such as unit
     skip/sleep, runs validator, creates an approved request id with payload
     hash, and writes it to the companion.
   - Companion displays/acknowledges and, only for this proof, calls the exact
     allowlisted `sendRequest`.
   - Direct-control rereads unit state and marks the result verified or
     unresolved. Failure or uncertain postcondition eliminates bridge execution
     for product use.

6. Live native-AI reload falsifier:
   - Disposable session only.
   - Add a visible, non-destructive AI profile marker and prove loaded-row
     visibility first.
   - Attempt only a supported reload or load-boundary change, not debug DB
     writes.
   - Success would require four facts: row changes visible live, native AI
     component re-reads the row, behavior changes in a measurable way, and
     rollback/disable works. Anything less keeps live native-AI mutation
     deferred or eliminated.

## Final Recommendation

Keep the solution boundary as direct-control for live action and static profile
compiler for native AI shaping. Promote the companion bridge only as
helper/observer first. Do not give strategy agents a bridge operation-send
tool. If later probes justify helper action, expose it as a direct-control
subordinate with explicit approval, allowlisted operation families, visible
confirmation, no replay, and postcondition verification.
