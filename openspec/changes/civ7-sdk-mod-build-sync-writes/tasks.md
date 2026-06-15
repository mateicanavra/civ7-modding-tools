## 1. Phase Opening

- [x] 1.1 Open `workstream/phase-record.md` before implementation and record
  the suspected async write race.
- [x] 1.2 Reproduce or inspect the race in `XmlFile.write`,
  `ImportFile.write`, and SDK mod tests.

## 2. Implementation

- [x] 2.1 Make `XmlFile.write()` complete directory creation and file writing
  before returning.
- [x] 2.2 Make `ImportFile.write()` complete directory creation and copy
  before returning.
- [x] 2.3 Remove sleep-based test compensation and assert generated files are
  readable immediately after `Mod.build()`.
- [x] 2.4 Stabilize the existing SDK mapgen `createMap` test timeout discovered
  while running the package-level verification gate by moving heavy import setup
  out of the timed body.

## 3. Verification

- [x] 3.1 Run `cd packages/sdk && bun run test`.
- [x] 3.2 Run `cd packages/sdk && bun run check`.
- [x] 3.3 Run `cd packages/plugins/plugin-files && bun run test`.
  Disposition: exact command ran and no SDK ENOENT surfaced, but it still exits
  1 because bare `vitest run` ascends into unrelated mapgen-studio root
  projects with missing `mod-swooper-maps/recipes/standard-artifacts` imports
  and existing timeouts. Scoped `bun vitest run --project plugin-files` passes.
- [x] 3.4 Run `bun run openspec -- validate civ7-sdk-mod-build-sync-writes
  --strict`.
