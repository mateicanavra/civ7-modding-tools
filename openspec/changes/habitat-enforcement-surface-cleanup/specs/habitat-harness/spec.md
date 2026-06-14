## ADDED Requirements

### Requirement: Enforcement Surface Is Classified

Habitat SHALL classify every structural enforcement command surface as a
canonical Habitat entrypoint, Habitat-owned Nx target, wrapped legacy mechanism,
direct diagnostic command, or exterior product/runtime verifier before claiming
H6 is current.

#### Scenario: Root structural scripts are audited
- **WHEN** root scripts are audited for structural verification
- **THEN** every `check`, `lint`, `ci:architecture*`, and `habitat*` script
  SHALL have an accepted surface class
- **AND** any canonical structural green script SHALL route through Habitat

#### Scenario: Direct diagnostic script remains
- **WHEN** a direct legacy diagnostic script remains in root scripts
- **THEN** docs and recovery records SHALL state that it is not the canonical
  green structural verification path

### Requirement: Empty Selector Proof Is Rejected

Habitat SHALL NOT use a green report containing only built-in integrity rules as
proof that a requested owner, tool, or rule ran.

#### Scenario: Stale owner tool is selected
- **WHEN** a command selects an owner tool with no matching registered rules
- **THEN** the proof SHALL fail or be blocked on command-surface repair
- **AND** the result SHALL NOT close H6 or any dependent current-proof claim

### Requirement: Wrapper Output Policy Is Explicit

Every surviving wrapped script or wrapped test SHALL have a recorded parser and
proof policy.

#### Scenario: Direct output contains warnings
- **WHEN** a direct wrapped script exits 0 with warnings, debt, or diagnostics
- **THEN** the Habitat wrapper SHALL either project those findings as advisory
  or enforced diagnostics, or the workstream SHALL record why those findings are
  outside the structural claim

#### Scenario: Wrapper remains in default Habitat check
- **WHEN** a wrapped mechanism remains in default `habitat check`
- **THEN** it SHALL have an owner, proof class, retirement trigger, and
  downstream record disposition

#### Scenario: Wrapped test exits zero with output
- **WHEN** a wrapped test exits 0 with skip, warning, setup, prerequisite, or
  debt output
- **THEN** the Habitat wrapper SHALL either project that output as an accepted
  diagnostic class or record why the output is outside the structural claim

### Requirement: Effect Decision Is Evidence-Gated

Habitat SHALL record an Effect adopt/manual decision for any enforcement-surface
implementation slice that changes command orchestration, wrapper execution,
proof provenance, cleanup scopes, service-injected tests, or typed error states.

#### Scenario: Orchestration code is changed
- **WHEN** implementation changes rule selection, command execution, verify
  proof records, hook sequencing, Grit/Biome/Nx process invocation, cleanup
  finalizers, or service-injected test boundaries
- **THEN** the workstream SHALL either adopt an accepted Effect substrate slice
  or record how the manual implementation supplies typed failure states,
  command provenance, cleanup proof, and test substitution
- **AND** Effect SHALL NOT be cited as authority for Grit, Nx, Biome, baseline,
  taxonomy, or product/runtime semantics

### Requirement: Verify Proof Is Whole-Command Truthful

`habitat verify` proof SHALL record the full command outcome rather than only
the inner Habitat check output.

#### Scenario: Verify command is cited
- **WHEN** `habitat verify` is cited as proof
- **THEN** Habitat SHALL emit or generate a structured `VerifyProof` artifact
  with command argv, cwd, selected env, duration, outer exit code, base
  selection, requested selectors, selected real rule ids excluding built-ins,
  Habitat check result, Nx affected target/project list, cache/fresh status
  where relevant, bounded output artifacts, explicit non-claims, and post-run
  worktree/resource state
- **AND** a manually summarized terminal transcript SHALL NOT be sufficient
  closure evidence

#### Scenario: Inner target succeeds but outer command fails
- **WHEN** any inner Habitat, Nx, Biome, Grit, generated-zone, build, check, or
  test target succeeds but the enclosing verify command exits nonzero
- **THEN** the verify proof SHALL be recorded as failing for that command path

### Requirement: CI Proof Classes Are Separated

Habitat SHALL distinguish the CI Habitat structural gate from other CI build,
hygiene, dependency, cache, and test proof classes.

#### Scenario: CI green state is cited
- **WHEN** CI is cited as proof for H6 or dependent workstreams
- **THEN** the record SHALL state which workflow job and step supplied Habitat
  structural verification
- **AND** direct build, Biome hygiene, dependency install, cache, lint alias, and
  test steps SHALL have proof classes and non-claims recorded separately

### Requirement: H6 Records Are Current-Bounded

Historical H6 closure records SHALL NOT be cited as current proof unless this
repair patches or downgrades their closure language.

#### Scenario: H6 record claims one enforcement path
- **WHEN** an implementation closes this repair
- **THEN** `CLAIM-H6-ONE-PATH`, H6 phase records, project workstream records,
  and dependent packets SHALL identify which H6 claims are current, which are
  historical, and which remain owned by other repair packets
