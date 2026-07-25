## Why

The resource distribution workstream needs a durable corpus contract before
strategy batches can claim per-resource coverage. Current placement diagnostics
group adapter numeric `resourceType` values, while official resource facts live
in checked-in Civ7 XML. Without a resource-owned corpus, downstream work can
accidentally treat static XML order, adapter candidate ids, and runtime
`GameInfo.Resources` ids as the same thing.

## Target Authority Refs

- `openspec/changes/resource-distribution-planning`: resource corpus proof and
  per-resource coverage requirements.
- `openspec/changes/resource-stage-architecture`: `resources` target stage and
  `artifact:resources.corpus` migration sequence.
- `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`:
  official base-standard load order for `data/resources.xml` then
  `data/resources-v2.xml`.
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml` and
  `resources-v2.xml`: official base-standard `Resources` rows.

## What Changes

- Add a `resources` domain corpus contract under `mods/mod-swooper-maps`.
- Publish a static 55-row official base-standard corpus artifact with
  `staticResourceRowSlot`, official source file/table, base class, valid ages,
  age class overrides, placement constraint summary, distribution facts,
  placeability disposition, and strategy-required disposition.
- Keep runtime numeric id status explicit and unverified for every resource.
- Add `artifact:resources.corpus` declaration without introducing a resource
  stage shell or moving current placement behavior.
- Add tests that lock `Resources` row order from `base-standard.modinfo` and
  prove `<Types>` declaration order is not the corpus order.

## Explicit Non-Goals

- No `resources` stage shell, recipe order change, or movement of
  `placement/plan-resources`.
- No resource strategy tuning, group planners, or earthlike expectation ranges.
- No runtime `GameInfo.Resources` id verification.
- No generated-output, official submodule, lockfile, adapter constant, or SDK
  constant edits.
- No symbolic labels for adapter numeric placement diagnostics while runtime
  ids remain unverified.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-corpus-contract.test.ts test/resources/resource-corpus-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-corpus-contract --strict`
- `bun run openspec:validate`
- `git diff --check`
