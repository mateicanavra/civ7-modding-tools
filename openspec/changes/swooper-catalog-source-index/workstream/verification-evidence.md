# Packet 4 Verification Evidence

Change: `swooper-catalog-source-index`

## Scope

Packet 4 introduces Swooper-owned catalog source data without cutting catalog
generation or Studio launch resolution over to it yet. The packet proves:

- `CatalogSourceIndex` exists as tracked source data in
  `mods/mod-swooper-maps/src/maps/catalog/sourceIndex.ts`.
- Consumers have one Swooper-owned reader/parser boundary in
  `mods/mod-swooper-maps/src/maps/catalog/sources.ts`.
- The index matches the current default generation source set in generation
  sort order, excluding the transient `studio-current.config.json` unless the
  existing generator opt-in is used.
- Habitat owns the durable structure rule and the temporary Grit advisory. The
  advisory guards transitional wiring anchors only; behavior tests own semantic
  source-set equality. No durable authority was moved into a standalone `.grit`
  tree.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Targeted catalog source index tests | PASS | `bun test mods/mod-swooper-maps/test/config/catalog-source-index.test.ts` passed 5 tests, 0 failures, 9 assertions after review fixes. |
| Packet OpenSpec strict validation | PASS | `bun run openspec -- validate swooper-catalog-source-index --strict` reported `Change 'swooper-catalog-source-index' is valid`. |
| SA-04 structure rule | PASS | `bun habitat check --rule structure-swooper-catalog-source-index --json` returned `ok: true`, rule `status: "pass"`, `lane: "enforced"`. |
| Temporary catalog wiring-anchor advisory | PASS | `bun habitat check --rule grit-swooper-catalog-index-consistency-temporary --json` returned `ok: true`, rule `status: "pass"`, `lane: "advisory"`, with the narrowed message `Swooper catalog source index transitional wiring anchors drifted.` |
| Mod package check | PASS | `nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` completed successfully. |
| Mod package Habitat owner check | PASS | `nx run mod-swooper-maps:habitat:check --skip-nx-cache --outputStyle=static` passed 83 rules, 0 failing, 0 advisory findings after the advisory wording was narrowed. |
| Mod package tests | PASS | `nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static` passed 498 tests with 2 existing skips, 0 failures, 14664 assertions. |
| Mod package lint | PASS | `nx run mod-swooper-maps:lint --skip-nx-cache --outputStyle=static` checked 1139 files, no fixes needed after Biome safe formatting fixes. |
| Classify-reported workspace lint | PASS | `bun run lint` passed all 9 lint targets; `mod-swooper-maps:lint` reran and the other 8 targets were cache hits. |
| Studio app tests | PASS | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` passed 67 files, 380 tests after review fixes. This re-proves the previously red Studio app gate after the Packet 4 source-index change. |
| Contract check | PASS | `nx run studio-contract:check --skip-nx-cache --outputStyle=static` passed. |
| Server check | PASS | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` passed. |
| UI check | PASS | `nx run mapgen-studio-ui:check --skip-nx-cache --outputStyle=static` passed. |
| App check | PASS | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` passed. |

## Classify Routing

`bun habitat classify` was run for:

- `mods/mod-swooper-maps/src/maps/catalog`
- `mods/mod-swooper-maps/test/config/catalog-source-index.test.ts`
- `.habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-source-index`
- `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-catalog-index-consistency-temporary`

The catalog source and test paths reported `mod-swooper-maps` ownership and the
expected runnable targets: `nx run mod-swooper-maps:check`,
`nx run mod-swooper-maps:test`, and workspace `bun run lint`. The Habitat rule
paths reported `habitat-authority` ownership, workspace lint, and no available
project-local `check` or `test` target, which is expected for `.habitat` rule
source.

## Operational Note

An initial attempt to run `nx run mod-swooper-maps:check` and
`nx run mod-swooper-maps:habitat:check` concurrently produced a transient
`mapgen-core:build` `ENOENT` while both graph executions touched shared `dist`
outputs. The same targets passed when run sequentially. Packet 4 closure uses
the sequential proof above; future packet verification should avoid parallel
Nx graph invocations that share build output directories.

## Review Lanes

Required review lanes completed and all accepted findings were dispositioned:

- TypeScript refactoring found that the raw `CatalogSourceIndex` export in the
  catalog barrel bypassed the reader boundary, that digest inputs allowed
  impossible drift, that the advisory overclaimed semantic equality, and that
  the test hardcoded ids. Fixes: the barrel no longer exports raw source data;
  `sourceIndex.ts` derives digest inputs through `catalogSource(...)`; tests
  derive ids from canonical metadata; the advisory is narrowed to wiring
  anchors.
- oRPC/Effect/library correctness found the same public-barrel and strict-parser
  issues plus the advisory overclaim. Fixes: parser validation now rejects
  unknown entry, digest-input, and latitude-bound keys; the public barrel exports
  only `readCatalogSourceIndex`, `CatalogSourceEntry`, and
  `CatalogSourceIndexReadOptions`; behavior tests remain the semantic equality
  proof.
- Code quality/structure replacement lane superseded a nonresponsive original
  reviewer and found stale evidence, advisory overclaiming, and excess barrel
  surface. Fixes: evidence was refreshed to the current 5-test targeted suite;
  `rule.json`, `pattern.md`, proposal, spec, and tasks now state that the
  advisory guards anchors only; the barrel was narrowed.

Reviewers also inspected comments/JSDoc. The only cornerstone comment added is
the reader boundary note in `sources.ts`, which explains why callers consume the
index through the validated reader instead of narrating line mechanics.
