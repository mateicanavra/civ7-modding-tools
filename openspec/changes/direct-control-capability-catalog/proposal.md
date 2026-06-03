## Why

Runtime introspection and official resources expose a large Civ7 command and
data surface, but native method metadata is too weak to generate high-level
wrappers directly. The repo needs a provenance-aware catalog that records what
is observed, where it came from, and how trustworthy it is.

## Target Authority Refs

- `docs/projects/civ7-direct-control/workstream/capability-inventory/type-generation-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `packages/civ7-types/index.d.ts`
- official resources under `.civ7/outputs/resources`
- TypeBox patterns in `packages/mapgen-core`

## What Changes

- Add a TypeBox-backed capability catalog schema in `@civ7/direct-control`.
- Add runtime snapshot generation for curated App UI and Tuner roots.
- Add controller capability ingestion once the project-owned game-scoped
  controller exists, using `Civ7IntelligenceBridge.capabilities.list` as a
  first-class provenance source.
- Merge runtime evidence with official resource and reviewed declaration
  evidence into generated reference artifacts.
- Define a reviewed declaration handoff path into `@civ7/types`.

## Requires

- `direct-control-state-role-model`
- `direct-control-read-surface`

## Enables Parallel Work

- Autocomplete/reference sheets for developers and Studio.
- Safer LLM-agent tool descriptions.
- Future reviewed declarations in `@civ7/types`.

## Affected Owners

- `packages/civ7-direct-control`: catalog schema, snapshot generator, generated
  reference output.
- `packages/civ7-types`: reviewed declarations only after promotion.
- `packages/cli`: command to write or print runtime snapshots.
- Docs: capability reference and provenance explanation.

## Forbidden Owners

- High-level wrappers generated blindly from runtime method names.
- Ambient declarations promoted without review.
- Generated catalog outputs treated as hand-editable source.

## Stop Conditions

- Runtime metadata and official resources cannot produce useful provenance
  beyond the existing manual reports.
- TypeBox adds more maintenance burden than it removes for this package.

## Consumer Impact

Developers can inspect a stable catalog/reference and tools can consume
machine-readable capabilities without overclaiming signatures.

## Verification Gates

- Schema compile/validation tests.
- Snapshot generator tests against mock runtime inspections.
- CLI tests for snapshot/reference output.
- OpenSpec validation and package checks.
