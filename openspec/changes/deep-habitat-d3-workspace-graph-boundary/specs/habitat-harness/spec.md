## ADDED Requirements

### Requirement: Workspace Graph Authority Is Singular

Habitat SHALL have one Workspace Graph authority for owner roots, graph-owned
target names, dependency declarations, aggregate/workspace targets, and current
Nx project/target availability.

#### Scenario: Plugin and classify use the same graph authority
- **WHEN** Nx target inference and `habitat classify` need owner roots or target availability
- **THEN** both consumers use the Workspace Graph module contract instead of local owner-root or target maps

#### Scenario: Duplicate target truth is rejected
- **WHEN** implementation adds or changes target names, owner roots, or dependency declarations outside the Workspace Graph module
- **THEN** D3 validation fails until the duplicate authority is removed or moved into the Workspace Graph module

#### Scenario: Full graph inventory is controlled
- **WHEN** D3 validates Habitat-owned graph surfaces
- **THEN** the inventory enumerates every owner root, aggregate/workspace target, `habitat:check` target, `habitat:rule:*` alias target, dependency declaration kind, resolved dependency relationship, unavailable project target, and graph refusal bad case from the Workspace Graph module
- **AND** any Habitat-owned target surface outside that inventory fails validation

### Requirement: Target Facts Are Closed Graph States

Habitat SHALL represent graph target output as closed target states:
available project target, unavailable project target, alias target with resolved
dependency, aggregate/workspace target, and graph refusal.

#### Scenario: Project target is available
- **WHEN** a project and target are present in current Nx metadata
- **THEN** Habitat reports an available project target with project, project root, target, and command facts

#### Scenario: Project target is unavailable
- **WHEN** a project exists but the requested target is absent
- **THEN** Habitat reports an unavailable project target and does not construct a runnable command for that target

#### Scenario: Workspace gate is aggregate
- **WHEN** a target represents a workspace-level structural gate
- **THEN** Habitat reports an aggregate/workspace target rather than a project-local target

#### Scenario: Graph read fails
- **WHEN** Nx graph data is malformed, unreadable, or blocked by daemon/read failure
- **THEN** Habitat reports a graph refusal state instead of silently emitting runnable target commands

### Requirement: Alias Targets Require Resolved Dependencies

Habitat SHALL emit a rule alias target only when every declared dependency
resolves to a current Nx project/target pair.

#### Scenario: Same-project target dependency resolves through the declaring project
- **WHEN** a rule alias declares a same-project target dependency such as `{ target: "boundaries" }`
- **THEN** Habitat normalizes the dependency to the project that owns the alias target
- **AND** Habitat validates that the declaring project contains the target before emitting a runnable alias

#### Scenario: Same-project missing target is refused
- **WHEN** a same-project target dependency names a target absent from the declaring project
- **THEN** Habitat reports a graph refusal before wrapper execution
- **AND** the alias cannot pass by running `node -e ""`

#### Scenario: Biome alias resolves to the real Habitat project
- **WHEN** Habitat emits `habitat:rule:biome-ci`
- **THEN** its dependency resolves to the canonical Habitat Biome CI target on the real Habitat project
- **AND** it does not depend on `projects: ["biome"], target: "ci"`

#### Scenario: Explicit project dependency resolves through the named project
- **WHEN** an alias declaration names an explicit project target dependency such as `{ projects: ["@internal/habitat-harness"], target: "grit:check" }`
- **THEN** Habitat resolves the named project from `WorkspaceGraphSnapshot`
- **AND** Habitat validates the named target on that project before emitting a runnable alias

#### Scenario: Aggregate target dependencies resolve all children
- **WHEN** an aggregate/workspace target such as `generated:check` declares multiple child dependencies
- **THEN** Habitat resolves every child dependency declaration
- **AND** one unresolved child dependency prevents the aggregate target from being treated as runnable

#### Scenario: Missing-project alias is refused
- **WHEN** an alias declaration names a dependency project that does not exist
- **THEN** Habitat reports a graph refusal before wrapper execution
- **AND** the alias cannot pass by running `node -e ""`

#### Scenario: Missing-target alias is refused
- **WHEN** an alias declaration names a dependency target that does not exist on the resolved project
- **THEN** Habitat reports a graph refusal before wrapper execution
- **AND** the alias cannot pass by running `node -e ""`

