## ADDED Requirements

### Requirement: Habitat Grit Adapter Uses Typed Effect Substrate

Habitat SHALL implement the Grit check/apply adapter through an Effect-backed
substrate that separates rule findings from infrastructure failures and keeps
Effect execution at command, hook, or adapter host boundaries.

#### Scenario: Rule finding is produced by Grit
- **WHEN** Grit reports a matching Habitat-enforced pattern
- **THEN** Habitat records the match as CheckReport rule data rather than as an
  Effect failure

#### Scenario: Grit output cannot be parsed
- **WHEN** the Grit adapter receives no JSON, malformed JSON, unsupported
  wrapper noise, or schema drift
- **THEN** Habitat records a tagged adapter failure and SHALL NOT report the
  requested Grit rule as passing

#### Scenario: Reusable rule library is inspected
- **WHEN** the implementation is reviewed
- **THEN** `Effect.run*` calls are present only at approved host boundaries and
  not scattered through reusable rule or parser libraries

### Requirement: Grit Command Results Carry Proof Provenance

Every Grit command used as Habitat proof SHALL produce a typed command result
that records executable, argv, cwd, Git state, env delta, scan roots, cache
policy, timing, exit status, stdout/stderr artifact or digest, parse status,
failure tag, and non-claims.

#### Scenario: Grit check command succeeds
- **WHEN** the adapter runs a Grit check command
- **THEN** the command result records exact argv, cwd, Git branch and commit,
  dirty-state marker, env delta, scan roots, cache policy, duration, exit code,
  stdout/stderr capture, raw output digest, and proof non-claims

#### Scenario: Grit executable is unavailable
- **WHEN** the adapter cannot execute the Grit command
- **THEN** the command result carries `GritToolUnavailable` and preserves the
  attempted executable, argv, cwd, env delta, and failure context

#### Scenario: Proof requires freshness
- **WHEN** a proof row requires fresh Grit execution
- **THEN** the command result records cache/fresh status when observable, and
  the proof fails if freshness cannot be established

#### Scenario: Probe or apply mutates files
- **WHEN** an injected probe or apply transaction creates, edits, or removes
  files
- **THEN** the proof record includes before/after Git status, status digest,
  branch, HEAD commit, and final clean or cleanup-failure state

### Requirement: Adapter Proof Artifacts Are Durable And Linked

Habitat SHALL persist adapter proof data in adapter-local proof artifacts and
link accepted proof labels to the consuming Grit proof matrix or command proof
log. CheckReport schemaVersion 1 SHALL NOT be changed by this packet.

#### Scenario: Adapter proof is accepted by Grit proof repair
- **WHEN** `habitat-grit-proof-repair` consumes an adapter command result
- **THEN** the adapter proof artifact has a stable proof id, schema version,
  artifact path, source tree identity, normalized summary, raw output digest or
  path, redaction record, retention status, proof class, non-claims, and a
  link from `workstream/command-proof-log.md` or the proof matrix

#### Scenario: Adapter proof is smoke proof only
- **WHEN** an adapter proof artifact is not consumed by a current Grit row
- **THEN** the artifact explicitly states it is adapter smoke proof and SHALL
  NOT be used as current-row proof

#### Scenario: Sensitive environment values are present
- **WHEN** command env deltas include sensitive keys
- **THEN** persisted proof artifacts redact values and record the redacted keys

### Requirement: Baseline Policy Remains Outside The Grit Adapter

Habitat SHALL keep baseline policy and baseline file mutation outside the Grit
adapter. The adapter MAY read supplied baseline snapshots and emit finding
identity, baseline key, and baselined/unbaselined metadata for existing Habitat
baseline flows.

#### Scenario: Adapter classifies findings
- **WHEN** the adapter projects raw Grit findings to Habitat rule ids
- **THEN** it may attach baseline keys and baselined/unbaselined classification
  supplied by existing Habitat baseline services

#### Scenario: Baseline mutation is requested
- **WHEN** adapter code would create, expand, shrink, or delete baseline files
- **THEN** implementation is invalid; existing Habitat baseline expansion flows
  and the scaffold/baseline contract repair own baseline mutation

### Requirement: Grit Output Parser Fails Closed

