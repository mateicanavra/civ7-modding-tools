## 1. Public Config Boundary

- [x] 1.1 Read the Foundation stage authoring surface and adjacent stage public
      config helpers.
- [x] 1.2 Add the `foundation-orogeny` public schema and compile function at
      the stage owner with public fields `knobs` and `crustCharacter`.
- [x] 1.3 Update default config and preset builders to consume the public
      shape without Studio-side scrubbing.
- [x] 1.4 Regenerate or repair checked-in config artifacts through normal
      commands when required.

## 2. Authority And Tests

- [x] 2.1 Remove the existing behavior-test exception for Foundation Orogeny.
- [x] 2.2 Update the existing Habitat public-authoring-surface rule in place
      so it asserts the semantic public surface instead of allowing the old
      envelope.
- [x] 2.3 Add behavior tests for default config materialization, preset
      application, first-party legacy migration, and imported legacy-envelope
      rejection.

## 3. Verification

- [x] 3.1 Run `bun run openspec -- validate foundation-orogeny-public-config-surface --strict`.
- [x] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [x] 3.3 Run focused `nx run mapgen-studio:test` config/preset suites and any
      map config validation commands reported by Habitat.
- [x] 3.4 Run `nx run mod-swooper-maps:build:studio-recipes` and
      classify-reported Swooper config tests.
- [x] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, and Habitat/authority review lanes.
- [x] 3.6 Record every gate in `workstream/verification-evidence.md`.
