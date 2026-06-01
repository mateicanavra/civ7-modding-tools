## Context

The investigation found one user-facing mismatch and one architecture mismatch.

The user-facing mismatch: Studio presents save/update flows as "preset"
authoring, but the durable shipped-map source is in the repo. Saving a Studio
variant currently writes browser-local state, so authors do not continue editing
the file they opened or the config directory they expect.

The architecture mismatch: a shipped map variant is not one thing in source. It
is a recipe config payload, a TS wrapper, a `tsup` entry, XML map row, modinfo
import item, localization rows, and Studio built-in preset payload. Those
surfaces repeat identity and drift independently.

## Goals / Non-Goals

**Goals:**

- Make `src/maps/configs/*.config.json` the only authored source for shipped
  map variants.
- Encode each shipped map as a JSON config envelope: metadata plus the authored
  flat recipe public config payload. Compiler-owned internals stay behind the
  recipe compile boundary.
- Generate every Civ7 and Studio projection from the canonical config
  directory.
- Make Studio save and save-as operate on repo-backed config files.
- Remove duplicate map identity/config sources after the generator owns them.

**Non-Goals:**

- Do not redesign the standard recipe, stage topology, ecology truth, placement
  contracts, or adapter projection.
- Do not hand-edit generated `mod/` output.
- Do not prove or adopt a single shared map runtime script in this slice.
- Do not require comments inside JSON. Pure JSON remains the roundtrippable
  data source; descriptions belong in schema/docs and generated typing aids.

## Team Design Pass

This change has three review lanes with explicit handoffs.

- OpenSpec/change owner: owns the proposal, target requirements, scope
  boundaries, and closure criteria. Receives evidence from all lanes and has
  final accountability for keeping this one integrated change coherent.
- Config/Studio lane: owns the authoring flow, canonical JSON envelope, schema
  descriptions, public-surface validation, Studio repo-backed load/save/save-as,
  and scratch/import/export disposition.
- Generation/mod lane: owns build enumeration, generated entry modules, `tsup`
  integration, XML/modinfo/text generation, generated-artifact boundaries, and
  Civ7 one-file-per-map constraints.

Interfaces:

- Config/Studio hands the generation lane a validated registry of map entries:
  id, display metadata, recipe id, sort order, latitude bounds, output file
  stem, localization tags/text, and authored recipe config.
- Generation/mod hands Studio the generated built-in config catalog and schema
  references; Studio does not scrape generated `mod/` output.
- Both implementation lanes hand the OpenSpec owner tests, searches, generated
  snapshots, and any stop-condition evidence before closure.

Feedback loops:

- Early generator snapshot review catches duplicate identity before Studio
  work depends on it.
- Studio save-path review catches browser-only persistence before config files
  are converted.
- Adversarial review searches for active source duplicates: hand-written map
  wrappers, `.config.ts` shipped map configs, hardcoded `tsup` entries,
  separate Studio preset payloads, localStorage "real preset" saves, and
  persisted `advanced` compatibility.

## Decisions

### Canonical Map Config Envelope

Each shipped map config is a JSON document under:

```text
mods/mod-swooper-maps/src/maps/configs/<map-id>.config.json
```

The target shape is:

```json
{
  "$schema": "../../../dist/recipes/standard-map-config.schema.json",
  "id": "swooper-earthlike",
  "name": "Swooper Earthlike",
  "description": "An Earth-analogue world...",
  "recipe": "standard",
  "sortIndex": 501,
  "latitudeBounds": {
    "topLatitude": 90,
    "bottomLatitude": -90
  },
  "config": {
    "foundation": {},
    "morphology-coasts": {},
    "ecology-biomes": {}
  }
}
```

The example is structural, not a complete payload. The implementation must
derive the concrete recipe config schema from the recipe contract and must not
hand-maintain a second list of valid stage/step keys.

Required metadata:

- `id`: stable map id and file stem. It must match the file name.
- `name`: English display name source for localization generation.
- `description`: English display description source for localization
  generation.
- `recipe`: recipe id. The first implementation supports `standard`;
  multi-recipe dispatch requires a separate recipe-dispatch requirement before
  implementation broadens this field.
- `sortIndex`: Civ7 map selection order.
- `config`: authored flat recipe public config payload.

Optional metadata:

- `latitudeBounds`: forwarded to SDK `createMap` when present.
- `logPrefix`: only if a shipped map needs a distinct runtime prefix.
- future localization overrides only after a localization design requires
  multiple locales.

### Shipped Configs Are Canonical Configs, Not Preset Overlays

Shipped map files are canonical source configs. They are not partial overlays
that inherit from a separate Studio default or hidden preset. The implementation
must provide a validation gate that compiles each shipped JSON file through the
recipe public surface before generation emits Civ7 artifacts.

Recipe compilation owns defaulted and internal step config. Shipped configs do
not duplicate engine plumbing such as Foundation projection config unless that
step is intentionally promoted into the public authoring surface.

### JSON Is The Source; Schema And Generated Aids Carry Documentation

Pure JSON cannot carry JSDoc comments or participate directly in JSDoc
typechecking. The source of truth remains JSON because Studio must roundtrip it
without preserving comments or executable code. Documentation and authoring
help come from:

