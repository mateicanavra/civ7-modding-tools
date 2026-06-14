## ADDED Requirements

### Requirement: Nx Generators Remain Nx Plugin Surfaces

The Habitat project and pattern generators SHALL remain Nx plugin generator
surfaces declared from `@internal/habitat-harness` metadata. If reusable
generator logic uses Effect services, the Nx generator function SHALL be the
host adapter boundary and SHALL NOT require oclif command execution.

#### Scenario: Generator writes use the Nx virtual tree
- **WHEN** generator logic reads or writes generator-owned files
- **THEN** it uses an Nx `Tree`-backed workspace service for `exists`,
  `children`, `read`, `write`, and JSON writes
- **AND** generator dry-runs, in-memory tree tests, and Nx transaction behavior
  remain authoritative
- **AND** neither Effect-backed code nor pure helper code writes through the
  platform filesystem for tree-owned files

#### Scenario: Supported project kinds generate clean structure
- **WHEN** `bun run nx g @internal/habitat-harness:project <name>
  --kind=<foundation|plugin|app>` runs
- **THEN** the generated project carries the correct default package name and
  root for its kind: `packages/<name>` for foundation,
  `packages/plugins/plugin-<name>` for plugin, and `apps/<name>` for app
- **AND** generated `package.json` includes the `kind:*` tag, `build`,
  `check`, `test`, and `clean` scripts, ESM exports, `files: ["dist"]`, and
  Node engine constraint
- **AND** generated `tsconfig.json`, `src/index.ts`, Bun test stub, and README
  match the H8 scaffold contract
- **AND** generated output passes Habitat rules with zero new baseline entries
  before probe cleanup

#### Scenario: Project generator accepts taxonomy spellings
- **WHEN** the project generator schema accepts a taxonomy kind
- **THEN** both bare kind values and `kind:*` spellings remain accepted at the
  schema boundary
- **AND** supported kinds normalize to the same generated output regardless of
  spelling

#### Scenario: Non-uniform project kinds are refused
- **WHEN** an agent asks the project generator for `mod`, `engine`, `control`,
  `adapter`, `sdk`, or `tooling`
- **THEN** the generator refuses the request with the documented domain-owner
  rationale
- **AND** no guessed project shape is written

#### Scenario: Non-empty project roots are protected
- **WHEN** the normalized generator root already exists and contains files
- **THEN** the project generator fails before writing scaffold output
- **AND** existing project files remain untouched

### Requirement: Pattern Generator Preserves Rule-Pack And Baseline Coupling

The Habitat pattern generator SHALL keep native Grit pattern creation, empty
locked baseline creation, and Habitat rule-pack registration as one Nx
generator operation.

#### Scenario: New Grit-backed rule scaffold is atomic
- **WHEN** `bun run nx g @internal/habitat-harness:pattern <rule-id>` runs
- **THEN** Habitat writes `.grit/patterns/habitat/checks/<pattern>.md`
- **AND** writes `tools/habitat-harness/baselines/<rule-id>.json` as an empty
  locked baseline
- **AND** appends a `grit-check` rule-pack entry with the established owner,
  lane, detect, message, `exceptionPath: "none"`, `gritPattern`, and
  `hookScope: "pre-commit"`
- **AND** native Grit pattern fixture proof remains the pattern acceptance gate

#### Scenario: Existing pattern, baseline, or rule id is protected
- **WHEN** the requested pattern path, baseline path, or Habitat rule id
  already exists
- **THEN** the generator fails before overwriting any existing rule artifact

### Requirement: Nx Generator Module Boundaries Are Explicit

The Effect migration SHALL preserve the current Nx factory metadata contract:
`generators.json` and `migrations.json` expose factory entries that Nx can load
from the repo-local harness package.

#### Scenario: CommonJS factory entries bridge intentionally
- **WHEN** Effect-backed TypeScript or ESM code is shared by generator or
  migration factories
- **THEN** the child implementation preserves the current source CJS factory
  metadata entries and chooses one bridge: CJS factories dynamically import
  implementation code, or a deliberately small CJS-compatible pure core remains
  for that factory
- **AND** Nx generator and migration invocation works through the declared
  metadata paths after `bun run --cwd tools/habitat-harness build`

### Requirement: Harness Migrations Remain Local Nx Migrations

Harness convention changes SHALL ship as Nx migrations declared in
`migrations.json`. Because `@internal/habitat-harness` is unpublished,
migration proof SHALL use a hand-authored run file whose package points at
`./tools/habitat-harness` and SHALL NOT rely on npm-registry version
resolution.

#### Scenario: Migration factories keep Nx lifecycle semantics
- **WHEN** a migration uses Effect-backed reusable logic
- **THEN** the migration factory remains an Nx migration adapter
- **AND** it returns the expected Nx callback or task shape
- **AND** expected migration failures surface to Nx by throwing or rejecting
- **AND** any migration-scoped Effect runtime, fiber, process, or resource is
  closed before the migration promise resolves

#### Scenario: Local migration run file executes
- **WHEN** a harness migration is proved locally
- **THEN** the proof runs `bun run nx migrate --run-migrations=<run-file>.json
  --skip-install`
- **AND** the run file uses package `./tools/habitat-harness`
- **AND** migration behavior is recorded without changing generator or command
  contracts
