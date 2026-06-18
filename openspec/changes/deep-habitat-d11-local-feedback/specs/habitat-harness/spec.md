## ADDED Requirements

### Requirement: D11 Hook Commands Are Local Feedback Entrypoints

Habitat SHALL treat `habitat hook pre-commit` and `habitat hook pre-push` as local feedback entrypoints that orchestrate accepted upstream projections and native command outcomes without claiming CI, review approval, OpenSpec acceptance, safe apply completion, generated freshness, graph completeness, or product/runtime correctness.

#### Scenario: Pre-commit completes local feedback
- **WHEN** the pre-commit hook completes every required local stage with pass or explicitly allowed not-applicable outcomes
- **THEN** Habitat reports a local-feedback pass
- **AND** the hook output and trace carry D1 non-claims for CI, review, OpenSpec, graph, apply, generated freshness, and runtime/product behavior

#### Scenario: Pre-push completes local feedback
- **WHEN** the pre-push hook resolves its local base decision and affected-target command completes successfully
- **THEN** Habitat reports a local-feedback pass
- **AND** the hook output and trace preserve D1 non-claims rather than claiming Graphite, CI, or review readiness

#### Scenario: Unsupported hook name is requested
- **WHEN** a user invokes a hook name outside the D11 command set
- **THEN** Habitat refuses the command with the supported hook names
- **AND** no local feedback trace is reported as passing

### Requirement: D11 Resource Decisions Derive Commit Allowance From The Variant

D11 SHALL model resource pre-commit state as a closed decision where commit allowance is derived from the discriminated variant, not stored as an independently writable boolean.

#### Scenario: Resource state allows pre-commit
- **WHEN** resources are `clean`, `not-configured`, or `staged-gitlink` with the resource worktree clean
- **THEN** D11 represents the resource stage as allowed
- **AND** any legacy `allowPreCommit` field is a compatibility projection from that allowed variant

#### Scenario: Resource state refuses pre-commit
- **WHEN** resources are dirty, locked, uninitialized, have an unstaged gitlink, or cannot be inspected
- **THEN** D11 represents the resource stage as refused with recovery instructions
- **AND** no representation can carry the refused variant together with commit allowance

#### Scenario: Dirty resource worktree and staged gitlink coexist
- **WHEN** a resource has a staged gitlink and the resource worktree is dirty
- **THEN** the dirty-resource refusal wins
- **AND** later hook stages do not run

### Requirement: D11 Pre-Commit Stage Pipeline Is Closed

D11 SHALL define the pre-commit hook as an ordered set of stage outcomes: resource decision, staged path selection, D7/D10 structural feedback, partial-staging decision, Biome formatting/checking, formatter restage, D6 diagnostic feedback, and terminal local feedback.

#### Scenario: Required stage refuses
- **WHEN** any required pre-commit stage returns a refusal, failed command, unavailable required authority, malformed upstream projection, or contradictory upstream projection
- **THEN** the pre-commit terminal outcome is not pass
- **AND** D11 stops before any downstream stage that depends on the refused stage

#### Scenario: No staged paths need a stage
- **WHEN** a stage is not applicable because no staged paths enter that stage
- **THEN** D11 records an explicit not-applicable stage result
- **AND** the not-applicable result does not hide required upstream authority for stages that are still applicable

#### Scenario: Stage trace is emitted
- **WHEN** D11 records hook trace data
- **THEN** each stage record names its owner authority, consumed projection or native command, terminal result, recovery text when available, and D1 non-claims
- **AND** D11 does not infer semantics absent from the consumed projection or native command outcome

### Requirement: D11 Consumes D6 Diagnostic Projections For Staged Diagnostics

D11 SHALL consume D6-owned staged diagnostic projections for Grit/native diagnostic local feedback and SHALL NOT parse raw Grit output, diagnostic message text, pattern identities, adapter failures, or current-tree diagnostic semantics as D11-owned truth.

#### Scenario: D6 reports clean diagnostics
- **WHEN** D6 publishes a hook-eligible staged diagnostic projection with a clean result
- **THEN** D11 may continue past the diagnostic stage
- **AND** D11 preserves diagnostic non-claims and owner metadata in hook trace or output where surfaced