- generated JSON schemas with descriptions;
- generated TypeScript types for tooling/tests;
- docs that explain config fields and strategy envelopes;
- validation tests that reject unknown values and source-schema drift.

If an implementation later requires comment-preserving authoring, that is a
separate authority decision because it would change the canonical source format
away from JSON.

### Generated Map Entrypoints Remain Per-Map

Civ7 currently registers maps through file-based map script rows and imports.
This change keeps one generated JS bundle per selectable map. The generator may
emit transient TS entry modules, virtual tsup entries, or another deterministic
build input, but authors do not hand-write `src/maps/<map>.ts` wrappers.

Generated entry modules call the existing SDK `createMap` runtime helper with:

- map id and name;
- selected recipe module;
- stripped schema metadata and validated recipe config;
- optional latitude bounds and log prefix.

### One Registry Generates Civ7 And Studio Projections

The generator enumerates canonical JSON configs, validates them, sorts them,
and produces one registry used for:

- map entry module generation or virtual build entries;
- `tsup` entry configuration;
- `mod/config/config.xml` map rows;
- `.modinfo` `ImportFiles` entries for generated map scripts;
- `mod/text/en_us/MapText.xml` localization rows;
- Studio built-in config catalog;
- tests/snapshots that compare generated outputs against source registry data.

Generated `mod/` files remain read-only outputs. If checked-in generated
outputs are updated, they must be produced by the generator/build script and
reviewed as generated artifacts, not edited directly.

### Studio Uses Configs And Scratch, Not Durable Preset Saves

Studio's source-backed model becomes:

- `Configs`: repo-backed map config files discovered from the canonical
  directory or generated catalog.
- `Save`: writes the selected repo-backed config file.
- `Save As`: writes a sibling `<new-id>.config.json` into the same directory.
- `Scratch`: optional browser-local temporary copies, explicitly labeled as
  non-source and never treated as shipped map variants.
- `Export`: optional download/interchange action, not the primary authoring
  persistence model.

The implementation must choose an explicit write mechanism. Acceptable first
implementations are a local dev-server write API or the browser File System
Access API. A browser-only app silently writing repo paths is not a valid
design because the browser cannot reliably do that.

### FireTuner Restart Is A CLI-Owned Operation

The append-only bridge log remains the protocol boundary with Windows-side
FireTuner automation, but repo code should not duplicate request formatting in
each caller. The CLI owns the Mac-side operation:

```text
civ7 game restart --agent <agent> [--bridge-log <path>] [--request-id <id>] [--wait] [--json]
```

The command appends exactly one bridge request:

```text
REQ <id> AGENT=<agent> RUN Network.restartGame()
```

It resolves the bridge log from `--bridge-log`, then
`CIV7_FIRETUNER_BRIDGE_LOG`, then the Parallels shared-folder default. The
Windows bridge remains responsible for focusing FireTuner, submitting the
command, and writing `ACK`, `RESULT`, or `BLOCKED`. Civ7 logs remain the proof
boundary for actual game reload behavior.

Studio's dev-server save API calls this command after a successful deploy and
uses `--wait --json` so a successful save can distinguish "restart request was
submitted by Windows" from "restart request was only appended." Manual agent
work uses the same command instead of hand-writing log lines, while the
append-only log format remains supported for emergency/manual use.

## Migration Sequence

1. Add the canonical envelope schema and validation helpers.
2. Convert every shipped map config to `.config.json` using the envelope.
3. Add public-surface validation for shipped map configs.
4. Add the map registry generator and generated entry-module/tsup integration.
5. Generate or regenerate XML/modinfo/text/Studio catalog from the registry.
6. Rewire Studio around repo-backed configs and explicit scratch state.
7. Add the CLI FireTuner restart command and route Studio save/deploy/restart
   through it.
8. Delete obsolete TS wrappers, shipped `.config.ts` files, duplicate Studio
   preset payloads, and stale `advanced` compatibility.
9. Promote docs/tests so future shipped maps follow the JSON-only path.

## Risks / Trade-offs

- Canonical JSON configs are more explicit than scratch presets. That
  explicitness is intentional for shipped maps, while compiler-owned internals
  remain generated by the recipe engine.
- Studio repo writes need a local authority surface. This may require a small
  dev-server API even if the browser app otherwise remains static.
- Generated entry modules add a source generation step. This is still simpler
  than maintaining hand-written wrappers because the generated files have one
  owner and one registry input.
- Current XML/modinfo files may not have a source generator. The implementation
  must create one instead of treating existing `mod/` files as source.

## Review Lanes

- Product/DX review: verifies the authoring flow matches expectations: open a
  JSON config, edit in Studio, save the same file, save as a sibling, build
  from that directory.
- Architecture review: verifies MapGen core remains pure, Swooper Maps owns
  mod integration and generated deployment outputs, and generated artifacts
  remain read-only.
- Generator review: verifies deterministic ordering, file names, localization
  tags, modinfo imports, one JS bundle per map, and stale-output cleanup.
- Studio review: verifies browser-local state is scratch-only or removed, and
  no UI labels imply durable save when the repo file is not written.
- Adversarial review: searches for duplicate map identity/config authority,
  partial shipped presets, hidden default dependency, stale `advanced`
  compatibility, and hardcoded map lists.
