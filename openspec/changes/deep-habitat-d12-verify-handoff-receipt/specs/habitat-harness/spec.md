## ADDED Requirements

### Requirement: Verify Handoff Receipt Uses Closed States

Habitat verify SHALL assemble a `VerifyReceipt` from D7 check projection, D3
target-plan projection, affected Nx command observation, post-state
observation, and D1 non-claims. It SHALL NOT use an absent object, `{}` selector
placeholder, optional affected result, or free-form disclaimer list to represent
receipt state.

#### Scenario: Verify has no selector flags
- **WHEN** `habitat verify --json` assembles selector state
- **THEN** the receipt records `selectorState.kind == "none"`
- **AND** the receipt does not emit `{}` as target selector semantics

#### Scenario: Check allows affected execution
- **WHEN** D7 publishes a `VerifyCheckSummaryProjection` that allows affected execution
- **AND** D3 publishes a ready `VerifyTargetPlan`
- **THEN** D12 may invoke affected Nx targets
- **AND** the receipt records check consumption and target-plan consumption as owner-sourced upstream states

#### Scenario: Check blocks affected execution
- **WHEN** D7 publishes a check projection that blocks affected execution
- **THEN** D12 records `AffectedTargetExecution.kind == "skipped"`
- **AND** the skipped state carries the D7-sourced skipped-affected reason
- **AND** the skipped state carries no affected command output, no project list, no task cache observations, and no Nx numeric exit code

#### Scenario: Check projection is unavailable
- **WHEN** D12 cannot consume the D7 check projection
- **THEN** the receipt outcome is `blocked`
- **AND** affected Nx targets are not invoked

#### Scenario: Target plan is refused
- **WHEN** D3 publishes a graph refusal instead of a ready verify target plan
- **THEN** D12 records `VerifyTargetPlanConsumption.kind == "target-plan-refused"`
- **AND** the receipt outcome is `blocked` or `refused`
- **AND** affected Nx targets are not invoked

#### Scenario: Target plan is unavailable
- **WHEN** D12 cannot consume the D3 verify target plan
- **THEN** the receipt records `VerifyTargetPlanConsumption.kind == "target-plan-unavailable"`
- **AND** affected Nx targets are not invoked

### Requirement: Affected Target Execution Uses Upstream Skipped Semantics

Habitat verify SHALL distinguish affected target execution that passed, affected
target execution that failed, and affected target execution skipped by upstream
state. A nonzero affected Nx exit SHALL NOT be represented as a passing
executed receipt.

#### Scenario: Affected targets execute and pass
- **WHEN** D7 allows affected execution
- **AND** D3 provides a ready target plan
- **AND** affected Nx exits 0
- **THEN** D12 records `AffectedTargetExecution.kind == "executed"`
- **AND** the receipt records bounded stdout/stderr, truncation flags, invoked targets, observed projects, and task cache observations

#### Scenario: Affected targets execute and fail
- **WHEN** D7 allows affected execution
- **AND** D3 provides a ready target plan
- **AND** affected Nx exits nonzero
- **THEN** D12 records `AffectedTargetExecution.kind == "failed"`
- **AND** the receipt outcome is `failed`
- **AND** bounded stdout/stderr and exit status remain available for review

#### Scenario: Affected targets are skipped
- **WHEN** D7 or D3 prevents affected execution
- **THEN** D12 records `AffectedTargetExecution.kind == "skipped"`
- **AND** D12 does not synthesize command output or task cache observations

### Requirement: Base And Cache Observations Do Not Overclaim

Habitat verify SHALL record base selection and task cache observations as
bounded command observations. It SHALL NOT turn terminal output replay or a base
substitute into CI, freshness, or PR-readiness claims.

#### Scenario: Base comes from the flag
- **WHEN** the user supplies `--base <ref>`
- **THEN** the receipt records `VerifyBaseSelection.source == "flag"`
- **AND** the resolved base is recorded separately from the requested flag value

#### Scenario: Base comes from merge base
- **WHEN** no base flag is supplied and merge-base resolution succeeds
- **THEN** the receipt records `VerifyBaseSelection.source == "merge-base"`

#### Scenario: Main default substitute is used
- **WHEN** no base flag is supplied and merge-base resolution is unavailable while compatibility retains current behavior
- **THEN** the receipt records `VerifyBaseSelection.source == "main-default-substitute"`
- **AND** the receipt does not describe that state as equivalent to a resolved merge base

#### Scenario: Cache replay is observed
- **WHEN** bounded Nx output explicitly reports cache replay for a task
- **THEN** the receipt records a task-local `cache-hit` observation for that task
- **AND** the receipt does not claim CI execution or full task freshness

#### Scenario: Cache state is not observed
- **WHEN** bounded Nx output does not support a cache observation for a task
- **THEN** the receipt records `not-observed`

### Requirement: Affected Invocation Is Explicit And Graph-Owned

Habitat verify SHALL construct affected Nx invocation from D3 `VerifyTargetPlan`
facts and D12 base selection. It SHALL NOT own target truth through a local
hard-coded target list after D3 verify target planning is live.