#### Scenario: D6 reports findings
- **WHEN** D6 publishes a hook-eligible staged diagnostic projection with findings
- **THEN** D11 reports local feedback failure for the diagnostic stage
- **AND** the diagnostic projection remains D6-owned

#### Scenario: D6 reports unavailable or malformed diagnostic state
- **WHEN** D6 reports tool unavailable, command failure, no JSON, malformed JSON, schema drift, pattern projection miss, unexpected pattern identity, cache/freshness unrepresentable, or adapter failure
- **THEN** D11 reports blocked or failed local diagnostic feedback
- **AND** hook pass is impossible for a required diagnostic stage

#### Scenario: D6 facts are mediated through D7
- **WHEN** D7 publishes a local-feedback-safe check projection that includes D6 diagnostic facts
- **THEN** D11 consumes the exact D7 projection field carrying those facts
- **AND** D11 records that D7 mediates the local-feedback projection without owning D6 diagnostic semantics

### Requirement: D11 Consumes D7 Check Projections For Structural Outcomes

D11 SHALL consume D7 `LocalFeedbackCheckProjection` or its accepted successor for structural check outcomes and SHALL NOT parse D7 human output, `CheckReport` text, or rule diagnostics to recompute structural enforcement semantics.

#### Scenario: D7 projection passes
- **WHEN** D7 publishes a local-feedback-safe check projection with a pass or allowed advisory-only result
- **THEN** D11 may continue the hook stage that consumed that projection
- **AND** D11 preserves D7 non-claims

#### Scenario: D7 projection refuses or fails
- **WHEN** D7 publishes selector refusal, dependency refusal, baseline refusal, diagnostic unavailable, protected-zone refusal, or structural failure
- **THEN** D11 reports non-pass local feedback
- **AND** no downstream formatting, diagnostic, resource publish, generated publish, or restage step runs when it depends on the refused stage

#### Scenario: D7 projection is unavailable
- **WHEN** a required D7 local-feedback projection is unavailable
- **THEN** D11 reports blocked local feedback
- **AND** the missing projection cannot be represented as hook pass

### Requirement: D11 Consumes D10 And D7 Protected Mutation Refusals Without Owning Zone Policy

D11 SHALL consume D10-owned protected/generated/forbidden mutation refusals directly or through D7 local-feedback projections and SHALL NOT match protected paths locally to decide D10 policy.

#### Scenario: Protected mutation is refused
- **WHEN** D10 or a D7 projection carrying D10 authority reports refused direct generated edit, refused direct protected edit, refused forbidden artifact, missing host declaration, declaration conflict, malformed D2 projection, or unknown zone reference
- **THEN** D11 reports blocked pre-commit local feedback
- **AND** D11 stops before Biome, Grit, generated publish, resource publish, and formatter restage

#### Scenario: Protected mutation details are rendered
- **WHEN** D11 renders protected mutation feedback
- **THEN** the output names the repo-relative path, action, owner authority, and recovery instruction supplied by D10 or the D7 projection
- **AND** D11 does not recompute the protected-zone decision

### Requirement: D11 Partial Staging And Formatter Restage Are Bounded

D11 SHALL keep partial-staging refusal and formatter restage as hook-local safety decisions with exact write boundaries.

#### Scenario: Partially staged supported path is detected
- **WHEN** a Biome-supported staged path also has unstaged changes
- **THEN** D11 refuses before formatting, restaging, diagnostic checks, resource publish, and generated publish
- **AND** D11 does not stash, reset, checkout, or rewrite the worktree to inspect the path

#### Scenario: Formatter changes staged files
- **WHEN** Biome formatting changes staged candidate files
- **THEN** D11 restages only formatter-touched staged candidate paths
- **AND** unchanged paths, foreign staged paths, and unstaged-only paths are not restaged

#### Scenario: Formatter or restage command fails
- **WHEN** Biome format, Biome check, or `git add --` for formatter-touched paths fails
- **THEN** D11 reports local feedback failure
- **AND** no later diagnostic or publish stage is treated as passing

### Requirement: D11 Consumes D9 Transaction Projections Without Claiming Apply Safety

D11 SHALL consume D9 local-feedback-safe transaction projections only where hook-facing apply/fix or transaction recovery feedback is surfaced, and SHALL NOT infer apply safety from changed paths, dry-run output, diagnostics, or formatter results.

