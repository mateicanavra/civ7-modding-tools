## ADDED Requirements

### Requirement: D2 Rule Registry Schema Is Versioned And Faceted

Habitat SHALL parse rule metadata through a canonical versioned registry document before consumers use registry facts. The target document SHALL be `RuleRegistryDocument` with `schemaVersion: 1` and a closed `RuleRegistryRecord` union keyed by the current public selector vocabulary `ownerTool`.

Each registry row SHALL carry identity/report facts and only the variant-specific facts valid for its execution adapter. `grit-check` rows SHALL require Grit pattern facts. `file-layer` rows SHALL contain exactly one file-layer policy: a generated/protected-zone reference or a forbidden-file-name policy. `wrapped-test` rows SHALL carry a structured graph target reference. Unknown adapters, unsupported enforcement dispositions, duplicate ids, and contradicted variant fields SHALL fail before rule execution.

#### Scenario: Valid registry row is accepted
- **WHEN** a rule row has a unique `id`, known `ownerProject`, known `ownerTool`, supported `lane`, report facts, and all variant-required facts
- **THEN** Habitat exposes that row through D2 projections
- **AND** consumers do not read the raw JSON row directly

#### Scenario: Identity metadata is missing
- **WHEN** a rule row lacks `id`, `ownerProject`, `ownerTool`, or `lane`
- **THEN** Habitat reports a D1-aligned registry metadata failure before executing, routing, baselining, or silently disabling that rule

#### Scenario: Variant fields are contradicted
- **WHEN** a non-Grit row carries Grit-only facts, a Grit row lacks a pattern, a file-layer row has no file-layer policy, or a wrapped-test row lacks a structured target reference
- **THEN** Habitat refuses the projection that needs that row
- **AND** the failure is not reported as an ordinary rule violation

### Requirement: Rule Metadata Terms Have Closed Target Dispositions

Habitat SHALL classify current registry terms as target-retained, target-renamed, compatibility-only, downstream-owned, or removed before implementation changes public or durable behavior.

`ownerTool` SHALL remain the compatibility selector vocabulary and D2 rule-state discriminant unless D0 later versions or facades it. `scope` SHALL NOT be target authority. `lane` SHALL be treated internally as enforcement disposition and SHALL NOT imply Pattern Authority lifecycle. Unqualified `manifest`, `generatedZone`, `hookScope`, `nxTarget`, `proof`, and `evidence` SHALL NOT appear as target authority terms.

#### Scenario: Legacy scope survives only as compatibility prose
- **WHEN** a command or docs surface still displays the legacy `scope` concept under a D0-compatible public surface
- **THEN** routing, graph, baseline, Grit, generated-zone, hook, and governance consumers still use D2 projections
- **AND** no consumer parses that prose as authority

### Requirement: Consumer Projections Replace Whole Rule Rows

Habitat SHALL expose consumer-specific `RuleProjection` functions as the only cross-domain read surface for registry facts. A consumer SHALL receive only the fields needed for its scenario. Passing or importing whole `RuleRegistryRecord` or legacy `HarnessRule` objects across domain boundaries is forbidden unless D2 records a named exception with a smaller-state rationale.

#### Scenario: Selector consumer receives selector facts
- **WHEN** check selection needs rules by owner, tool, or id
- **THEN** it uses `ruleSelectorFacts`
- **AND** it does not read `scope`, `detect`, `forbids`, `why`, `message`, `remediate`, Grit facts, baseline facts, generated-zone facts, or graph facts

#### Scenario: Whole-row leakage is introduced
- **WHEN** a consumer reads the whole registry row despite having a D2 projection
- **THEN** the implementation fails D2 validation

### Requirement: Selector Facts Are Namespace-Aware

Habitat SHALL model selector facts as closed namespace facts over rule ids, rule owners, and execution adapters. Unknown selectors, wrong namespace selectors, and empty intersections SHALL report selector failures or empty-match outcomes without implying rule execution.

