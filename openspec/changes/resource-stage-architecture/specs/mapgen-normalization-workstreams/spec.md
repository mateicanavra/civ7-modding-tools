## ADDED Requirements

### Requirement: Resource Distribution Uses A Dedicated Resources Stage Target

Resource distribution recovery SHALL target a dedicated `resources` stage rather
than treating the current `placement/plan-resources` topology as the final
architecture.

#### Scenario: Resource stage architecture is designed
- **WHEN** resource distribution work moves beyond root-cause diagnostics
- **THEN** the accepted target includes a recipe-level `resources` stage
- **AND** the stage owns resource corpus handoff, resource input derivation,
  resource earthlike expectations, resource group scoring, resource group
  planning, merged resource intents, typed resource materialization, resource
  placement effects, and resource distribution summaries
- **AND** current `placement` resource behavior is treated as migration evidence
  rather than target authority

### Requirement: Resource Stage Depends On Shared Placement Preparation

The dedicated `resources` stage SHALL consume a shared placement preparation
handoff instead of hiding shared engine-surface maintenance inside resource
planning.

#### Scenario: Placement preparation is split
- **WHEN** stage topology is implemented
- **THEN** shared placement preparation publishes a stable artifact consumed by
  resources, starts, discoveries, and final placement summary
- **AND** pre-resource natural-wonder stamping remains before resource
  materialization until a separate natural-wonders stage is explicitly designed
- **AND** starts and discoveries do not depend on resource strategy execution
  merely to receive a prepared engine surface

### Requirement: Resource Group Steps Require Artifact Boundaries

Resource groups SHALL become stage steps only when they prove real artifact and
verification boundaries.

#### Scenario: A resource group is promoted
- **WHEN** a resource group is proposed as a `resources` stage step
- **THEN** it names consumed input artifacts, a published output artifact, a
  shared official constraint invariant, shared earthlike evidence axes, a
  downstream consumer, and a verification boundary
- **AND** groups that cannot prove those fields remain strategy modules or
  research groups rather than stage steps

### Requirement: Resource Stage Migration Preserves Behavior Before Tuning

Resource stage migration SHALL preserve current behavior until the corpus,
expected ranges, and strategy batch slices are ready to change behavior.

#### Scenario: Resource artifacts are renamed before topology moves
- **WHEN** resource-owned artifact ids are introduced
- **THEN** artifact ownership moves to the resource namespace before the resource
  stage topology move
- **AND** duplicate providers or compatibility aliases are not introduced

#### Scenario: Resources stage shell is implemented
- **WHEN** the `resources` stage is first introduced
- **THEN** tests prove pass-through equivalence with the current resource
  planning/materialization behavior
- **AND** resource tuning, expected-range gates, and symbolic resource id claims
  remain out of scope until their downstream slices land
- **AND** no official aggregate resource generator path is reintroduced

#### Scenario: Resource group plans are merged
- **WHEN** multiple resource group planners publish selected intents
- **THEN** the resources stage resolves cross-group conflicts through a named
  merge step before adapter materialization
- **AND** every selected, suppressed, or blocked intent receives auditable
  reason evidence

### Requirement: Resource Stage Publishes Expectation And Distribution Evidence

The dedicated `resources` stage SHALL publish product evidence that lets later
strategy batches, stats gates, and runtime proof evaluate every
strategy-required resource individually.

#### Scenario: Resource expectations are prepared
- **WHEN** a resource is strategy-required for a supported map context
- **THEN** `resources` publishes an expectation record with min/target/max,
  condition scope, evidence source or inference rule, and gate status
- **AND** a range cannot become a gate until its research note or inference rule
  is recorded

#### Scenario: Resource distribution is summarized
- **WHEN** resource materialization completes
- **THEN** `resources` publishes per-resource planned, eligible, selected,
  placed, rejected, mismatch, reason-bucket, and expectation verdict evidence
- **AND** local stats and runtime proof consume that summary rather than
  strategy internals
- **AND** strategy-required resources with zero planned or zero placed outcomes
  remain visible in the summary

#### Scenario: Runtime proof is collected
- **WHEN** Civ7 runtime logs are used as resource proof
- **THEN** the bounded MapGeneration log window includes resource distribution
  summary telemetry
- **AND** recipe completion without resource summary telemetry remains pipeline
  proof only