#### Scenario: Scoped project and multi-colon targets are not parsed by first colon
- **WHEN** an alias target dependency declaration references a scoped project name or a target name containing multiple colon-separated segments
- **THEN** Habitat resolves the dependency from a structured target dependency relationship
- **AND** it does not split the dependency string on the first colon as graph authority

#### Scenario: Dependency declaration kinds are closed
- **WHEN** Habitat represents target dependencies
- **THEN** each dependency is one of: same-project target dependency, explicit project target dependency, aggregate/workspace dependency, or multi-dependency target relationship
- **AND** unresolved or unknown declaration kinds fail validation rather than falling back to string parsing

### Requirement: Plugin And Graph Service Share One Validation Path

Habitat SHALL validate dependency declarations and graph-owned targets through
the same Workspace Graph contract/snapshot path for plugin inference, classify,
and verify.

#### Scenario: Plugin emits only validated aliases
- **WHEN** `plugin.js` emits a `habitat:rule:*` alias target
- **THEN** that alias comes from a resolved Workspace Graph dependency relationship
- **AND** unresolved aliases are withheld from runnable alias output or emitted only as failing graph-refusal behavior covered by D0 compatibility

#### Scenario: Classify receives the same alias refusal
- **WHEN** an alias target dependency declaration is unresolved
- **THEN** `habitat classify` receives the same graph refusal state from the Workspace Graph service
- **AND** classify does not reconstruct alias validity independently

#### Scenario: Verify receives graph-derived target plan facts
- **WHEN** `habitat verify` prepares target execution
- **THEN** its target plan is derived from Workspace Graph states
- **AND** verify does not maintain a separate target-name authority

### Requirement: Classify Check And Verify Consumer Scope Is Explicit

Habitat SHALL keep D3 graph consumption explicit for classify, check, verify,
and Nx target inference.

#### Scenario: Classify consumes graph facts directly
- **WHEN** `habitat classify` reports target facts
- **THEN** the facts are projected from the Workspace Graph service and distinguish available targets, unavailable targets, aggregate/workspace targets, and graph refusals

#### Scenario: Check does not become a graph-service rewrite
- **WHEN** `habitat check` evaluates rules directly
- **THEN** D3 does not require direct graph reads for rule evaluation
- **AND** D3 owns only the Nx inferred `habitat:check` and `habitat:rule:*` graph surfaces used to invoke check through Nx

#### Scenario: Verify consumes graph target plans
- **WHEN** `habitat verify` prepares affected target execution
- **THEN** its target plan comes from D3 graph target facts
- **AND** D12 remains the owner of the final verify receipt schema and handoff wording

### Requirement: D3 Implementation Is Blocked Behind D0 And D2 Live Facts

D3 SHALL NOT authorize source implementation until D0 public-surface rows and
D2 graph projection implementation facts exist for D3-touched surfaces.

#### Scenario: Public surface changes wait for D0 rows
- **WHEN** D3 implementation would change classify JSON, verify output, Nx inferred targets, root scripts, package exports, or docs/examples
- **THEN** the implementation cites concrete D0 surface rows before source edits

#### Scenario: Registry graph facts wait for D2 implementation
- **WHEN** D3 implementation would consume rule graph declarations from the registry
- **THEN** D2 graph projection implementation facts exist before the D3 source code relies on them

### Requirement: Downstream Dominoes Consume Only Named Graph Facts

D4, D7, and D12 SHALL consume only the named graph facts accepted by D3 and
shall not recreate graph truth locally.

#### Scenario: D4 consumes orientation-safe graph facts
- **WHEN** D4 designs orientation/routing behavior
- **THEN** it may use D3 project ownership, target availability, unavailable target, and graph refusal facts
- **AND** it may not infer target truth or alias validity

#### Scenario: D7 consumes enforcement-safe graph facts
- **WHEN** D7 designs enforcement execution planning
- **THEN** it may use D3 available target, aggregate target, dependency declaration, and resolved dependency facts
- **AND** it may not treat wrapper exit 0 as success without D3 dependency resolution

#### Scenario: D12 consumes verify-safe graph facts
- **WHEN** D12 designs verify handoff receipts
- **THEN** it may use D3 graph-read status and verify target plan facts
- **AND** it remains responsible for receipt schema and handoff wording
