## ADDED Requirements

### Requirement: Classify Returns Explicit Orientation States

Habitat classify SHALL return a versioned `ClassifyResult` whose top-level
`state` is exactly one of `project-path`, `workspace-path`, `diff`,
`malformed-or-pathless-diff`, `unresolved-owner`, or `graph-refusal`.

Each `ClassifyResult` SHALL include classify non-claims. A result SHALL NOT
include runnable project target commands unless those commands are backed by D3
graph target facts for the current graph read. A result SHALL NOT use D2 legacy
`scope` prose as routing authority.

#### Scenario: Project path resolves to an owning project
- **WHEN** a repo path resolves to a project through D3 graph metadata
- **THEN** the result state is `project-path`
- **AND** the result includes the D3-owned project, project root, and tags
- **AND** the result includes D2-backed rule routing facts
- **AND** runnable targets are backed by D3 available project or aggregate target facts
- **AND** classify non-claims state that targets were not run, rule correctness was not proven, and safety was not applied

#### Scenario: Workspace path remains workspace-scoped
- **WHEN** a repo path resolves to an intentional workspace-level surface
- **THEN** the result state is `workspace-path`
- **AND** the result does not include a project owner, project root, project tags, or project-local targets
- **AND** any workspace target guidance is backed by D3 aggregate/workspace target facts or a D0-cited compatibility surface
- **AND** the result states that classify did not infer a project owner

#### Scenario: Diff contains classified changed paths
- **WHEN** the input is a valid diff with one or more changed paths
- **THEN** the result state is `diff`
- **AND** the result contains a deterministic, non-empty ordered list of path classifications
- **AND** each changed path is classified through one of the path-level states
- **AND** the wrapper does not collapse all paths into one owner, rule list, target list, or recovery instruction

#### Scenario: Diff-like input has no classified changed path
- **WHEN** the input is diff-like text or a `.diff` or `.patch` file but contains no classifiable changed path
- **THEN** the result state is `malformed-or-pathless-diff`
- **AND** the result includes a stable refusal reason and recovery instruction
- **AND** the result includes no runnable target commands
- **AND** the result states that classify did not infer ownership, target availability, or safety

#### Scenario: Path ownership cannot be resolved
- **WHEN** a repo-context path is neither D3 project-owned nor an intentional workspace-level path
- **THEN** the result state is `unresolved-owner`
- **AND** the result preserves the input path and includes a stable unresolved-owner reason
- **AND** the result includes a recovery instruction
- **AND** the result includes no project-local runnable targets or owner-dependent rule routing

#### Scenario: Workspace graph refuses classification facts
- **WHEN** D3 reports graph refusal for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, or unresolved alias dependency
- **THEN** the result state is `graph-refusal`
- **AND** the result preserves the D3-owned graph refusal category
- **AND** the result includes a recovery instruction
- **AND** the result includes no graph-backed runnable target commands
- **AND** D4 does not rename or reinterpret the D3 graph refusal family

### Requirement: Project Path Orientation Uses D2 Routing And D3 Graph Facts

For `project-path`, Habitat SHALL compose D2 `ruleRoutingFacts` and D3 graph
facts into classify-facing guidance without recreating rule or graph truth.

#### Scenario: Project path includes runnable and unavailable target guidance
- **WHEN** D3 reports available targets and unavailable targets for a project path
- **THEN** D4 renders available targets as `runnableTargets`
- **AND** D4 renders unavailable targets separately as `unavailableTargets`
- **AND** the same project/target pair is not present in both lists

#### Scenario: D2 routing metadata is unresolved
- **WHEN** D2 reports unresolved routing metadata for an otherwise classified path
- **THEN** D4 preserves the unresolved routing fact in classify output
- **AND** D4 does not guess applicability from raw legacy `scope` prose
- **AND** D4 does not silently drop the rule as if no metadata problem exists

#### Scenario: Project path does not parse prose scope as authority
- **WHEN** a rule registry row contains legacy `scope` prose
- **THEN** D4 may render compatibility prose only through a D0-cited surface
- **AND** D4 SHALL use D2 `ruleRoutingFacts` as the route authority

### Requirement: Diff Orientation Preserves Per-Path States

For `diff`, Habitat SHALL classify each changed path independently and preserve
the deterministic path ordering rule.

#### Scenario: Multi-path diff classifies paths independently
- **WHEN** a diff changes both project-owned and workspace-level paths
- **THEN** the result state is `diff`
- **AND** each child path has its own path classification state
- **AND** child target guidance and recovery instructions do not leak to sibling paths

#### Scenario: Diff includes an unresolved path without dropping classified paths
- **WHEN** a diff contains one classified path and one path with unresolved owner
- **THEN** the result remains `diff`
- **AND** the unresolved path is represented as an unresolved child state
- **AND** the classified path retains its own owner and guidance

### Requirement: Graph Refusal Facts Remain D3-Owned

When D3 reports graph refusal facts, D4 SHALL preserve the D3 category and render
the classify consequence without owning graph truth.

#### Scenario: Missing-project alias is rendered as graph-refusal
- **WHEN** D3 reports that an alias dependency names a project that does not exist
- **THEN** classify renders `graph-refusal`
- **AND** no runnable alias or target command appears in D4 output

#### Scenario: Missing-target alias is rendered as graph-refusal
- **WHEN** D3 reports that an alias dependency names a target absent from the resolved project
- **THEN** classify renders `graph-refusal`
- **AND** D4 does not convert the condition into an unavailable target row unless D3 provided that exact unavailable-target fact

#### Scenario: Graph read failure is rendered as graph-refusal
- **WHEN** D3 reports malformed graph JSON, Nx read failure, or Nx daemon failure
- **THEN** classify renders `graph-refusal`
- **AND** D4 includes recovery guidance
- **AND** D4 withholds graph-backed target guidance

### Requirement: Public Compatibility Is Cited Before Source Edits

Habitat SHALL require concrete D0 `surface_id` rows before D4 implementation
changes `habitat classify` JSON, human output, `Classification`,
`DiffClassification`, supporting classify DTO exports, `classifyPath`,
`classifyTarget`, docs examples, or generated help/manifests. D4 SHALL follow
each cited row's `compatibility_handling`.

#### Scenario: Classify JSON change cites D0 row
- **WHEN** D4 implementation would change classify path JSON or diff JSON
- **THEN** implementation cites the concrete D0 command-json row
- **AND** the D0 handling action is one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`

#### Scenario: Package export change cites D0 row
- **WHEN** D4 implementation would change the compatibility shape of a classify package export
- **THEN** implementation cites the concrete D0 package-export row
- **AND** existing exports are preserved, facaded, versioned, or deprecated only as D0 records

#### Scenario: Missing D0 row blocks source implementation
- **WHEN** a D4-touched public surface lacks a concrete D0 row
- **THEN** D4 source implementation stops
- **AND** accepted D4 design/specification status is not treated as source-change authorization

### Requirement: D14 Consumes A D4 Example Corpus

D4 SHALL hand D14 exact classify examples for topology-fence messaging without
letting D14 infer classify semantics locally.

#### Scenario: D14 receives complete classify example states
- **WHEN** D4 is accepted for design/specification
- **THEN** the downstream handoff names examples for `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, `graph-refusal`, unavailable targets, D2 unresolved routing, and authoring-looking unsupported requests
- **AND** each example includes state name, relevant owner/routing/target facts, recovery instruction where applicable, human-output obligation, and non-claims
- **AND** D14 may not infer generator support, MapGen authoring support, rule correctness, target freshness, apply safety, or verify closure from D4
