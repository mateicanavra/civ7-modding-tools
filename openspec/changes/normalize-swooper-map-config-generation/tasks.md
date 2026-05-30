## 1. Authority And Inventory

- [ ] 1.1 Inventory shipped map identity/config occurrences in map wrappers,
  config files, `tsup`, Studio built-ins, XML, modinfo, localization, tests,
  and docs.
- [ ] 1.2 Classify each occurrence as source authority, generated projection,
  test fixture, historical prose, or deletion candidate.
- [ ] 1.3 Record the first implementation as `standard`-recipe-only and defer
  multi-recipe dispatch unless an explicit recipe-dispatch requirement is
  added before implementation.

## 2. Canonical Config Envelope

- [ ] 2.1 Define the canonical shipped map config envelope schema.
- [ ] 2.2 Derive the nested recipe config schema from the recipe contract
  instead of hand-maintaining stage/step keys.
- [ ] 2.3 Add validation that `id` matches the file stem and that metadata can
  generate deterministic file names, localization tags, and map rows.
- [ ] 2.4 Add full-config completeness validation so shipped configs include
  concrete strategy envelopes and config values.
- [ ] 2.5 Document the JSON-first authoring policy and the reason JSDoc
  comments do not live inside canonical JSON.

## 3. Convert Shipped Maps

- [ ] 3.1 Convert `shattered-ring.config.ts`,
  `sundered-archipelago.config.ts`, and `swooper-desert-mountains.config.ts`
  into canonical JSON envelope files.
- [ ] 3.2 Wrap `swooper-earthlike.config.json` in the canonical envelope.
- [ ] 3.3 Ensure every shipped JSON config validates as full and source-complete.
- [ ] 3.4 Remove shipped `.config.ts` map configs after their JSON equivalents
  pass validation.

## 4. Generator And Build Integration

- [ ] 4.1 Add a generator that enumerates canonical config files and emits a
  sorted map registry.
- [ ] 4.2 Generate per-map entry modules or virtual build entries from the
  registry.
- [ ] 4.3 Replace hardcoded `tsup` map entries with generated registry entries.
- [ ] 4.4 Generate `config.xml` map rows from registry metadata.
- [ ] 4.5 Generate `.modinfo` map script imports from registry output files.
- [ ] 4.6 Generate `MapText.xml` localization rows from registry name and
  description metadata.
- [ ] 4.7 Add stale-output cleanup so removed configs cannot leave old map JS,
  XML rows, modinfo imports, or text rows behind.

## 5. Studio Repo-Backed Config Flow

- [ ] 5.1 Generate Studio's built-in config catalog from canonical map config
  files.
- [ ] 5.2 Replace real shipped-map "preset" selection with repo-backed
  `Configs` selection.
- [ ] 5.3 Implement `Save` for the selected repo-backed config file using an
  explicit write authority surface.
- [ ] 5.4 Implement `Save As` to create a sibling `.config.json` file in the
  canonical config directory.
- [ ] 5.5 Remove browser-local preset persistence or relabel it as `Scratch`
  with no shipped-map authority.
- [ ] 5.6 Keep export/import as optional interchange actions, not primary
  source persistence.

## 6. Deletion And Realignment

- [ ] 6.1 Delete hand-written `src/maps/<map>.ts` wrappers for shipped maps
  after generated entries replace them.
- [ ] 6.2 Delete duplicate built-in Studio preset JSON payloads that mirror
  shipped map configs.
- [ ] 6.3 Delete hardcoded map id/name/description/sort-order lists outside
  the generator tests or generated outputs.
- [ ] 6.4 Remove stale persisted `advanced` compatibility paths that no longer
  have active source consumers.
- [ ] 6.5 Update adjacent docs and examples so new shipped maps are authored by
  adding one canonical JSON config file.

## 7. Verification

- [ ] 7.1 Run map config schema/completeness tests for every shipped config.
- [ ] 7.2 Run generator tests or snapshots for entry registry, `config.xml`,
  `.modinfo`, and `MapText.xml`.
- [ ] 7.3 Run `bun run --cwd mods/mod-swooper-maps build:studio-recipes`.
- [ ] 7.4 Run `bun run --cwd mods/mod-swooper-maps build`.
- [ ] 7.5 Run relevant Studio config persistence tests or typecheck.
- [ ] 7.6 Search active source for duplicate map identity/config authority and
  disposition any remaining hits.
- [ ] 7.7 Run
  `bun run openspec -- validate normalize-swooper-map-config-generation --strict`.
- [ ] 7.8 Run `bun run openspec:validate`.
- [ ] 7.9 Run `git diff --check`.
