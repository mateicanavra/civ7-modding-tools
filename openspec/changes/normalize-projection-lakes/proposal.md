## Why

D2 says Hydrology owns deterministic lake intent, but parity must not fail hard
until the adapter can stamp and read back planned lakes. This slice isolates
lake projection capability and truth migration before placement decomposition
or resource/discovery reconciliation.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: D2,
  Problem Layer 4, Domino 3.
- `openspec/config.yaml`: truth and projection stay separate; map stages
  project.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: projection truth
  corrections follow capability.

## What Changes

- Add or expose explicit lake stamping/readback capability through the adapter
  and browser/test doubles.
- Implement `plan-lakes` as Hydrology truth, not a renamed projection
  diagnostic.
- Make `map-hydrology` project/materialize the lake plan and record drift
  evidence.
- Migrate placement lake inputs away from projection diagnostics after lake
  truth can be materialized and read back.
- Audit `map-*` stages touched by this change against the projection-only
  rule.
- Keep fail-hard parity gates after materialization/readback can prove the
  planned mask.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: splits lake projection capability from
  placement decomposition and typed resource/discovery reconciliation.

## Dependencies

- Requires: `normalize-config-surface`.
- Enables parallel work: placement product contracts, D4 reconciliation, and
  later parity guardrails.

## Forbidden Non-Goals

- No placement product split beyond lake-input contract migration.
- No resource/discovery typed reconciliation.
- No parity gate before stamping/readback exists.
- No claim that engine-generated lakes are deterministic pipeline truth.
- No generated output hand edits.

## Impact

- Affected owners: Hydrology domain ops/artifacts, `map-hydrology`, Civ7
  adapter, browser/test adapter doubles, hydrology docs/tests.
- Expected write set:
  - `packages/civ7-adapter/**`
  - hydrology domain op and artifact files
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/**`
  - placement lake-input contracts and derivation files
  - hydrology/map-hydrology tests and docs
- Protected paths: placement product decomposition, resource/discovery
  reconciliation, ecology topology, generated outputs.
- Stop conditions:
  - adapter cannot stamp or read back lake state;
  - browser/test adapters cannot model the capability enough to test the
    pipeline contract;
  - the proposed parity gate would fail against engine projection rather than
    against adapter-read truth.
- Verification gates:
  - adapter capability tests or mocks;
  - hydrology `plan-lakes` contract tests;
  - map-hydrology projection/readback tests;
  - placement no longer consumes lake projection diagnostics as truth;
  - no fail-hard parity before readback evidence exists;
  - `bun run openspec -- validate normalize-projection-lakes --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
