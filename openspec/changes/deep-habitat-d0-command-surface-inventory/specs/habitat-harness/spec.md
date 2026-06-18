## ADDED Requirements

### Requirement: Public Surface Matrix Defines Compatibility Authority

Habitat SHALL maintain a D0 public surface compatibility matrix at
`docs/projects/habitat-harness/public-surface-compatibility-matrix.md` before any
later Deep Habitat refactor packet changes command behavior, command JSON,
package exports, root scripts, Nx target metadata, generator behavior, migration
behavior, hook output, or public examples.

#### Scenario: Later packet changes a listed surface

- **WHEN** a later packet proposes to move, rename, narrow, version, deprecate,
  or refuse a Habitat surface
- **THEN** it cites the D0 `surface_id`
- **AND** it follows the row's `compatibility_handling`
- **AND** it records whether the row is preserved, versioned, handled through a
  facade, deprecated, refused, document-only, or generated-only
- **AND** any downstream redesign owner is recorded separately through
  `target_owner` and `downstream_dominoes`

#### Scenario: Surface lacks a D0 row

- **WHEN** a later packet needs to change a command, DTO, export, root script, Nx
  target, generator, migration, hook, or public example without a D0 row
- **THEN** the later packet stops before implementation
- **AND** D0 is updated or repaired before the later packet proceeds

### Requirement: Matrix Rows Use Stable Plane-Specific IDs

Each D0 matrix row SHALL have a deterministic stable `surface_id`, a plane, a
repo-relative source path, a current behavior or schema description, a primary
contract state, a closed compatibility handling action, target owner, validation
gate, and non-claims.

The `surface_id` SHALL use the form `D0-<plane>-<surface-key>`. The
`surface-key` SHALL be derived from the plane-specific source identity rules in
the D0 design, normalized by lowercasing, replacing runs of non-alphanumeric
characters with `-`, trimming leading/trailing `-`, and joining normalized
segments with `-`.

#### Scenario: Implementation assigns row IDs

- **WHEN** D0 implementation adds a matrix row
- **THEN** the `surface_id` is re-derivable from the row's plane and source
  identity
- **AND** collisions are resolved by appending the normalized source path stem,
  then a source line number for docs or human-output rows if still needed
- **AND** the row does not use a shorter, friendlier, or ad hoc ID

#### Scenario: Surface is renamed or deprecated

- **WHEN** a current surface is renamed, replaced, or deprecated
- **THEN** the old `surface_id` is not reused for a different surface
- **AND** renamed rows link through `renamed-from` and `renamed-to`
  `row_relationships`
- **AND** deprecated rows link to their replacement through
  `deprecated-replacement`
- **AND** deprecated rows keep `contract_state: deprecated` until removed by a
  later accepted compatibility change

#### Scenario: One TypeScript name appears on multiple planes

- **WHEN** a TypeScript name is both a package export and command JSON shape
- **THEN** D0 records one `package-export` row and one `command-json` row
- **AND** the rows link through `same-surface-other-plane` `row_relationships`
- **AND** package export compatibility and command JSON compatibility remain
  separate decisions

#### Scenario: Generated surface points to source authority

- **WHEN** a generated or derived surface is inventoried
- **THEN** D0 records the generated or derived row separately
- **AND** the row links to its source-authority row through a `generated-from`
  `row_relationships` entry
- **AND** later packets change the source authority rather than hand-editing
  generated output

#### Scenario: Documentation example demonstrates a source surface

- **WHEN** a docs example is inventoried
- **THEN** D0 records the docs row separately
- **AND** the docs row links to the command, API, or source row through a
  `docs-example-of` `row_relationships` entry
- **AND** docs correction remains separate from source-surface compatibility

### Requirement: Row Relationships Are Typed

D0 row relationships SHALL be recorded as `row_relationships` entries using the
shape `{ relation, surface_id }`.

The relation SHALL be one of: `same-surface-other-plane`, `renamed-from`,
`renamed-to`, `deprecated-replacement`, `generated-from`, or `docs-example-of`.

#### Scenario: A row references another row

- **WHEN** D0 implementation adds a cross-row link
- **THEN** the link uses one closed relationship type
- **AND** the relationship direction matches the D0 design
- **AND** no relationship is hidden in `notes` or an untyped ID list

#### Scenario: Legacy proof-shaped name is encountered

- **WHEN** D0 inventories a current `Proof*`, `*Proof`, proof artifact writer, or
  proof-shaped output phrase
- **THEN** the row marks the name as a current compatibility fact
- **AND** it names the downstream owner that may keep, rename, version, or remove
  the term
- **AND** it does not treat proof/evidence language as target-domain authority

### Requirement: Compatibility Handling Is A Closed Action Set

D0 matrix rows SHALL use exactly one `compatibility_handling` action from this
closed set: `preserve`, `version`, `facade`, `deprecate`, `refuse`,
`document-only`, or `generated-only`.

#### Scenario: Downstream packet owns redesign

- **WHEN** a later domino owns target redesign for a current surface
- **THEN** D0 records that owner in `target_owner` and `downstream_dominoes`
- **AND** D0 still assigns one closed `compatibility_handling` action
- **AND** the row does not use downstream ownership as a substitute for
  compatibility handling

#### Scenario: Compatibility handling cannot be chosen

- **WHEN** D0 cannot classify the current compatibility obligation for a row
- **THEN** the matrix is incomplete
- **AND** D0 stops for packet repair instead of emitting a row with an
  unclassified compatibility action

### Requirement: Matrix Completeness Is Falsifiable

D0 SHALL define completeness checks that fail when a public plane is omitted.

#### Scenario: Package root exports are inventoried

- **WHEN** D0 implementation inspects `tools/habitat-harness/src/index.ts`
- **THEN** every exported symbol has a `package-export` row
- **AND** every package `exports` subpath in `tools/habitat-harness/package.json`
  has a row

#### Scenario: Commands are inventoried

- **WHEN** D0 implementation inspects `tools/habitat-harness/src/commands`
- **THEN** every command file has CLI verb and flag rows
- **AND** every JSON-emitting command has command JSON rows
- **AND** every stable human-output claim has a human-output row or a non-claim

#### Scenario: Tooling surfaces are inventoried

- **WHEN** D0 implementation inspects root scripts, Nx metadata, generators,
  migrations, and hooks
- **THEN** every Habitat-owned root script, inferred Nx target, generator,
  migration, and hook surface has a row
- **AND** generated/derived surfaces identify their source authority

### Requirement: D0 Does Not Execute Refactor Behavior

D0 SHALL be an inventory and compatibility-design packet only.

#### Scenario: Implementation discovers a source change is needed

- **WHEN** D0 implementation finds a command behavior, TypeScript export, root
  script, Nx plugin, generator, migration, or hook behavior that should change
- **THEN** it records the surface and compatibility issue in the matrix
- **AND** it does not modify Habitat source behavior in D0
- **AND** the target change is assigned to the owning downstream packet
