# Type Generation Report

Date: 2026-05-31
Lane: Type Catalog Investigator

## Scope And Claim

`@civ7/direct-control` should eventually own a generated capability catalog for
the runtime surfaces it can exercise through App UI and Tuner. That catalog
should not pretend to be a complete Civ7 SDK. It should record what a selected
runtime state exposed, what official resources declare, what `@civ7/types`
already models, and what remains unknown.

The recommended path is a hybrid schema/codegen artifact:

- runtime introspection proves state-specific presence, property descriptors,
  prototype members, native-function metadata, and selected read-only probes;
- official resources provide durable data schemas, enum/type rows, and examples
  of operation/command shapes;
- `packages/civ7-types` remains the type-only ambient declaration package, but
  should consume generated/corroborated catalog slices rather than grow by
  hand-maintained guesses;
- public/community corpora stay as discovery hints unless corroborated by fresh
  runtime probes or official resources.

No generator implementation was added in this lane.

## Evidence Sources And Commands

Repo-local files inspected:

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/AGENTS.md`
- `packages/civ7-types/index.d.ts`
- `packages/civ7-types/AGENTS.md`
- `.civ7/outputs/resources/Base/Assets/schema/**`
- `.civ7/outputs/resources/Base/modules/base-standard/data/*.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
- `.civ7/outputs/resources/Base/modules/core/ui/utilities/utilities-tuner.js`
- `docs/projects/civ7-direct-control/workstream/discovery/public-corpus-report.md`
- `docs/projects/civ7-direct-control/workstream/discovery/app-ui-api-inventory.md`
- `docs/projects/civ7-direct-control/workstream/discovery/tuner-api-inventory.md`

Search/read commands used:

- `git status --short --branch` and `gt status`
- `find packages/civ7-types -maxdepth 4 -type f`
- `find .civ7/outputs/resources/Base -path '*schema*' -type f`
- `rg -n "inspectCiv7RuntimeApi|Civ7RuntimeApi|Object\\.getOwn|getOwnProperty|GameInfo|TypeBox|typebox|generate|schema" ...`
- targeted `sed`/`nl` reads of the files above

No new public web search was needed. Public-source conclusions below rely on the
checked-in public corpus report and inherit its source classification.

## Source Inventory

### Runtime Introspection Evidence

`@civ7/direct-control` already exposes a small runtime inspection shape:
`Civ7RuntimeApiRoot`, `Civ7RuntimeApiMethod`, and
`inspectCiv7RuntimeApi(...)`. The current probe records root existence,
`typeof`, own keys, prototype keys, enumerable keys, method owner, function
`length`, and a short `Function.prototype.toString` signature sample.

This is the strongest evidence for:

- whether a root exists in `App UI` or `Tuner`;
- whether a member is own, prototype, or enumerable;
- whether a member is callable at all;
- selected status values such as map size, turn, alive players, and loading
  state when paired with explicit read-only probes.

It is weak evidence for:

- native function argument names and required parameters;
- return types beyond sampled calls;
- safety of mutation;
- availability outside the probed state and phase.

Existing runtime reports establish the key context split:

- App UI can execute from state id `65535` in the observed session and exposes
  App UI-only roots such as `Network`, `UI`, and `GameContext`.
- Tuner may appear in `LSQ:` before it is command-ready; after Begin Game it
  can evaluate gameplay canaries and exposes gameplay roots such as `Game`,
  `Autoplay`, `GameplayMap`, and `Players`.
- `GameInfo` is dynamic and not discoverable by broad own-key enumeration.

### Official Resource Evidence

Official resources under `.civ7/outputs/resources` are game-data evidence, not
repo architecture. They are still the best local source for data schemas and
stable string identifiers.

High-value inputs:

- `Base/Assets/schema/gameplay/01_GameplaySchema.sql` declares gameplay tables,
  columns, defaults, primary keys, and foreign keys.
- `Base/modules/base-standard/data/maps.xml` shows `Kinds`, `Types`, `Maps`,
  `MapIslandBehavior`, and map/resource modifier rows.
- `Base/modules/base-standard/data/unit-commands.xml` and
  `unit-operations.xml` define command/operation type rows plus UI metadata.
- UI scripts show real call patterns, for example
  `Game.PlayerOperations.canStart(...)`, `sendRequest(...)`,
  `Network.restartGame()`, `UI.notifyUIReady()`, and `GameplayMap` queries.
- `ui/tuner-input/tuner-input.js` is concrete evidence for mutating tuner-panel
  flows via `WorldBuilder.MapPlots.*`, `MapConstructibles.*`, and
  `Game.PlayerOperations.sendRequest(...)`.

Resource evidence is strong for `GameInfo` row/table shape and enum-like
identifiers. It does not prove runtime state availability, function arity, or
that a command is safe to wrap.

### `packages/civ7-types`

`@civ7/types` is currently a type-only ambient package. It models selected
runtime globals, map-generation globals, `GameInfoTable<T>`, map rows, and
virtual `/base-standard/...` imports. The package router says it owns Civ7
runtime type definitions and must keep exports type-only.

This is useful declaration evidence and a natural output target, but the file
is partly hand-curated. For the direct-control catalog, it should be treated as
an existing declaration layer to compare against, not as runtime proof. The
future generator can produce proposed `.d.ts` slices or validation diffs for
this package.

### Public Corpus

The public corpus report found no complete public Civ7 `.d.ts` declaration
source. It identified useful discovery inputs: CDC completions, WildW runtime
dumps, event lists, official/public resource examples, and secondary community
docs. These sources are good autocomplete seeds and sanity checks, but entries
should be labeled `public-community` or `external-hint` until corroborated.

## Generator Options

### Option 1: Runtime Introspection Only

Generate a catalog by running direct-control probes against selected roots in
App UI and Tuner.

Pros:

- closest to what direct-control can actually execute;
- naturally records state id, state name, phase, observed availability, own vs
  prototype members, and live probe failures;
- useful for drift detection across Civ7 updates.

Cons:

- native functions usually expose `length: 0` and `[native code]`, so parameter
  lists remain unknown;
- object graphs can be huge or circular without descriptor-based limits;
- state and phase matter: shell, loading, WaitingForUIReady, post-Begin,
  age-transition, multiplayer, and worldbuilder panels can differ;
- runtime probes can observe mutating methods but cannot classify safety by
  name alone.

Use for: presence, descriptor metadata, observed read-only values, availability
matrices, drift snapshots.

Do not use for: authoritative signatures, complete `GameInfo` table lists, or
automatic write wrappers.

### Option 2: Official Resource Schema/Data Generator

Parse official SQL/XML/JS resource files into table, row, enum, and usage
catalogs.

Pros:

- best source for `GameInfo` schemas, key columns, defaults, foreign keys, and
  enum/type identifiers;
- deterministic and can run without Civ7;
- can produce TypeScript literal unions for operation names, unit commands, map
  sizes, terrain/resource/feature ids, and table row interfaces.

Cons:

- official resources are data evidence, not runtime API proof;
- XML rows may be partial overlays across Base/DLC/modules and require load
  order rules;
- JavaScript call-pattern extraction can infer usage shapes, not native
  signatures;
- generated resource declarations can become very large if every table and row
  literal is emitted.

Use for: `GameInfo` table schemas, enum-like identifiers, operation catalogs,
resource provenance.

Do not use for: proving App UI/Tuner availability or side-effect safety.

### Option 3: `packages/civ7-types` Uplift/Diff

Treat `@civ7/types` as the declaration package and generate candidate diffs
from the runtime/resource catalog.

Pros:

- aligns with existing package ownership;
- keeps direct-control from owning ambient modding declarations;
- supports editor and mod-author ergonomics.

Cons:

- current declarations include hand-authored assumptions and catch-alls;
- generated ambient declarations may overpromise if they do not carry
  provenance/state annotations;
- TypeScript declarations alone cannot express runtime state availability well.

Use for: stable/corroborated declarations and generated review diffs.

Do not use for: the source-of-truth capability catalog itself.

### Option 4: Public Corpus Index

Ingest CDC completions, WildW dumps, public event lists, and secondary docs into
a provenance-labeled index.

Pros:

- broad discovery surface;
- helpful for autocomplete and search before the runtime/resource generator is
  complete;
- WildW-style descriptor dumps are a good model for better runtime probes.

Cons:

- community data may be stale, partial, or from a different game build/state;
- licensing/source provenance must be tracked;
- not authoritative enough for package-owned declarations without
  corroboration.

Use for: hints, search terms, candidate roots, and comparison.

Do not use for: generated first-class types unless promoted by official or
runtime evidence.

### Option 5: Hybrid Schema/Codegen Catalog

Generate one normalized catalog from multiple evidence lanes, then emit
secondary artifacts.

Pros:

- lets runtime observations and resource declarations coexist without blurring
  evidence classes;
- supports JSON catalog, TypeBox schemas, TypeScript type helpers, and
  `@civ7/types` declaration candidates from the same model;
- can mark availability, risk, read/write posture, and confidence per symbol.

Cons:

- requires careful schema design before implementation;
- merge rules must be explicit when runtime, resources, and declarations
  disagree;
- generated outputs need stable ownership and review gates.

Use for: package-owned direct-control catalog and later generated type outputs.

This is the recommended option.

## Recommended Catalog Shape

The source artifact should be a normalized JSON catalog with a checked schema,
owned by `@civ7/direct-control` when implemented. Generated `.d.ts` or ambient
declaration patches should be emitted to, or proposed for, `@civ7/types`.

Suggested top-level fields:

| Field | Meaning |
|---|---|
| `schemaVersion` | Catalog schema version controlled by the package. |
| `generatedAt` | Generation timestamp; avoid using as semantic authority. |
| `gameBuild` | Civ7 build/version if available from runtime/resource metadata. |
| `resourceSource` | Official resources path, submodule commit, and module set. |
| `probeRuns` | Runtime probe ids, host/port, state ids/names, phase labels. |
| `symbols` | Normalized roots, properties, methods, tables, operations, events. |
| `resourceTables` | SQL/XML-derived table schemas and row metadata. |
| `conflicts` | Explicit disagreements between evidence sources. |
| `unknowns` | Known missing metadata and reframe triggers. |

Suggested fields per symbol:

| Field | Meaning |
|---|---|
| `id` | Stable catalog id, for example `runtime.AppUI.Network.restartGame`. |
| `path` | Runtime path such as `Network.restartGame` or `GameInfo.Maps`. |
| `kind` | `root`, `property`, `method`, `table`, `rowType`, `operation`, `event`, `moduleExport`. |
| `surface` | `app-ui`, `tuner`, `map-generation`, `official-resource`, `ambient-types`, or `public-hint`. |
| `availability` | State/phase matrix with observed `present`, `absent`, `timeout`, or `not-probed`. |
| `valueType` | Runtime `typeof`, resource type, and/or TypeScript type. |
| `descriptor` | Own/prototype/enumerable/configurable/writable/getter/setter metadata when observed. |
| `call` | Function metadata: native flag, `length`, sampled source text, inferred params, return probes. |
| `access` | `read`, `write`, `command`, `constructor`, `event`, `data`, or `unknown`. |
| `risk` | Side-effect/risk tier; see below. |
| `confidence` | `runtime-observed`, `official-resource`, `declared`, `public-hint`, or merged values. |
| `provenance` | File paths, line anchors where available, probe id, command snippet, and source class. |
| `examples` | Official resource call examples or safe read-only probe examples. |
| `notes` | Human review notes for limitations or wrapper decisions. |

For `GameInfo` tables, include:

- table name and runtime access path;
- primary key columns;
- columns with SQLite/XML type, nullability, default, and foreign keys;
- row id/type column when known, such as `MapSizeType`, `CommandType`, or
  `OperationType`;
- row count and source modules if generation loads XML overlays;
- emitted TypeScript row interface name and optional literal union name.

## Read/Write/Risk/Availability Marking

Read/write classification should be separate from confidence. A method can be
runtime-observed and still have unknown or high-risk side effects.

Recommended `access` values:

- `read`: getter/property/query with read-only proof or strong naming/resource
  evidence.
- `write`: mutates game/runtime state, such as `WorldBuilder.MapPlots.set*`.
- `command`: sends a game operation/command request, restart, save/load, begin,
  network call, autoplay control, or UI action.
- `data`: resource rows, table schemas, constants, enum-like type ids.
- `event`: event subscription or emitted event names.
- `unknown`: callable or property exists but safety is not established.

Recommended `risk` values:

- `none`: static data or pure local conversion.
- `read-only`: sampled read-only runtime query.
- `local-ui`: affects UI/client state but not save/game state.
- `game-state`: mutates game state, map, units, players, autoplay, or turn flow.
- `file-save-load`: save/load/delete/restart operations.
- `network-account`: online, account, invite, chat, multiplayer, QR, or URL
  actions.
- `destructive`: delete, destroy, kick, reset, overwrite, or irreversible flows.
- `unknown`: insufficient evidence.

Recommended availability dimensions:

- `stateRole`: `app-ui` or `tuner`.
- `stateName` and `stateId`: record observed id but do not treat it as stable.
- `phase`: `shell`, `loading`, `waiting-ui-ready`, `post-begin`,
  `age-transition`, `map-generation`, `worldbuilder-active`, `multiplayer`,
  or `unknown`.
- `result`: `present`, `absent`, `timeout`, `throws`, `not-probed`.
- `evidence`: probe id, source file, or declaration/resource path.

## TypeScript And TypeBox Integration

Use TypeBox for the catalog schema, not as the main way to express Civ7 ambient
globals. This repo already uses TypeBox in MapGen-facing packages, so a
TypeBox-backed catalog schema would give:

- runtime validation for generated JSON catalogs;
- static `Static<typeof CatalogSchema>` TypeScript types for package APIs;
- a JSON-schema export if CLI/Studio/editor tools need to consume the catalog.

Keep the generated ambient declarations type-only in `@civ7/types`. Good later
outputs are:

- `catalog.generated.json` for direct-control/search/UI tools;
- `catalog.generated.d.ts` or source types for catalog consumers;
- `gameinfo.generated.d.ts` for `GameInfo` table row declarations;
- `operations.generated.ts` as literal unions or const arrays for command ids;
- a review report diffing generated declarations against current
  `packages/civ7-types/index.d.ts`.

Do not generate direct-control wrapper methods from the catalog automatically.
Wrapper APIs should still be deliberate package code with explicit state,
timeout, idempotency, and side-effect contracts.

## Recommended Package Ownership

- `@civ7/direct-control` owns the runtime probe implementation, state/phase
  availability evidence, direct-control capability catalog schema, and generated
  catalog artifact.
- `@civ7/types` owns ambient declarations for Civ7 runtime globals and virtual
  modules. It may consume generated resource/runtime facts, but should remain
  type-only.
- Official resources remain evidence inputs under `.civ7/outputs/resources`;
  do not hand-edit them.
- CLI and Studio should consume the package catalog and direct-control helpers;
  they should not implement socket probes or local catalog generation.

## Unknowns And Limits

- Native function signatures remain opaque. `Function.prototype.toString` and
  `length` are useful fingerprints, not reliable argument schemas.
- Opaque runtime objects may have getters with side effects or throw on access;
  descriptor-first probing should avoid invoking getters unless explicitly
  requested.
- `GameInfo` tables are dynamic. Runtime own-key enumeration does not reveal the
  schema; resource parsing and targeted `GameInfo.<Table>.lookup(...)` probes
  are required.
- State availability is contextual. `LSQ:` presence does not prove Tuner command
  readiness, and App UI/Tuner roots differ before and after Begin Game.
- Official SQL/XML schemas may require module/DLC overlay/load-order semantics
  before row counts and final unions are correct.
- Public corpora can seed searches, but should not silently become authoritative
  package declarations.
- Broad runtime dumps can be too large for the tuner socket or terminal output;
  probes need root allowlists, depth limits, cycle handling, output truncation
  flags, and timeout controls.

## Reframe Triggers

- A fresh runtime probe shows Civ7 exposes reliable parameter metadata through a
  native reflection API not currently used.
- Official resources gain complete `.d.ts` or schema metadata for runtime
  globals.
- `GameInfo` table availability differs materially by game state, DLC set, age,
  or mod load order.
- Tuner-panel actions require a FireTuner-injected `g_TunerState` or UI event
  path that direct socket eval cannot create safely.
- Generated catalog size becomes too large for package distribution, forcing a
  split between compact runtime capability catalog and separate resource data
  indexes.
- Wrapper generation is proposed for mutating commands; require a separate
  design/review because catalog evidence is not enough to prove safety.

## Recommendation

Build the future artifact as a provenance-aware hybrid catalog first, then
generate TypeScript declarations from reviewed slices. The catalog should make
uncertainty explicit: runtime-observed availability is not the same thing as an
official resource declaration, and neither is the same thing as a safe
direct-control wrapper.

Near-term implementation order when this becomes package work:

1. Define a TypeBox catalog schema in `@civ7/direct-control`.
2. Upgrade runtime probes to descriptor-first metadata with phase labels and
   root allowlists.
3. Add an official-resource parser for SQL table schemas and selected XML type
   rows.
4. Emit a generated JSON catalog and a human-readable diff/report.
5. Feed stable/corroborated declaration slices into `@civ7/types` only after
   review.