#### Scenario: D9 transaction projection is surfaced
- **WHEN** D11 renders apply/fix or transaction recovery local feedback
- **THEN** D11 consumes a D9 projection for unavailable, refused, dry-run, applied, rolled-back, rollback-failed, or recovery-required outcomes
- **AND** D11 output remains local feedback rather than safe-apply completion

#### Scenario: D9 projection is unavailable for a required transaction stage
- **WHEN** the required D9 local-feedback projection is unavailable or refused
- **THEN** D11 reports non-pass local feedback for that stage
- **AND** D11 does not recompute transaction safety locally

### Requirement: D11 Pre-Push Feedback Consumes D3 Graph And Native Base Facts

D11 SHALL model pre-push as local affected-target feedback that consumes D3 workspace graph/target availability where required and native base-resolution command outcomes without owning graph truth, target authority, or CI behavior.

#### Scenario: Explicit pre-push base is supplied
- **WHEN** a user provides an explicit pre-push base
- **THEN** D11 records an explicit-base decision
- **AND** D11 does not probe Graphite or merge-base before running the local affected command

#### Scenario: Graphite or merge-base provides a local base
- **WHEN** D11 observes a Graphite parent or merge-base candidate
- **THEN** D11 records the base provenance
- **AND** the result remains local feedback, not Graphite readiness or review readiness

#### Scenario: Required graph or target fact is unavailable
- **WHEN** D3 reports graph refusal, missing target, unresolved alias dependency, malformed graph JSON, Nx read failure, Nx daemon failure, or unavailable affected target facts required by D11 pre-push
- **THEN** D11 reports blocked local feedback
- **AND** D11 cannot report pre-push pass for that required affected-target stage

#### Scenario: Nx affected command fails
- **WHEN** the native affected command exits nonzero
- **THEN** D11 reports affected-target local feedback failure
- **AND** D11 does not reinterpret the failure as CI, graph, or review authority

### Requirement: D11 Public Surface Compatibility Blocks Source Implementation

D11 SHALL block source implementation for any touched hook public or durable surface until the surface has a concrete D0 compatibility row and D1 output/non-claim handling where applicable.

#### Scenario: Hook output text changes
- **WHEN** D11 changes hook human output, legacy hook notice wording, help text, command description, or command exit behavior
- **THEN** the implementation cites the concrete D0 row and closed compatibility handling
- **AND** D1 non-claim vocabulary remains explicit

#### Scenario: Hook trace or export changes
- **WHEN** D11 changes `HookTrace`, `PreCommitTrace`, `PrePushTrace`, `HookCommandRecord`, exported hook types, package exports, docs examples, or Husky delegator behavior
- **THEN** the implementation cites the concrete D0 row and D1 output-family decision
- **AND** silent shape drift is refused

### Requirement: D11 Trace Records Preserve Owner Relations And Non-Claims

D11 SHALL define hook trace records as local feedback records with ordered stage outcomes, consumed authority metadata, command records, terminal outcome, recovery text where available, and D1 non-claims.

#### Scenario: Trace records a consumed projection
- **WHEN** a hook stage consumes D3, D6, D7, D9, or D10 projection data
- **THEN** the trace records the owner and projection identity or accepted compatibility field
- **AND** D11 does not copy raw upstream internals into a D11-owned semantic model

#### Scenario: Trace records terminal pass
- **WHEN** a hook reports terminal pass
- **THEN** the trace includes local-feedback non-claims
- **AND** the trace contains no field that claims CI, review approval, generated freshness, graph completeness, safe apply completion, or product/runtime correctness

### Requirement: D11 False-Green States Are Refused

D11 SHALL make hook pass impossible after unavailable required authority, contradictory upstream projection, parse or adapter failure for a required diagnostic stage, protected-zone refusal, partial staging refusal, formatter/restage failure, or affected-target failure.

#### Scenario: Required authority is absent
- **WHEN** a required D3, D6, D7, D9, or D10 authority is missing, unavailable, malformed, or contradictory
- **THEN** D11 reports blocked or failed local feedback
- **AND** D11 does not use legacy parsing, fallback command text, or optimistic default state to report pass

#### Scenario: Structured report contradicts stage result
- **WHEN** structured hook data and stage status disagree
- **THEN** D11 refuses the pass state
- **AND** the implementation must repair the contradiction rather than emit a successful hook result