#### Scenario: Wrong selector namespace
- **WHEN** a user supplies a tool value to a rule selector or a rule value to a tool selector
- **THEN** Habitat reports the selector namespace problem through the D1 check/report boundary
- **AND** no rule is executed as a fallback

#### Scenario: Empty selector intersection
- **WHEN** valid selectors intersect to no rules
- **THEN** Habitat returns an explicit selection outcome
- **AND** does not claim the selected rules passed

### Requirement: Routing Facts Do Not Parse Prose Scope

Habitat SHALL replace prose `scope` routing with `ruleRoutingFacts` derived from `PathCoverage`. Path coverage states SHALL be closed: exact path/glob coverage, owner-project coverage, workspace-gate coverage, or unresolved metadata. Classify and orientation consumers SHALL NOT parse human prose fields for routing authority.

#### Scenario: Exact-path routing
- **WHEN** a path matches a typed path/glob coverage declaration
- **THEN** classify reports the rule as exact-path scoped with the matched declaration
- **AND** the result is independent of legacy `scope` prose

#### Scenario: Workspace gate routing
- **WHEN** a workspace-gate rule applies across project boundaries
- **THEN** classify reports a typed workspace-gate state
- **AND** it does not infer workspace scope from words in `scope`

#### Scenario: Routing metadata is unresolved
- **WHEN** a routing consumer needs exact path coverage but the rule lacks the required `PathCoverage`
- **THEN** Habitat reports `unresolved-routing-metadata`
- **AND** it does not guess from prose or owner-project fallback unless that fallback is an explicit `PathCoverage` state

### Requirement: Graph Facts Own Rule Graph Declarations

Habitat SHALL expose `ruleGraphFacts` for graph/Nx consumers. Graph facts SHALL declare owner/root relation from the registry document `ownerRoots` table, rule target alias policy, and structured dependency targets. `plugin.js` SHALL NOT use an independent owner-root table as authority, silently skip unknown owner roots, or parse colon strings as graph truth after D2 implementation.

#### Scenario: Nx target alias uses structured graph facts
- **WHEN** the Nx plugin creates `habitat:rule:<id>` targets
- **THEN** it reads `ruleGraphFacts`
- **AND** dependency targets are structured project/target references rather than parsed colon strings

#### Scenario: Graph owner metadata is unknown
- **WHEN** a rule has no resolvable owner/root relation for a graph consumer
- **THEN** Habitat reports a graph metadata contract failure
- **AND** the plugin does not silently omit the target

### Requirement: Baseline Facts Own Registry Baseline Relations

Habitat SHALL expose `ruleBaselineFacts` for D5 and baseline consumers. D2 SHALL record the registry relation to baseline authority but SHALL NOT own baseline shrink-only behavior, debt lifecycle, expansion authorization, or stale row decisions.

#### Scenario: Baseline relation is explicit
- **WHEN** baseline integrity reads a rule
- **THEN** it receives only `ruleBaselineFacts`
- **AND** the D2 facts contain the rule id and registry baseline relation currently represented by `exceptionPath`
- **AND** it does not parse whole registry rows, infer admission from file presence alone, or receive D5-owned baseline lifecycle state from D2

### Requirement: Grit Facts Own Pattern Identity And Scan Metadata

Habitat SHALL expose `ruleGritFacts` for Grit, diagnostic, and governance consumers. Grit facts SHALL include pattern identity, scan metadata, exclusions, and Pattern Authority reference when present. Local feedback eligibility SHALL be exposed through `ruleLocalFeedbackFacts`, not through Grit execution facts. Grit consumers SHALL NOT fall back from missing pattern identity to rule id, parse Grit markdown prose/frontmatter as registry authority, or infer scan roots from legacy `scope` prose.

#### Scenario: Grit pattern identity is missing
- **WHEN** a `grit-check` rule lacks a Grit pattern identity
- **THEN** Habitat reports a Grit metadata contract failure before Grit execution

