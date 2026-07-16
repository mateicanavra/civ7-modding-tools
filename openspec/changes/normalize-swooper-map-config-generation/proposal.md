## Why

Swooper Maps now has the flat recipe config surface, but shipped map variants
still do not have one durable source of truth. A map's identity and config are
split across JSON/TS config files, hand-written `src/maps/<map>.ts` wrappers,
hardcoded `tsup` entries, generated XML/modinfo/text output, and Studio
browser-local preset storage. That shape makes Studio save behavior misleading:
saving a "preset" does not update the repo config authors are actually working
on, and adding or modifying a shipped map requires editing several unrelated
surfaces by hand.

The next correct slice is to make
`mods/mod-swooper-maps/src/maps/configs/*.config.json` the only authored source
for shipped map variants, then generate all Civ7 and Studio projections from
that directory.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Target Shape, Problem Layer 2, Problem Layer 3, Domino 1, and the generated
  artifact boundary.
- `openspec/config.yaml`: default stage config is flat; generated outputs are
  proof, not policy.
- `openspec/specs/change-management/spec.md`: OpenSpec is downstream of
  accepted authority and changes must name owners, protected paths, stop
  conditions, and verification gates.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: first-party
  persisted config consumers use the flat config surface.
- `docs/system/mods/swooper-maps/architecture.md`: Swooper Maps owns
  game-facing map integration, source recipe content, and deployment package
  generation.

## What Changes

- Define one canonical JSON map config envelope under
  `mods/mod-swooper-maps/src/maps/configs/*.config.json`.
- Require shipped map configs to be authoritative source configs, not partial
  preset overlays: every shipped map file carries metadata plus the authored
  public recipe config payload. Recipe compilation remains responsible for
  defaulted/internal step config such as projection plumbing.
- Convert all shipped map variants to canonical JSON files and remove shipped
  `.config.ts` variants.
- Replace hand-written per-map TS wrappers and hardcoded build entries with a
  generator that enumerates canonical config files and creates the transient or
  generated map entry modules needed for one Civ7 JS bundle per map.
- Generate or regenerate Civ7 map registration surfaces from the same registry:
  `mod/maps/*.js`, `mod/config/config.xml`, `.modinfo` map imports, and map
  localization rows.
- Generate Studio's built-in config catalog from the same canonical config
  files.
- Rework Studio's save model so repo-backed configs can be loaded, edited,
  saved in place, and saved as sibling config files; browser-local storage is
  either removed or clearly demoted to scratch state.
- Provide a repo CLI command for the FireTuner restart bridge so Studio saves
  and manual agent restarts use one request format, one AGENT attribution path,
  and one optional wait-for-Windows-result implementation.
- Remove duplicate built-in preset payloads and stale `advanced` compatibility
  logic that only exists for obsolete persisted config shapes.

## Capabilities

### New Capabilities

- Repo-backed shipped map config authoring for Swooper Maps.
- Config-driven Swooper map artifact generation.
- Studio save/save-as flow for repo-backed map configs.

### Modified Capabilities

- Swooper Maps map generation: shipped maps are generated from canonical JSON
  config files instead of hand-written map wrapper files.
- MapGen Studio config editing: built-in map configs are source-backed configs,
  not durable browser-local presets.
- MapGen normalization workstreams: extends D1 from "flat persisted config
  shape" to "single first-party shipped-map config authority".

## Dependencies

- Requires: `normalize-config-surface` and the completed standard-recipe flat
  config migration.
- Requires: `normalize-core-studio-dx-boundaries` so Studio consumes recipe
  config schema/default contracts from intentional source-visible or generated
  contract owners.
- Requires: `normalize-sdk-mapgen-runtime-entrypoint` and current SDK
  `createMap` runtime entrypoint behavior, because Civ7 still appears to load
  one JS file per selectable map.
- Enables parallel work:
  - independent map tuning through JSON-only config edits;
  - later Studio UX cleanup after repo-backed config persistence exists;
  - later generated-mod packaging hardening after map registry generation
    exists.

## Forbidden Non-Goals

- No hand-edited generated `mod/` artifacts.
- No single shared runtime JS file for all maps until in-game evidence proves
  Civ7 can dispatch the selected map safely without one script per map.
- No durable browser-local "preset" path for shipped maps.
- No TS config files for shipped map variants once canonical JSON is available.
- No dual source of truth where map id/name/description/sort order is repeated
  in TS wrappers, `tsup`, XML, modinfo, text, and Studio payloads.
- No duplicate shipped-map preset overlays. Canonical configs may omit
  compiler-owned internal step config when the recipe public surface compiles
  it deterministically.
- No revival of persisted `advanced` config wrappers.

## Impact

- Affected owners:
  - Swooper Maps mod: canonical config files, generated map entry sources,
    package build scripts, XML/modinfo/text generation.
  - MapGen core/authoring: config/schema validation and public-surface
    compilation checks if existing validation does not cover them.
  - MapGen Studio: repo-backed config catalog, load/save/save-as UX, scratch
    demotion, import/export naming.
  - SDK runtime: consumed by generated entry modules, but `createMap` behavior
    should not change unless implementation discovers a bounded runtime API
    gap.
- Expected write set:
  - `openspec/changes/normalize-swooper-map-config-generation/**`
  - `mods/mod-swooper-maps/src/maps/configs/**`
  - `mods/mod-swooper-maps/src/maps/**` generated-entry source location or
    generator-owned replacement
  - `mods/mod-swooper-maps/scripts/**`
  - `mods/mod-swooper-maps/scripts/tsup.config.ts`
  - `mods/mod-swooper-maps/test/**`
  - `apps/mapgen-studio/src/**`
  - adjacent MapGen/Swooper docs
- Protected paths:
  - generated `mods/mod-swooper-maps/mod/**` except through generation scripts;
  - generated `dist/**`;
  - recipe stage topology, ecology truth, placement, and adapter projection
    internals except direct config/schema fallout.
- Stop conditions:
  - Civ7 map selection cannot be proven from generated per-map entry files;
  - Studio cannot write repo files without a dev-server/File-System-Access
    authority decision;
  - a shipped config cannot be represented as canonical JSON without a schema
    or authoring-contract gap;
  - generated XML/modinfo/text cannot be reproduced deterministically from the
    canonical registry.
- Verification gates:
  - `bun run openspec -- validate normalize-swooper-map-config-generation --strict`;
  - `bun run openspec:validate`;
  - map config schema and public-surface validation tests for every shipped
    config;
  - generator tests or snapshots for entry-module registry, `config.xml`,
    `.modinfo`, and map localization rows;
  - `bun run --cwd mods/mod-swooper-maps build:studio-recipes`;
  - `bun run --cwd mods/mod-swooper-maps build`;
  - relevant Studio config persistence tests or typecheck;
  - search proving removed duplicate source surfaces are gone or generated;
  - `git diff --check`.
