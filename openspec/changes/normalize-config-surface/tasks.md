## 1. Inventory

- [ ] 1.1 Inventory active `advanced` config wrappers in stages, configs,
  presets, tests, Studio code, and docs.
- [ ] 1.2 Classify each occurrence as active persisted config, UI label,
  historical/archive prose, or genuine public transform.

## 2. SDK And Stage Surface

- [ ] 2.1 Delete wrapper-only `public.advanced` schemas and compile functions
  from standard stages.
- [ ] 2.2 Preserve or document any genuine `public + compile` stage transform.
- [ ] 2.3 Tighten derived flat stage schema validation where feasible.
- [ ] 2.4 Record an exception ledger for any flat step key that remains
  late-validated rather than schema-derived.
- [ ] 2.5 Update SDK authoring and compiler tests for the flat surface.

## 3. Consumers

- [ ] 3.1 Migrate first-party map configs and presets to top-level step IDs.
- [ ] 3.2 Update Swooper tests that author or assert config shape.
- [ ] 3.3 Update Studio config defaults, UI types, parsing, and schema
  consumers to emit and read the flat shape.
- [ ] 3.4 Update config docs and examples that describe persisted `advanced`.

## 4. Verification

- [ ] 4.1 Run focused authoring/config tests.
- [ ] 4.2 Run relevant Studio config/schema checks.
- [ ] 4.3 Run the active-source `advanced` search and disposition exceptions.
- [ ] 4.4 Run `bun run openspec -- validate normalize-config-surface --strict`.
- [ ] 4.5 Run `bun run openspec:validate`.
- [ ] 4.6 Run `git diff --check`.