Habitat SHALL treat raw Grit JSON/JSONL as an adapter input format, not as the
durable Habitat proof schema. The adapter SHALL validate the accepted raw
schema for the pinned Grit CLI version and fail closed on unsupported output.

#### Scenario: Check JSON omits results
- **WHEN** Grit check output lacks the expected `results` data
- **THEN** the adapter returns `GritSchemaDrift` or
  `GritUnexpectedResultShape` and emits no passing Grit rule report for the
  requested proof

#### Scenario: Wrapper text surrounds JSON
- **WHEN** stdout or stderr includes wrapper text around JSON
- **THEN** the adapter accepts it only if the parser contract explicitly covers
  that shape; otherwise it records a parser failure

#### Scenario: Raw output is retained for audit
- **WHEN** the adapter parses raw Grit output
- **THEN** it records a raw output digest or artifact path and a normalized
  Habitat proof summary

### Requirement: Grit Projection Proves Pattern Identity

Habitat SHALL project raw Grit findings to Habitat rule ids through exact
pattern identity and configured rule mapping. Valid zero-findings, empty scan
roots, pattern projection misses, and unexpected pattern identities SHALL be
distinct outcomes.

#### Scenario: Registered rule has no projected pattern
- **WHEN** a requested Habitat Grit rule has no matching raw pattern identity
  in a proof that expects that pattern
- **THEN** the adapter returns `GritPatternProjectionMiss` rather than a
  passing rule report

#### Scenario: Finding belongs to unexpected pattern
- **WHEN** raw output contains a pattern outside the requested proof set
- **THEN** the adapter records `GritUnexpectedPatternIdentity` or a failing
  projection diagnostic and does not hide the finding

#### Scenario: Scan roots are empty
- **WHEN** effective scan roots are empty after Habitat validation
- **THEN** the adapter records `GritEmptyScanRoots` and SHALL NOT treat the run
  as a valid clean-tree proof

### Requirement: Injected Violation Harness Cleans Up And Proves Rule Mapping

Habitat SHALL provide a controlled injected-violation harness for current Grit
checks. The harness SHALL create probes only under approved scan roots, run the
real Habitat Grit adapter path, assert exact Habitat rule projection, and clean
all probe files under every outcome.

#### Scenario: Current check row enters injected proof
- **WHEN** an injected proof is prepared for a current Grit check row
- **THEN** the row supplies Habitat adapter root, `rules.json` scope, Grit
  `$filename` or source predicate, exact scan roots, exact exclusions, matching
  probe path, and outside-scope control probe

#### Scenario: Probe path is approved
- **WHEN** a Grit proof row requests an injected probe path under an approved
  scan root
- **THEN** the harness creates the probe through a scoped resource and records
  the path, expected rule id, and command proof id

#### Scenario: Probe path is protected
- **WHEN** a requested probe path is under generated, protected, ignored, or
  non-approved roots
- **THEN** the harness refuses the probe before file creation

#### Scenario: Probe triggers expected rule
- **WHEN** the harness runs Habitat Grit check against an injected violation
- **THEN** Habitat reports the exact expected rule id as failing and records
  the finding as unbaselined

#### Scenario: Control probe is outside effective scope
- **WHEN** the harness runs the outside-scope control probe for a current check
- **THEN** the expected rule id does not appear for that control probe

#### Scenario: Probe run fails
- **WHEN** command execution, parsing, projection, or assertion fails during an
  injected proof
- **THEN** scoped cleanup still removes created probe files and final status
  proves the worktree is clean or records cleanup failure explicitly

### Requirement: Existing Grit Apply Pattern Runs Through Transaction

Habitat SHALL run `deep_import_to_public_surface` apply proof through a
transaction boundary that validates clean state, target exports, dry-run
candidate rewrites, approved diff shape, Biome handoff, selected type/test
gates, rollback, and final clean status.

#### Scenario: Worktree is dirty before apply
- **WHEN** the adapter is asked to apply the codemod against a dirty developer
  tree without an isolated transaction copy
- **THEN** it records `GritApplyDirtyWorktree` and refuses the write

