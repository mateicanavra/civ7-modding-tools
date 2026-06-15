## Why

`Mod.build()` returns before concrete SDK file writes finish because
`XmlFile.write()` and `ImportFile.write()` queue asynchronous `fs.mkdir`
callbacks and then perform synchronous writes inside those callbacks. Vitest
teardown can remove the temp output directory before the late callback runs,
surfacing as unhandled `ENOENT` exceptions after all SDK tests have otherwise
passed.

This is a correctness bug in the SDK build contract, not a test timing issue.
Callers should be able to read generated files or tear down temporary output
immediately after `Mod.build()` returns.

## What Changes

- Make concrete SDK file writes complete before `write()` returns.
- Remove the sleep workaround in the mod build test so the test asserts the
  synchronous completion contract directly.
- Move the existing mapgen `createMap` test's heavy module import out of the
  timed test body so the SDK package test command can complete in this
  environment; this does not change SDK runtime behavior.
- Keep the public `Mod.build()` API synchronous; no async migration or caller
  compatibility layer is introduced.

## What Does Not Change

- No change to generated XML structure or `.modinfo` contents.
- No change to builder APIs, action-group handling, or output paths.
- No broad SDK refactor.

## Affected Owners

- `packages/sdk/src/files/XmlFile.ts`
- `packages/sdk/src/files/ImportFile.ts`
- `packages/sdk/test/mod-build.test.ts`
- `packages/sdk/test/mapgen-create-map.test.ts`
- Adjacent docs/tests only if verification exposes stale guidance.

## Verification Gates

- `cd packages/sdk && bun run test`
- `cd packages/sdk && bun run check`
- `cd packages/plugins/plugin-files && bun run test`
- `bun run openspec -- validate civ7-sdk-mod-build-sync-writes --strict`

## Stop Conditions

- The fix requires changing `Mod.build()` to async.
- Generated XML or `.modinfo` content changes beyond write timing.
- Package-local test commands still surface unhandled async filesystem errors.
