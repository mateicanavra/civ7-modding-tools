## 1. Inventory

- [x] 1.1 Inventory active `advanced` config wrappers in stages, configs,
  presets, tests, Studio code, and docs.
- [x] 1.2 Classify each occurrence as active persisted config, UI label,
  historical/archive prose, or genuine public transform.

## 2. SDK And Stage Surface

- [x] 2.1 Delete wrapper-only `public.advanced` schemas and compile functions
  from standard stages.
- [x] 2.2 Preserve or document any genuine `public + compile` stage transform.
- [x] 2.3 Tighten derived flat stage schema validation where feasible.
- [x] 2.4 Record an exception ledger for any flat step key that remains
  late-validated rather than schema-derived.
- [x] 2.5 Update SDK authoring and compiler tests for the flat surface.

## 3. Consumers

- [x] 3.1 Migrate first-party map configs and presets to top-level step IDs.
- [x] 3.2 Update Swooper tests that author or assert config shape.
- [x] 3.3 Update Studio config defaults, UI types, parsing, and schema
  consumers to emit and read the flat shape.
- [x] 3.4 Update config docs and examples that describe persisted `advanced`.

## 4. Verification

- [x] 4.1 Run focused authoring/config tests.
- [x] 4.2 Run relevant Studio config/schema checks.
- [x] 4.3 Run the active-source `advanced` search and disposition exceptions.
- [x] 4.4 Run `bun run openspec -- validate normalize-config-surface --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
- [x] 4.6 Run `git diff --check`.
