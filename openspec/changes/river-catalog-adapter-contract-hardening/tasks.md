## 1. Contracts

- [x] 1.1 Add or update river-class validation and docs.
- [x] 1.2 Update mock adapter behavior to simulate terrain-without-metadata.
  - Follow-up: mock and production adapter readback now classify native
    river-type metadata readback as available when `GameplayMap.getRiverType`
    exists, while still keeping exact minor-river parity separate from
    capability.
- [x] 1.3 Update generated catalog wording to source evidence where relevant.
- [x] 1.4 Mark `modelRivers()` as a bounded Civ-native materialization surface
  for `map-rivers`, not an upstream Hydrology generator or public selector.

## 2. Tests

- [x] 2.1 Add mock/live divergence tests.
  - Follow-up: adapter and direct-control fixtures consume shared
    `@civ7/map-policy` river constants instead of hard-coded `0/1` metadata
    values.
- [x] 2.2 Add catalog wording/parity tests.
- [x] 2.3 Add river-class value validation tests.
- [x] 2.4 Run adapter, map-policy, civ7-types, and MapGen guard suites.

## 3. Validation

- [x] 3.1 Validate this OpenSpec change and `bun run openspec:validate`.
