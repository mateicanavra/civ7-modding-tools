## ADDED Requirements

### Requirement: Current Grit Tranche Proof Classes Stay Separate

Habitat SHALL NOT claim the current Grit tranche is enforced, parity-proven, or
safe to rewrite from one green command. Native Grit samples, current-tree scan,
injected violation, Habitat baseline behavior, old-mechanism parity, Nx
scheduling, dry-run no-write, applied diff, rollback, and type/test proof SHALL
be recorded as separate proof classes.

#### Scenario: Native samples pass
- **WHEN** `GRIT_TELEMETRY_DISABLED=true grit patterns test --json` exits 0
  with all current pattern reports successful
- **THEN** Habitat records native sample proof and explicitly does not claim
  current-tree enforcement, baseline behavior, old-mechanism parity, or apply
  safety from that result alone

#### Scenario: Nx grit target passes
- **WHEN** `bun run nx run @internal/habitat-harness:grit:check --outputStyle=static`
  exits 0
- **THEN** Habitat records Nx scheduling proof and separately records whether
  the task used fresh execution or cache

### Requirement: Current-Tree Grit Proof Uses Habitat Rule Mapping

Current-tree proof for the Grit tranche SHALL run through the Habitat rule-pack
mapping path that future agents use. The proof SHALL name scan roots,
exclusions, command provenance, selected rules, rule ids, baseline state, and
non-claims.

#### Scenario: Valid Grit tool selector is requested
- **WHEN** an agent runs `bun run habitat:check -- --json --tool grit-check`
- **THEN** the schemaVersion 1 report includes all current Grit check rule ids
  plus `baseline-integrity`, records the declared scan roots, and classifies
  the result as Habitat current-tree wrapper proof

#### Scenario: Grit tool id is passed as a rule id
- **WHEN** an agent runs `bun run habitat:check -- --json --rule grit-check`
  after `habitat-oclif-entrypoint-repair`
- **THEN** the command exits non-zero with a selector diagnostic explaining the
  namespace mismatch, and SHALL NOT emit a successful report containing only
  `baseline-integrity`

#### Scenario: Individual Grit rule id is requested
- **WHEN** an agent runs `bun run habitat:check -- --json --rule <grit-rule-id>`
  for each current Grit rule id
- **THEN** the report contains exactly that selected Grit rule plus
  `baseline-integrity`, or a failing selector diagnostic if the rule id is not
  registered

### Requirement: Injected Violations Prove Rule Mapping

Each current enforced Grit check SHALL have a controlled injected violation
proof that exercises the real Habitat wrapper path and fails the expected
Habitat rule id.

#### Scenario: Injected source matches a Grit rule
- **WHEN** the proof harness creates a controlled probe file under an approved
  scan root and runs Habitat Grit check
- **THEN** Habitat exits non-zero, reports the expected rule id, marks the
  finding unbaselined, and records the probe path and command proof metadata

#### Scenario: Injected path is inside all effective scopes
- **WHEN** an injected violation path is selected for a rule
- **THEN** the proof matrix records the Habitat adapter root, `rules.json`
  scope, Grit filename/source predicate, injected path, and a nearby
  path-control probe outside effective scope

#### Scenario: Probe cleanup runs
- **WHEN** an injected violation proof completes or fails
- **THEN** the harness removes every probe file it created and verifies
  `git status --short` is clean before closure

### Requirement: Grit Baseline Semantics Are Explicit

Current Grit checks SHALL have explicit committed empty baseline files. Habitat
SHALL NOT rely on missing-file-as-empty-lock behavior as proof for the current
Grit tranche, and stale records SHALL NOT claim explicit baseline files when
none exist.

#### Scenario: Explicit empty baseline files are recorded
- **WHEN** implementation records a current Grit rule as locked
- **THEN** a committed baseline file exists for that rule, baseline-integrity
  accepts it, and baseline expansion remains shrink-only under the accepted
  policy

#### Scenario: Historical records relied on missing baseline behavior
- **WHEN** older H5/H6 records describe the current Grit checks as locked before
  explicit baseline files existed
- **THEN** those records are updated to classify the old state as historical
  missing-file behavior and point to this repair for explicit Grit baselines

### Requirement: Existing Apply Pattern Has Safety Proof

