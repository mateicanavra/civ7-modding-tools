## ADDED Requirements

### Requirement: Generated Grit Rules Carry Accepted Authority Metadata

Generated Grit-backed Habitat rules SHALL carry a structured Pattern Authority
Manifest before they can be registered in the Habitat rule pack.

#### Scenario: Generated rule has accepted manifest
- **WHEN** the pattern generator registers a Grit-backed Habitat rule
- **THEN** the rule references a Pattern Authority Manifest containing
  authority source, proving source, owner layer, language/parser support, scan
  roots, fixture strategy, false-positive model, current-tree scan status,
  baseline contract, apply-safety disposition, hook-scope decision, and
  downstream owner

#### Scenario: Generated rule has placeholder metadata
- **WHEN** generated rule metadata contains scaffold/default authority text
- **THEN** the generator refuses registration before pattern, manifest,
  baseline, or `rules.json` files are created, rewritten, or deleted

#### Scenario: Manifest is absent or malformed
- **WHEN** registration is requested without a valid Pattern Authority Manifest
- **THEN** the generator refuses registration and reports the missing or invalid
  manifest fields

### Requirement: Pattern Candidate Creation Is Separate From Rule Registration

Habitat SHALL distinguish candidate pattern generation from registered Habitat
rule creation.

#### Scenario: Candidate pattern is generated
- **WHEN** an agent generates a candidate Grit pattern
- **THEN** Habitat creates only non-enforcing candidate artifacts and SHALL NOT
  create a `rules.json` entry, Habitat baseline file, or hook-scope entry

#### Scenario: Candidate is registered
- **WHEN** a candidate is promoted to a registered rule
- **THEN** Habitat validates the Pattern Authority Manifest, baseline
  rule-introduction manifest, duplicate ids, scan roots, fixture strategy,
  false-positive model, and current-tree scan status before writing registered
  artifacts

### Requirement: Enforced And Hook-Scoped Generated Rules Require Proof

Generated rules SHALL NOT enter enforced or pre-commit scope without accepted
proof records.

#### Scenario: Generated rule requests enforced lane
- **WHEN** a generated Grit-backed rule requests `lane: "enforced"`
- **THEN** Habitat requires accepted authority metadata, accepted baseline
  rule-introduction manifest, native Grit fixture proof, current-tree scan
  result, false-positive controls, and baseline action

#### Scenario: Generated rule requests pre-commit hook scope
- **WHEN** a generated Grit-backed rule requests `hookScope: "pre-commit"`
- **THEN** Habitat requires `registered-enforced` lifecycle plus explicit
  staged-scope, cost, parser, baseline, and false-positive evidence

#### Scenario: Hook scope proof is absent
- **WHEN** hook-scope proof is absent or contradicted
- **THEN** Habitat registers no pre-commit hook scope for the generated rule

### Requirement: Grit Metadata And Habitat Metadata Stay Distinct

Habitat SHALL use Grit-native metadata for Grit behavior and Habitat-owned
metadata for repository authority.

#### Scenario: Generator option schema validates command input
- **WHEN** Nx invokes the Habitat pattern generator
- **THEN** the generator schema validates options and prompts only; it SHALL NOT
  be treated as accepted Habitat authority for the generated rule

#### Scenario: Registered generated pattern is written
- **WHEN** Habitat writes a registered generated Grit pattern
- **THEN** the pattern carries explicit Grit frontmatter for level and tags, an
  explicit Grit language declaration, and native sample sections

#### Scenario: Habitat authority appears only in Grit prose
- **WHEN** authority/proof metadata exists only in a pattern heading,
  description, or frontmatter
- **THEN** Habitat refuses to treat the rule as accepted repository authority

### Requirement: Registered Promotion Has Accepted Orchestration Design

Habitat SHALL NOT implement registered generated-rule promotion through ad hoc
multi-artifact command/file orchestration.

#### Scenario: Registered promotion needs proof orchestration
- **WHEN** registered generated-rule promotion performs command proof,
  dry-run/no-write proof, scoped file transactions, scratch workspace work,
  rollback/diff proof, baseline manifest consumption, or hook-scope proof
  orchestration
- **THEN** the implementation records an accepted Effect fit decision before
  code changes and uses the accepted Effect-backed services if local proof shows
  they fit the slice

#### Scenario: Effect is rejected for registered promotion
- **WHEN** the Effect fit decision rejects Effect for this registered-promotion
  slice
- **THEN** implementation remains blocked until an accepted architecture record
  proves equivalent typed failures, command provenance, service substitution in
  tests, scoped cleanup, and no-write behavior without Effect

#### Scenario: Candidate generation writes draft artifacts
- **WHEN** the generator creates a candidate Grit pattern draft
- **THEN** the candidate path does not require Effect orchestration, but it still
  SHALL NOT write registered rules, baselines, hook scope, or active Habitat
  checks

### Requirement: Generated Rule Registration Preserves Baseline Ownership

Generated Grit rules SHALL consume the scaffold/baseline contract instead of
writing baselines through an independent policy.

#### Scenario: New generated rule is registered
- **WHEN** a generated Grit-backed rule is registered
- **THEN** Habitat requires the accepted rule-introduction baseline manifest and
  committed baseline file behavior defined by
  `habitat-scaffold-contract-repair`

#### Scenario: Baseline manifest blocks registration
- **WHEN** the baseline manifest is missing, malformed, placeholder, or blocks
  the requested baseline action
- **THEN** generated rule registration refuses before any baseline or rule-pack
  write

### Requirement: Agent Guidance Does Not Overclaim Generator Output

Habitat SHALL keep agent-facing generator guidance aligned with accepted
metadata and proof gates.

#### Scenario: README or AGENTS describes pattern generation
- **WHEN** README or AGENTS mentions creating new Grit-backed rules
- **THEN** the guidance states that candidate generation is not enforcement and
  registered enforcement requires accepted authority metadata, baseline
  contract, current-tree proof, fixture strategy, and hook-scope decision
