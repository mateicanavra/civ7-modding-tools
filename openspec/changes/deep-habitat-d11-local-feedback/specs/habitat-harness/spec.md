## ADDED Requirements

### Requirement: Hook Commands Provide Local Feedback Only

Habitat SHALL treat `habitat hook pre-commit` and `habitat hook pre-push` as
local repo-maintenance feedback entrypoints. Runtime hook output and structured
hook data SHALL describe hook results, command outcomes, refused conditions,
paths, recovery instructions, and affected-command results; they SHALL NOT
encode implementation packet ids, packet owner labels, process/review workflow
state, or process-audit vocabulary.

#### Scenario: Pre-commit completes local feedback
- **WHEN** pre-commit completes every required local check with pass or
  explicitly not-applicable outcomes
- **THEN** Habitat reports a local-feedback pass
- **AND** the result is limited to hook-local feedback while CI, review,
  OpenSpec, Graphite, safe-apply, generated-freshness, graph-completeness, and
  product/runtime readiness remain with their owning commands.

#### Scenario: Pre-push completes local feedback
- **WHEN** pre-push resolves an affected base and the affected-target command
  completes successfully
- **THEN** Habitat reports a local-feedback pass
- **AND** the result remains local command feedback, not Graphite, CI, review,
  graph, or release authority.

#### Scenario: Unsupported hook name is requested
- **WHEN** a user invokes a hook name outside the supported command set
- **THEN** Habitat refuses the command with the supported hook names
- **AND** no hook result is reported as passing.

### Requirement: Resource Decisions Derive Commit Allowance From The Variant

Habitat SHALL model resource pre-commit state as a closed decision where commit
allowance is derived from the discriminated variant, not stored as an
independently writable boolean.

#### Scenario: Resource state allows pre-commit
- **WHEN** resources are `clean`, `not-configured`, or `staged-gitlink` with the
  resource worktree clean
- **THEN** Habitat represents the resource decision as allowed
- **AND** any public compatibility field that exposes a boolean is derived from
  the allowed variant.

#### Scenario: Resource state refuses pre-commit
- **WHEN** resources are dirty, locked, uninitialized, have an unstaged gitlink,
  or cannot be inspected
- **THEN** Habitat represents the resource decision as refused with recovery
  instructions
- **AND** no representation can carry the refused variant together with commit
  allowance.

#### Scenario: Dirty resource worktree and staged gitlink coexist
- **WHEN** a resource has a staged gitlink and the resource worktree is dirty
- **THEN** the dirty-resource refusal wins
- **AND** later pre-commit checks do not run.

### Requirement: Pre-Commit Pipeline Is Closed And Product-Named

Habitat SHALL run pre-commit as an ordered hook pipeline: resource decision,
staged path selection, structural check, partial-staging decision, formatter,
formatter restage, diagnostic check, and terminal hook result. Runtime records
for this pipeline SHALL use product concepts such as command phase, outcome,
result, reason, recovery, and path list; they SHALL NOT use D-number owner
fields, packet authority labels, or process-audit vocabulary.

#### Scenario: Required step refuses or fails
- **WHEN** any required pre-commit step returns a refusal, failed command,
  unavailable required result, malformed structured result, or contradictory
  result
- **THEN** the pre-commit terminal outcome is not pass
- **AND** Habitat stops before any downstream step that depends on the refused
  or failed step.

#### Scenario: No staged paths need a step
- **WHEN** a step is not applicable because no staged paths enter that step
- **THEN** Habitat records or renders the step as not applicable when that state
  is surfaced
- **AND** the not-applicable result does not hide required results for steps
  that are still applicable.

### Requirement: Structural And Diagnostic Checks Use Structured Check Results

Habitat SHALL consume structured check results for staged structural and
diagnostic feedback. Hook code SHALL NOT parse human output or raw tool text to
recompute structural policy, protected-path policy, diagnostic identity, or
adapter failure semantics.

#### Scenario: Structured check passes
- **WHEN** a staged check result passes or reports only allowed advisory or
  not-applicable outcomes
- **THEN** the hook may continue past that check.

#### Scenario: Structured check refuses or fails
- **WHEN** a staged check result reports selector refusal, dependency refusal,
  baseline refusal, diagnostic unavailability, protected-path refusal, or
  structural failure
- **THEN** Habitat reports non-pass local feedback
- **AND** no downstream formatting, diagnostic, publish, or restage step runs
  when it depends on the refused or failed step.

#### Scenario: Structured check is unavailable or malformed
- **WHEN** a required structured check result is unavailable, missing, malformed,
  contradictory, or cannot be validated
- **THEN** Habitat reports blocked or failed local feedback
- **AND** hook pass is impossible for that required check.

### Requirement: Protected Mutation Refusals Remain Policy Results

Habitat SHALL consume protected/generated/forbidden mutation refusals as policy
results produced by the structural check path or protected-zone service. Hook
code SHALL NOT match protected paths locally to decide protected-zone policy.

#### Scenario: Protected mutation is refused
- **WHEN** a structured result reports refused direct generated edit, refused
  direct protected edit, refused forbidden artifact, missing declaration,
  declaration conflict, malformed metadata, or unknown zone reference
- **THEN** Habitat reports blocked pre-commit local feedback
- **AND** Habitat stops before formatter, diagnostic, publish, and restage
  operations that depend on the refused path.