#### Scenario: Target plan is ready
- **WHEN** D7 allows affected execution
- **AND** D3 provides a ready verify target plan
- **THEN** D12 invokes affected Nx with targets from the D3 plan in stable order
- **AND** the command uses explicit `--base <resolved-base>`, `--head HEAD`, and `--outputStyle=static` unless a final accepted D12 review records another exact command contract
- **AND** the receipt records the full argv and working directory

#### Scenario: Target plan is not ready
- **WHEN** D3 refuses or cannot provide the verify target plan
- **THEN** D12 does not invoke affected Nx
- **AND** the receipt records D3-owned target-plan refusal or unavailable state, or a D12-owned affected `skipped` state carrying a D3-owned reason

### Requirement: Post-State Observation Is Bounded

Habitat verify SHALL record post-state as command observations with bounded
streams and explicit non-claims. It SHALL NOT convert post-state text into
Graphite readiness, apply safety, or current-tree correctness.

#### Scenario: Post-state commands are observed
- **WHEN** git status and resource status commands complete
- **THEN** the receipt records command, cwd, exit code, bounded stdout, bounded stderr, and observation time for each post-state command
- **AND** the receipt keeps post-state separate from readiness claims

#### Scenario: Post-state command is unavailable
- **WHEN** a post-state command cannot be executed or parsed
- **THEN** the receipt records `PostStateObservation.kind == "unavailable"`
- **AND** the receipt does not convert the unavailable observation into success

### Requirement: Verify Receipt Carries Canonical Non-Claims

Habitat verify SHALL include canonical D1 non-claim identifiers on every
`VerifyReceipt` outcome. Free-form prose MAY be rendered for humans only when
derived from canonical identifiers.

#### Scenario: Receipt succeeds
- **WHEN** verify assembles a succeeded receipt
- **THEN** the receipt includes canonical identifiers for CI, runtime behavior, product completion, Graphite readiness, OpenSpec acceptance, apply safety, current-tree cleanliness, and rule correctness limitations where relevant

#### Scenario: Receipt is blocked or refused
- **WHEN** verify cannot assemble a succeeded receipt
- **THEN** the receipt still includes canonical non-claims
- **AND** the blocked/refused state does not become a product approval claim

### Requirement: Legacy VerifyProof Surfaces Are Compatibility Surfaces

Habitat verify SHALL treat legacy proof-named command, JSON, type, factory,
test, and docs surfaces as D0/D1 compatibility surfaces. Target implementation
language SHALL use `VerifyReceipt` semantics unless a D0 row explicitly preserves
or facades the legacy name for a public surface.

#### Scenario: Legacy JSON name is preserved
- **WHEN** a D0 row requires preserving the legacy public JSON name
- **THEN** the implementation may expose a legacy-name wrapper over `VerifyReceipt` semantics
- **AND** target internal state remains the D12 receipt state model

#### Scenario: Public JSON is versioned
- **WHEN** D0 authorizes a versioned verify JSON change
- **THEN** the versioned shape uses D12 receipt state names and D1 canonical non-claims
- **AND** compatibility behavior is tested through the D0 row citation

#### Scenario: Help or docs teach verify output
- **WHEN** help text or docs examples describe verify output
- **THEN** they use D0/D1-approved receipt/handoff language
- **AND** they do not teach proof-named target semantics unless preserved as a legacy compatibility label

### Requirement: Diagnostic Verify Remains Distinct From Root Verify

Habitat verify SHALL remain a diagnostic command receipt surface. It SHALL NOT
claim to replace root `bun run verify`, CI, product approval, Graphite submit
readiness, OpenSpec acceptance, apply safety, or runtime behavior.

#### Scenario: Docs compare verify commands
- **WHEN** Habitat docs or help compare root `bun run verify` and diagnostic `bun run habitat verify`
- **THEN** root `bun run verify` is described as the Nx aggregate repo workflow
- **AND** diagnostic `bun run habitat verify` is described as a Habitat command receipt
- **AND** success from diagnostic verify does not imply root aggregate success

#### Scenario: D14 consumes D12 handoff language
- **WHEN** D14 uses D12 examples or non-claims
- **THEN** D14 may cite D12 only for verify handoff limits and receipt states
- **AND** D14 does not infer authoring topology readiness or product behavior from D12 receipt success

### Requirement: D11 Local Feedback Does Not Complete Verify Handoff

Habitat verify SHALL treat D11 local-feedback non-claims and hook trace
boundary projections as optional upstream observations only when a D0/D1-
compatible verify surface explicitly includes them. It SHALL NOT treat hook
pass, local-feedback eligibility, staged-file behavior, or hook trace output as
verify handoff completion, CI, graph authority, Graphite readiness,
product/runtime readiness, OpenSpec acceptance, apply safety, current-tree
correctness, or root aggregate verification.

#### Scenario: Verify observes a D11 hook trace boundary
- **WHEN** D12 includes a D11 local-feedback or hook trace observation
- **THEN** the receipt records the D11 projection name and D12 receipt field
- **AND** the receipt includes non-claims preventing hook output from being read as verify completion or CI

#### Scenario: Hook pass exists without verify dependencies
- **WHEN** a hook/local-feedback path reports pass but D3/D7 verify inputs are unavailable or refused
- **THEN** D12 does not report a successful verify handoff
- **AND** D12 does not infer graph authority, check authority, Graphite readiness, or product/runtime readiness from the hook result
