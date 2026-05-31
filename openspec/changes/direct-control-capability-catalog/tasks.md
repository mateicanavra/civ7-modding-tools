## 1. Package Catalog

- [x] 1.1 Add TypeBox dependency to `@civ7/direct-control` through the package
  manager.
- [x] 1.2 Implement catalog schema, static types, and validation helpers.
- [x] 1.3 Implement runtime snapshot generation from curated roots and constants.
- [x] 1.4 Implement official resource/table merge for selected tables and enums.
- [x] 1.5 Emit generated JSON reference output through a CLI command.
- [x] 1.6 Add schema/generator coverage through package and CLI tests/checks.

## 2. Types Handoff

- [x] 2.1 Compare catalog output to `packages/civ7-types/index.d.ts`.
- [x] 2.2 Add reviewed declaration notes in workstream closure; source-backed
  declaration updates can follow through `@civ7/types`
  where evidence is strong.

## 3. Verification

- [x] 3.1 Run package tests/check/build.
- [x] 3.2 Run catalog generation in static CLI mode.
- [x] 3.3 Run OpenSpec validation and `git diff --check`.