The existing `deep_import_to_public_surface` apply pattern SHALL remain
implemented-but-under-proven until Habitat records dry-run no-write behavior,
applied diff behavior, target export existence, type-only preservation, Biome
handoff, selected type/test proof, rollback, and clean worktree closure.

#### Scenario: Dry-run apply has an injected match
- **WHEN** an injected file contains a matching deep domain ops import and an
  agent runs `bun run habitat:fix -- --dry-run`
- **THEN** no source file changes, command output is recorded, and the proof is
  classified as dry-run no-write proof rather than applied-diff proof

#### Scenario: Apply target export is missing
- **WHEN** a matching deep domain ops import names a symbol not exported from
  the public `/ops` surface
- **THEN** Habitat refuses the rewrite or leaves the import unchanged, records
  the missing export as unsafe for apply, and does not claim product
  transformation safety

#### Scenario: Real apply is run on an injected match
- **WHEN** an injected file contains a matching deep domain ops import and an
  agent runs `bun run habitat:fix`
- **THEN** the resulting Git diff changes only approved import specifiers and
  Biome-owned formatting, selected type/test gates pass, and rollback returns
  the worktree to clean state

### Requirement: Grit Adapter Substrate Triggers Are Enforced

Habitat SHALL reopen the implementation substrate decision before adding new
manual Grit adapter machinery for command provenance, parsing, scan-root
services, apply transactions, cleanup, or fake-service tests.

#### Scenario: Adapter hardening needs new typed failure classes
- **WHEN** implementation needs to distinguish Grit command failure, JSON parse
  failure, schema drift, empty scan roots, or pattern projection failure
- **THEN** the workstream opens `habitat-effect-grit-adapter` or a reviewed
  typed adapter design before dependent code changes

#### Scenario: Injected harness needs adapter seams
- **WHEN** implementation needs injectable scan roots, fake command execution,
  exact rule projection records, or cleanup/finalizer behavior for injected
  probes
- **THEN** injected-harness implementation waits for
  `habitat-effect-grit-adapter` or an accepted typed Grit adapter design

#### Scenario: Apply safety needs transaction resources
- **WHEN** implementation needs temp workspaces, file locks, finalizers,
  rollback automation, or interruption cleanup
- **THEN** the workstream opens `habitat-effect-grit-adapter` before depending
  on the codemod proof

#### Scenario: Adapter proof needs command result data
- **WHEN** Grit proof needs argv, cwd, env delta, cache dir, scan roots,
  duration, exit code, stdout, stderr, and failure class as adapter data
- **THEN** the workstream opens `habitat-effect-command-runner` or includes a
  typed command-result contract in `habitat-effect-grit-adapter`

#### Scenario: Adapter parser behavior is accepted
- **WHEN** a Grit adapter substrate is accepted
- **THEN** it includes tests or proof cases for no JSON, malformed JSON,
  wrapper noise, schema drift or missing `results`, empty scan roots, pattern
  miss for a registered rule, and cache provenance

### Requirement: Generated Enforced Grit Rules Require Metadata

Habitat SHALL NOT use the current pattern generator to create new enforced
Grit rules for the first pilot unless the generator requires the proof metadata
from the Grit proof matrix or the pilot records a reviewed stop-gate path.

#### Scenario: New pilot uses generated Grit rule
- **WHEN** a new Grit pilot creates a rule through the pattern generator
- **THEN** the generator requires authority source, proving source, exact scan
  roots, fixture coverage model, false-positive model, baseline policy, and
  hook-scope decision before the rule is wired as enforced

### Requirement: Stale Grit Records Are Reclassified

Historical H5/H6 and project records SHALL NOT continue to claim current Grit
proof classes that fresh evidence has not supplied. Repair closure SHALL update
downstream records so historical proof remains legible and current proof points
to this repair.

#### Scenario: H5 record claims explicit Grit baselines
- **WHEN** fresh proof shows current Grit checks rely on missing baseline files
  or a later accepted baseline policy
- **THEN** the older record is annotated or realigned so it no longer claims
  explicit baseline files for those checks

#### Scenario: H6 retirement depends on H5 parity
- **WHEN** an H6 record uses H5 parity as retirement authority
- **THEN** the repair records whether current parity is proven, unproven, or
  delegated to a later row, and adjusts the retirement claim accordingly