#### Scenario: Public target export is missing
- **WHEN** a candidate rewrite imports a symbol that is not exported from the
  public `/ops` surface
- **THEN** the adapter records `GritApplyMissingTargetExport` and refuses that
  rewrite

#### Scenario: Dry-run rewrite set is unexpected
- **WHEN** dry-run or transaction-copy evidence includes unexpected files,
  ranges, create/remove operations, or specifier changes
- **THEN** the adapter records an apply transaction failure and does not write
  the developer tree

#### Scenario: Candidate rewrite inventory is collected
- **WHEN** dry-run or transaction-copy evidence is produced over exact roots
- **THEN** every candidate rewrite is inventoried with file, symbol, current
  import source, proposed import source, range, raw output digest, and
  classification as expected, pre-approved, rejected, or blocked

#### Scenario: Live candidate rewrite is unexpected
- **WHEN** a live-tree candidate rewrite is not part of the approved inventory
- **THEN** the adapter blocks apply and records the candidate instead of
  silently applying it

#### Scenario: Apply succeeds
- **WHEN** the approved apply transaction completes
- **THEN** Habitat records the applied diff, Biome handoff, selected type/test
  proof, rollback proof, and final clean worktree state

#### Scenario: Downstream gate fails after write
- **WHEN** Biome, typecheck, or selected test gates fail after the transaction
  writes files
- **THEN** the adapter runs rollback/finalizers, records the failure and
  rollback proof, and blocks closure until final clean status is proven

#### Scenario: Apply is interrupted
- **WHEN** the apply transaction is interrupted during or after a write
- **THEN** scoped finalizers run and the proof records final clean status or a
  `GritApplyRollbackFailed` failure

#### Scenario: Rollback fails
- **WHEN** rollback cannot restore the transaction state
- **THEN** the adapter records `GritApplyRollbackFailed`, preserves recovery
  evidence, and blocks closure until the dirty state is manually resolved and
  recorded

### Requirement: Effect Dependency Adoption Preserves Command Parity

Habitat SHALL add Effect dependencies to the Habitat harness only through a
versioned dependency/platform proof that preserves existing root, development,
and built command behavior.

#### Scenario: Implementation starts
- **WHEN** implementation begins dependency or runtime work
- **THEN** the workstream refreshes official Effect/GritQL/Biome/Nx evidence or
  records that the existing packs remain current, inspects repo-local Effect
  usage, and records the exact platform runtime strategy for Bun dev and built
  runner paths

#### Scenario: Dependency versions are selected
- **WHEN** implementation adds Effect packages
- **THEN** the task record names exact package versions, platform package,
  workspace lockfile impact, and Bun/Node compatibility proof

#### Scenario: Bun dev path is tested
- **WHEN** the adapter parity probe runs through the Bun development path
- **THEN** command execution, scoped cleanup, tagged failure, and fake service
  provision all pass against the accepted command-surface contract

#### Scenario: Built runner path is tested
- **WHEN** the adapter parity probe runs through the built runner path
- **THEN** the same command, cleanup, tagged failure, and fake service proof
  passes against the accepted command-surface contract after a fresh build

#### Scenario: Command trust repair has not landed
- **WHEN** root help, subcommand help, or selector-truth proof depends on
  `habitat-oclif-entrypoint-repair`
- **THEN** this adapter records those claims as unclaimed until the accepted
  command-surface contract lands and passes

### Requirement: Biome And Nx Remain Separate Owner Layers

Habitat SHALL NOT use Effect or the Grit adapter to claim Biome formatting
semantics, Nx scheduling/cache semantics, or product/runtime behavior.

#### Scenario: Biome formats after apply
- **WHEN** a Grit apply transaction invokes Biome
- **THEN** Habitat records Biome command provenance and changed paths, but the
  adapter claims only the approved handoff and observed command result

#### Scenario: Nx schedules a Grit target
- **WHEN** proof runs through an Nx target
- **THEN** Habitat records Nx scheduling and cache/fresh status separately from
  live Grit behavior proof

#### Scenario: Product runtime proof is requested
- **WHEN** a user-facing Civ7 product claim depends on runtime behavior
- **THEN** Grit adapter proof alone is insufficient and the claim requires the
  appropriate runtime proof class
