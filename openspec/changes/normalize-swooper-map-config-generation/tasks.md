## 1. Authority And Inventory

- [x] 1.1 Inventory shipped map identity/config occurrences in map wrappers,
  config files, `tsup`, Studio built-ins, XML, modinfo, localization, tests,
  and docs.
- [x] 1.2 Classify each occurrence as source authority, generated projection,
  test fixture, historical prose, or deletion candidate.
- [x] 1.3 Record the first implementation as `standard`-recipe-only and defer
  multi-recipe dispatch unless an explicit recipe-dispatch requirement is
  added before implementation.

## 2. Canonical Config Envelope

- [x] 2.1 Define the canonical shipped map config envelope schema.
- [x] 2.2 Derive the nested recipe config schema from the recipe contract
  instead of hand-maintaining stage/step keys.
- [x] 2.3 Add validation that `id` matches the file stem and that metadata can
  generate deterministic file names, localization tags, and map rows.
- [x] 2.4 Add public-surface validation so shipped configs carry authored
  strategy/config values while compiler-owned internals stay compiled.
- [x] 2.5 Document the JSON-first authoring policy and the reason JSDoc
  comments do not live inside canonical JSON.

## 3. Convert Shipped Maps

- [x] 3.1 Convert `shattered-ring.config.ts`,
  `sundered-archipelago.config.ts`, and `swooper-desert-mountains.config.ts`
  into canonical JSON envelope files.
- [x] 3.2 Wrap `swooper-earthlike.config.json` in the canonical envelope.
- [x] 3.3 Ensure every shipped JSON config validates against the canonical map
  envelope and standard recipe public surface.
- [x] 3.4 Remove shipped `.config.ts` map configs after their JSON equivalents
  pass validation.

## 4. Generator And Build Integration

- [x] 4.1 Add a generator that enumerates canonical config files and emits a
  sorted map registry.
- [x] 4.2 Generate per-map entry modules or virtual build entries from the
  registry.
- [x] 4.3 Replace hardcoded `tsup` map entries with generated registry entries.
- [x] 4.4 Generate `config.xml` map rows from registry metadata.
- [x] 4.5 Generate `.modinfo` map script imports from registry output files.
- [x] 4.6 Generate `MapText.xml` localization rows from registry name and
  description metadata.
- [x] 4.7 Add stale-output cleanup so removed configs cannot leave old map JS,
  XML rows, modinfo imports, or text rows behind.

## 5. Studio Repo-Backed Config Flow

- [x] 5.1 Generate Studio's built-in config catalog from canonical map config
  files.
- [x] 5.2 Replace real shipped-map "preset" selection with repo-backed
  `Configs` selection.
- [x] 5.3 Implement `Save` for the selected repo-backed config file using an
  explicit write authority surface.
- [x] 5.4 Implement `Save As` to create a sibling `.config.json` file in the
  canonical config directory.
- [x] 5.5 Remove browser-local preset persistence or relabel it as `Scratch`
  with no shipped-map authority.
- [x] 5.6 Keep export/import as optional interchange actions, not primary
  source persistence.
- [x] 5.7 Route repo-backed save restarts through the reusable
  `civ7 game restart` command instead of duplicating FireTuner bridge append
  logic in Studio.

## 6. Deletion And Realignment

- [x] 6.1 Delete hand-written `src/maps/<map>.ts` wrappers for shipped maps
  after generated entries replace them.
- [x] 6.2 Delete duplicate built-in Studio preset JSON payloads that mirror
  shipped map configs.
- [x] 6.3 Delete hardcoded map id/name/description/sort-order lists outside
  the generator tests or generated outputs.
- [x] 6.4 Remove stale persisted `advanced` compatibility paths that no longer
  have active source consumers.
- [x] 6.5 Update adjacent docs and examples so new shipped maps are authored by
  adding one canonical JSON config file.

## 7. Verification

- [x] 7.1 Run map config schema/public-surface tests for every shipped config.
- [x] 7.2 Run generator tests or snapshots for entry registry, `config.xml`,
  `.modinfo`, and `MapText.xml`.
- [x] 7.3 Run `bun run --cwd mods/mod-swooper-maps build:studio-recipes`.
- [x] 7.4 Run `bun run --cwd mods/mod-swooper-maps build`.
- [x] 7.5 Run relevant Studio config persistence tests or typecheck.
- [x] 7.6 Search active source for duplicate map identity/config authority and
  disposition any remaining hits.
- [x] 7.7 Run
  `bun run openspec -- validate normalize-swooper-map-config-generation --strict`.
- [x] 7.8 Run `bun run openspec:validate`.
- [x] 7.9 Run `git diff --check`.
- [x] 7.10 Run focused CLI restart command tests and a `--dry-run` command
  smoke before collecting live FireTuner bridge evidence.
