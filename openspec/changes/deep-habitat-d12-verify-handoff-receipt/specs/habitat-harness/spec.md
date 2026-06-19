## ADDED Requirements

### Requirement: Verify Emits A Closed Receipt

`habitat verify --json` SHALL emit a TypeBox-validated `VerifyReceipt` with
closed outcome, base, check-consumption, target-plan, affected-execution, and
post-state fields.

#### Scenario: Verify has no selector flags
- **WHEN** `habitat verify --json` assembles selector state
- **THEN** the receipt records `selectorState.kind == "none"`

#### Scenario: Check allows affected execution
- **WHEN** D7 publishes a check projection that allows affected execution
- **AND** D3 publishes a ready verify target plan
- **THEN** affected Nx targets may run
- **AND** the receipt records `outcome == "succeeded"` when affected Nx exits 0 and post-state observation succeeds

#### Scenario: Check blocks affected execution
- **WHEN** D7 publishes a check projection that blocks affected execution
- **THEN** affected Nx targets are not invoked
- **AND** the receipt records `outcome == "blocked"`
- **AND** `nxAffected.kind == "skipped"`
- **AND** `nxAffected.skipReason == "habitat-check-failed"`

#### Scenario: Target plan is refused
- **WHEN** D3 publishes a graph refusal instead of a ready verify target plan
- **THEN** affected Nx targets are not invoked
- **AND** the receipt records `targetPlan.kind == "target-plan-refused"`
- **AND** `nxAffected.skipReason == "workspace-graph-refused"`

### Requirement: Affected Execution Is Explicit

Verify receipt affected execution SHALL distinguish successful execution,
failed execution, and skipped execution.

#### Scenario: Affected targets execute and pass
- **WHEN** affected Nx exits 0
- **THEN** the receipt records `nxAffected.kind == "executed"`
- **AND** bounded stdout/stderr metadata is recorded

#### Scenario: Affected targets execute and fail
- **WHEN** affected Nx exits nonzero
- **THEN** the receipt records `nxAffected.kind == "failed"`
- **AND** the receipt records `outcome == "failed"`
- **AND** bounded stdout/stderr metadata remains available

#### Scenario: Affected targets are skipped
- **WHEN** upstream check or graph state prevents affected execution
- **THEN** the receipt records `nxAffected.kind == "skipped"`
- **AND** stdout/stderr lengths are 0
- **AND** no project list or task cache observations are synthesized

### Requirement: Affected Invocation Uses Graph-Owned Targets

`habitat verify` SHALL construct affected Nx invocation from D3 verify target
planning and D12 base selection.

#### Scenario: Target plan is ready
- **WHEN** affected execution is admitted
- **THEN** the command uses targets from the D3 verify target plan
- **AND** the command includes `--base <resolved-base>`
- **AND** the command includes `--head HEAD`
- **AND** the command includes `--outputStyle=static`
- **AND** the receipt records the full argv

### Requirement: Command Output Is Bounded

Verify receipt SHALL record bounded command-output metadata instead of embedding
raw command-output bodies.

#### Scenario: Nx output is large
- **WHEN** affected Nx emits stdout or stderr larger than the preview limit
- **THEN** the receipt records full stream lengths
- **AND** the preview is truncated
- **AND** truncation flags are true for the truncated stream

#### Scenario: Cache state is observed
- **WHEN** Nx output indicates a task read existing cache output
- **THEN** the receipt records `cacheState == "cache-hit"` for that task

#### Scenario: Cache state is not observed
- **WHEN** Nx output has no supported cache signal for a task
- **THEN** the receipt records `cacheState == "not-observed"`

### Requirement: Base And Post-State Are Observations

Verify receipt SHALL record base source and post-state as command observations.

#### Scenario: Base comes from flag
- **WHEN** the user passes `--base <ref>`
- **THEN** the receipt records `base.source == "flag"`
- **AND** the requested and resolved base values are both recorded

#### Scenario: Base comes from merge base
- **WHEN** no base flag is supplied and merge-base resolution succeeds
- **THEN** the receipt records `base.source == "merge-base"`

#### Scenario: Post-state command succeeds
- **WHEN** `git status --short --branch` exits 0
- **THEN** the receipt records `postState.kind == "observed-clean"` or `postState.kind == "observed-dirty"`
- **AND** bounded command metadata is recorded

#### Scenario: Post-state command fails
- **WHEN** post-state observation command exits nonzero
- **THEN** the receipt records `postState.kind == "unavailable"`
- **AND** the receipt outcome is not `succeeded`

### Requirement: Diagnostic Verify Remains Distinct From Root Verify

`habitat verify` SHALL remain a diagnostic Habitat command receipt and SHALL NOT
replace root `bun run verify`.

#### Scenario: Verify help or docs mention command scope
- **WHEN** help text or docs describe `habitat verify`
- **THEN** they describe it as a local Habitat receipt command
- **AND** they do not present it as CI, root aggregate verification, product approval, or PR readiness
