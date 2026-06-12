## ADDED Requirements

### Requirement: Civ7 Policy Tables Are Regenerable From The Official Snapshot

The `@civ7/map-policy` generated tables SHALL be produced by an in-repo
generator (`scripts/civ7-map-policy/generate-tables.ts`) that parses the
official resources submodule read-only, reproduces the committed
`CIV7_BROWSER_TABLES_V0` data tables byte-stably, and records its own
identity, the submodule commit, and the snapshot date in the generated
header. A check mode SHALL verify the committed output matches a fresh
regeneration.

#### Scenario: Regeneration is byte-stable and idempotent
- **WHEN** the generator runs against the pinned submodule snapshot
- **THEN** the `CIV7_BROWSER_TABLES_V0` export block is byte-identical to the
  committed file, and a second run produces no diff

#### Scenario: Stale tables are detected
- **WHEN** `verify:civ7-map-policy-tables` runs and the committed file does
  not match a fresh regeneration
- **THEN** the check exits non-zero naming the regeneration command

#### Scenario: Provenance is in the header
- **WHEN** the generated file is inspected
- **THEN** its header names `scripts/civ7-map-policy/generate-tables.ts`, the
  submodule commit hash, and the 2026-01-24 snapshot date with the D4
  refresh follow-up note

### Requirement: Policy Tables Carry Official Resource And Start-Bias Policy Data

The generated tables SHALL include, as an additive versioned export
(`CIV7_POLICY_TABLES_V1`), the official per-resource catalog policy (Weight,
MinimumPerHemisphere, class, hemisphere-unique/staple/tradeable/unlocks-civ
flags), resource age validity and leader requirements (including DLC resource
data), a derived required-for-age table, the
`MapResourceMinimumAmountModifier` rows, the eight `StartBias*` tables across
base and DLC civilization/leader data, and the official start-buffer globals
— all typed and exported from the package index.

#### Scenario: Resource policy rows cover the V0 catalog
- **WHEN** `CIV7_POLICY_TABLES_V1.resourceRows` is read
- **THEN** every V0 resource index has a row whose `type` matches the V0
  `resourceTypes` mapping, carrying the official Weight and
  MinimumPerHemisphere values

#### Scenario: Hemisphere force-placement inputs are available
- **WHEN** a planner needs the official minimum-per-hemisphere semantics
- **THEN** `resourceRows[*].minimumPerHemisphere`,
  `isResourceRequiredForAge`, and `mapResourceMinimumAmountModifier` provide
  the same inputs official `resource-generator.js` reads from GameInfo

#### Scenario: StartBias rows are attributable
- **WHEN** any StartBias row is read
- **THEN** it names exactly one owner (CivilizationType or LeaderType), a
  score, and — for value tables — a symbolic type resolvable against the V0
  index tables

#### Scenario: Start buffers match the official globals
- **WHEN** `startGlobals` is read
- **THEN** `requiredBufferBetweenMajorStarts` is 6 and
  `desiredBufferBetweenMajorStarts` is 12 (map-globals.js values)

### Requirement: A Single Generator Feeds Studio And Policy Consumers

There SHALL be exactly one Civ7 table generator; the browser Studio worker
SHALL consume `CIV7_BROWSER_TABLES_V0` from `@civ7/map-policy` rather than a
separately generated copy, so studio index mappings cannot diverge from the
policy tables used by the mock adapter's legality emulation.

#### Scenario: The divergent twin is retired
- **WHEN** the repo is searched for Civ7 table generators and generated
  copies
- **THEN** only `scripts/civ7-map-policy/generate-tables.ts` and
  `packages/civ7-map-policy/src/civ7-tables.gen.ts` exist; the studio worker
  imports the package export

#### Scenario: Studio and mock legality agree on feature indices
- **WHEN** the studio worker constructs its mock adapter
- **THEN** the feature name→index mapping it passes is the same GameInfo-order
  mapping the mock's feature legality tables are keyed by