#### Scenario: Hook-scoped Grit rule
- **WHEN** staged execution selects local-feedback-eligible Grit rules
- **THEN** it uses `ruleLocalFeedbackFacts` and `ruleGritFacts`
- **AND** it does not read a global optional `hookScope` field from a whole rule row

### Requirement: Generated-Zone Facts Link To Host Declarations

Habitat SHALL expose `ruleFileLayerFacts` for file-layer/generated-zone consumers. D2 SHALL record a rule's generated/protected-zone reference or forbidden-file-name policy. G-HOST and D10 own the host policy and protected-zone decision semantics.

#### Scenario: Known protected-zone reference
- **WHEN** a file-layer rule references a generated/protected-zone declaration
- **THEN** Habitat can project the zone id and host declaration link for D10/D13 consumers
- **AND** D2 does not decide regeneration or mutation policy

#### Scenario: Unknown protected-zone reference
- **WHEN** a file-layer rule references an unknown zone id
- **THEN** Habitat reports a generated-zone metadata contract failure before silently passing or executing the guard

### Requirement: Pattern Authority Facts Project Manifest Relations

Habitat SHALL expose `ruleGovernanceFacts` for Pattern Governance and scaffolding consumers. D2 SHALL record registry-to-Pattern-Authority references where present. D8 owns lifecycle admission, fixture sufficiency, false-positive model, and governance approval.

#### Scenario: Registered Pattern Authority reference is consistent
- **WHEN** a Grit rule references a registered Pattern Authority manifest
- **THEN** `ruleGovernanceFacts` includes only the D2-owned registry relation facts: rule id, lane, pattern name, and manifest path
- **AND** D8 still owns whether the manifest is admitted

#### Scenario: Manifest reference is contradicted
- **WHEN** registry metadata and Pattern Authority manifest metadata disagree on rule id, pattern name, or lifecycle
- **THEN** Habitat reports a Pattern Authority contract failure
- **AND** the rule is not treated as admitted by file presence alone

### Requirement: Malformed Metadata Fails Through D1 Command Outcomes

Habitat SHALL route malformed registry metadata through D1 command/report/refusal boundaries. Missing identity, unknown execution adapter, ambiguous path coverage, missing graph target reference, missing baseline introduction reference, missing Grit pattern identity, unknown protected-zone reference, and contradicted Pattern Authority reference SHALL NOT silently disable rules.

#### Scenario: Malformed metadata blocks execution
- **WHEN** a consumer requires a D2 projection and the registry row is malformed for that projection
- **THEN** Habitat reports the appropriate metadata failure before executing that rule

### Requirement: Registry Metadata Is Allowlist-Only

Habitat SHALL define the allowed rule registry document shape and reject anything outside that shape. D2 SHALL NOT rely on enumerating known bad structures as the primary registry guard; TypeBox schemas and downstream structural enforcement SHALL encode the accepted shape and deny everything else by default.

#### Scenario: Unknown registry field is present
- **WHEN** a rule registry document includes a field outside the accepted D2 schema
- **THEN** Habitat rejects the registry document before consumers infer behavior from that field
- **AND** future exceptions require changing the allowed shape, not adding ad hoc blocklist checks
- **AND** the result is distinguishable from an ordinary structural rule violation

### Requirement: Downstream Dominoes Consume Named D2 Projections

Downstream packets SHALL consume D2 through named projections. D2 SHALL NOT claim graph truth, routing guidance, baseline authority, diagnostic normalization, governance admission, protected-zone policy, hook behavior, scaffolding behavior, or execution provenance.

#### Scenario: D3 consumes graph facts
- **WHEN** D3 designs workspace graph behavior
- **THEN** it consumes `ruleGraphFacts`
- **AND** it owns resolved graph truth and target availability

#### Scenario: D10 consumes generated-zone facts
- **WHEN** D10 designs protected-zone guard behavior
- **THEN** it consumes `ruleFileLayerFacts` plus G-HOST policy declarations
- **AND** it owns guard/refusal behavior rather than D2