#### Scenario: Protected mutation details are rendered
- **WHEN** Habitat renders protected mutation feedback
- **THEN** the output names the repo-relative path, action, reason, and recovery
  instruction supplied by the policy result
- **AND** Habitat does not recompute the protected-zone decision.

### Requirement: Partial Staging And Formatter Restage Are Bounded

Habitat SHALL keep partial-staging refusal and formatter restage as hook-local
safety decisions with exact write boundaries.

#### Scenario: Partially staged supported path is detected
- **WHEN** a formatter-supported staged path also has unstaged changes
- **THEN** Habitat refuses before formatting, restaging, diagnostic checks,
  resource publish, and generated publish
- **AND** Habitat does not stash, reset, checkout, or rewrite the worktree to
  inspect the path.

#### Scenario: Formatter changes staged files
- **WHEN** formatting changes staged candidate files
- **THEN** Habitat restages only formatter-touched staged candidate paths
- **AND** unchanged paths, foreign staged paths, and unstaged-only paths are not
  restaged.

#### Scenario: Formatter or restage command fails
- **WHEN** format, format-check, or `git add --` for formatter-touched paths
  fails
- **THEN** Habitat reports local feedback failure
- **AND** no later diagnostic or publish step is treated as passing.

### Requirement: Transaction Feedback Does Not Claim Apply Safety

Habitat SHALL surface apply/fix or transaction recovery feedback only from
structured transaction results where that feature is implemented. Hook code SHALL
NOT infer apply safety from changed paths, dry-run text, diagnostics, formatter
results, or staged state.

#### Scenario: Transaction feedback is surfaced
- **WHEN** hook output renders apply/fix or transaction recovery feedback
- **THEN** Habitat uses structured transaction state for unavailable, refused,
  dry-run, applied, rolled-back, rollback-failed, or recovery-required outcomes
- **AND** the output remains local feedback rather than safe-apply completion.

#### Scenario: Transaction feedback is unavailable
- **WHEN** required transaction feedback is unavailable or refused
- **THEN** Habitat reports non-pass local feedback for that step
- **AND** Habitat does not recompute transaction safety locally.

### Requirement: Pre-Push Feedback Refuses Unknown Base State

Habitat SHALL model pre-push as local affected-target feedback. It SHALL use an
explicit base, a Graphite parent, or the remote default branch merge-base when
one can be resolved. It SHALL refuse when no affected base can be resolved
instead of treating a literal branch name as a successful base.

#### Scenario: Explicit pre-push base is supplied
- **WHEN** a user provides an explicit pre-push base
- **THEN** Habitat records or renders an explicit-base decision
- **AND** Habitat does not probe Graphite or merge-base before running the local
  affected command.

#### Scenario: Graphite or merge-base provides a local base
- **WHEN** Habitat observes a Graphite parent or merge-base candidate
- **THEN** Habitat records or renders the base provenance
- **AND** the result remains local feedback, not Graphite readiness or review
  readiness.

#### Scenario: No base can be resolved
- **WHEN** Habitat cannot resolve an explicit base, Graphite parent, or
  merge-base candidate
- **THEN** Habitat refuses pre-push local feedback with a recovery instruction
  to pass `--base`
- **AND** Habitat does not run affected targets with an optimistic default base.

#### Scenario: Affected command fails
- **WHEN** the affected command exits nonzero
- **THEN** Habitat reports affected-target local feedback failure
- **AND** Habitat does not reinterpret the failure as CI, graph, or review
  authority.

### Requirement: Public Surface Compatibility Blocks Source Changes

Habitat SHALL block source changes for any touched hook public or durable surface
until the surface has a concrete D0 compatibility row and any relevant output
family handling is explicit. Compatibility records may cite implementation
packets as provenance, but runtime DTOs and command JSON SHALL NOT encode packet
ids as product fields.

#### Scenario: Hook output text changes
- **WHEN** D11 changes hook human output, hook notice wording, help text,
  command description, or command exit behavior
- **THEN** the implementation cites the concrete D0 row and closed compatibility
  handling
- **AND** runtime output remains product hook feedback, not packet-process
  vocabulary.

#### Scenario: Hook trace or export changes
- **WHEN** D11 changes `HookTrace`, `PreCommitTrace`, `PrePushTrace`,
  `HookCommandRecord`, exported hook types, package exports, docs examples, or
  Husky delegator behavior
- **THEN** the implementation cites the concrete D0 row and output-family
  decision
- **AND** silent shape drift is refused.

### Requirement: False-Green States Are Refused

Habitat SHALL make hook pass impossible after unavailable required structured
result, contradictory structured result, parse or adapter failure for a required
diagnostic step, protected mutation refusal, partial staging refusal,
formatter/restage failure, unknown affected base, or affected-target failure.

#### Scenario: Required result is absent
- **WHEN** a required structured result is missing, unavailable, malformed, or
  contradictory
- **THEN** Habitat reports blocked or failed local feedback
- **AND** Habitat does not use previous command text, unstructured command text, or
  optimistic default state to report pass.

#### Scenario: Structured report contradicts hook result
- **WHEN** structured hook data and terminal status disagree
- **THEN** Habitat refuses the pass state
- **AND** the implementation must repair the contradiction rather than emit a
  successful hook result.
