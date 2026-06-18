# D11 Local Feedback Domain/Ontology Investigation

## Verdict

Blocking for packet repair input.

The current D11 packet has the correct top-level intent: hooks are local feedback, not CI, review readiness, safe-apply completion, product readiness, or structural authority. It is not yet implementation-ready because it does not define the Local Feedback ontology, state families, consumer projections, native-tool roles, or compatibility terminology tightly enough for a later execution agent to implement without inventing domain decisions.

The packet must be repaired before source implementation. The blocking ambiguity is exact: D11 does not yet say which states Local Feedback owns, which upstream projection fields it consumes, what a hook may claim, what it must never claim, and how resource state, staged-path decisions, partial-staging refusal, formatter restage, and pre-push base selection become closed impossible-state-resistant models.

## Source Authority Read Register

Read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/failure-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`

Read as D11 control/input records:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/workstream/review-disposition-ledger.md`

Read as accepted upstream contract sources:

- D1 design/spec under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/`
- D6 spec under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/`
- D7 design/spec under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/`
- D9 design/spec under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/`
- D10 design/spec under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d10-protected-zone-authority/`

Read as present-behavior input only:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`

## Competency Questions

The repaired D11 packet must answer these without implementation-time judgment:

1. What is a hook allowed to claim when it passes, fails, refuses, skips, or cannot inspect a required local state?
2. Which D1 non-claim identifiers must appear on hook output, HookTrace/LocalFeedbackTrace, and any public compatibility projection?
3. Which Local Feedback states are D11-owned, and which states are D7, D9, D10, D6, D1, D3, Git, Graphite, Nx, Biome, Grit, or Husky facts consumed by D11?
4. What is the closed hook stage model for pre-commit and pre-push?
5. What is the closed local feedback result model, and how does it derive exit status and human output?
6. Which upstream projection is consumed for staged structural checks, protected-zone refusals, staged Grit diagnostics, apply/fix transaction feedback, and affected-target feedback?
7. How does resource state make `kind` vs allowed commit behavior impossible to contradict?
8. Which resource states allow pre-commit, refuse pre-commit, or represent non-claiming absence of resource configuration?
9. How are staged path decisions represented from Git name-status without inventing a second VCS model?
10. What exactly triggers partial-staging refusal, and what must not run after that refusal?
11. What exactly authorizes formatter restage, and how is restage limited to formatter-touched Biome-supported staged files?
12. How does a D10-origin file-layer refusal stop hook sequencing before Biome, Grit, publish, generated publish, or restage work?
13. How are Graphite parent observation, explicit base override, Git merge-base fallback, literal main fallback, and Nx affected execution represented without claiming PR readiness or graph truth?
14. Is the legacy hook notice a target term, a legacy human-output phrase, or a D0/D1 compatibility surface?
15. What are the stop conditions if D7/D9/D10/D6/D1 projections are unavailable or malformed?

## Target Ontology Commitments

D11 should add a concrete target ontology section to `design.md` and matching OpenSpec requirements/scenarios. Required accepted commitments:

- `LocalFeedback`: D11 bounded context for hook-time feedback to a local developer or agent. It sequences local checks and records outcomes. It does not decide check truth, diagnostic identity, path authority, transaction safety, graph target truth, CI status, review approval, product/runtime behavior, or OpenSpec acceptance.
- `HookInvocation`: requested hook command and hook name, limited to `pre-commit` and `pre-push` unless D0 versions the public command surface.
- `HookStage`: closed stage identity. Current inputs suggest at least `resource-state`, `staged-paths`, `file-layer-check`, `partial-staging-check`, `biome-format`, `formatter-restage`, `biome-check`, `staged-grit-check`, `pre-push-base-selection`, and `pre-push-affected`. Keep `repo-state` and command capture as trace observation, not product authority.
- `HookCommandRecord`: D11-local command observation for hook sequencing. It records argv, cwd, environment projection if allowed, exit code, timing, and phase. It is not a `CommandReceipt`, CI authority, or structural truth source. If exported or serialized, it needs D0/D1 compatibility classification.
- `HookTrace` / `LocalFeedbackTrace`: hook-scoped event and command feedback record. It must carry `local-feedback-only` and relevant D1 non-claims. It must distinguish pre-state/post-state observations from accepted authority.
- `LocalFeedbackResult`: terminal result family such as `passed`, `failed`, `refused`, `blocked`, and `not-applicable` or more specific variants for pre-commit/pre-push. Exit status must derive from this result.
- `ResourceState`: closed union where allowed behavior derives from variant, not from an independent boolean. Required variants from source packet/current behavior: `clean`, `not-configured`, `staged-gitlink-allowed`, `dirty-submodule-refused`, `unstaged-gitlink-refused`, `uninitialized-refused`, `locked-refused`, and `inspection-failed-refused`. Do not preserve `allowPreCommit` as target state.
- `StagedPathDecision`: Git-derived path-action decision over staged adds/modifies/deletes/renames/copies. D11 may consume normalized Git name-status; it must not redefine Git.
- `PartialStagingRefusal`: refusal for Biome-supported staged files with unstaged changes. It must stop before formatting, restage, Biome check, staged Grit, publish, or downstream commands.
- `FormatterRestageDecision`: D11 decision to run `git add -- <paths>` only for formatter-touched, Biome-supported, staged paths. It is not apply safety, not transaction success, and not authorization for unrelated staged paths.
- `PrePushBaseDecision`: closed observed-base decision: explicit override, Graphite parent observed, Git merge-base observed, fallback literal main, or blocked/unavailable if the packet decides fallback is no longer acceptable. The decision must be an observation for Nx affected, not PR readiness.
- `AffectedTargetFeedback`: D11 pre-push local feedback from Nx affected execution. It must consume D3 graph facts when target truth is claimed and otherwise remain a native Nx command result with non-claims.
- `UpstreamConsumerProjection`: explicit D11-consumed projection relation for D7 `LocalFeedbackCheckProjection`, D10 `ProtectedMutationGuardProjection`/D7-projected protected refusal, D9 local-feedback-safe transaction projection when apply/fix state is surfaced, D6 diagnostic failure only through D7 unless D11 names a direct bounded D6 projection, and D1 non-claim/compatibility records.
- `NonClaim`: canonical D1 identifiers, not prose-only disclaimers. Required base set for hooks: `local-feedback-only`, `does-not-prove-ci`, `does-not-prove-runtime`, `does-not-prove-product-completion`, `does-not-prove-graphite-readiness`, `does-not-prove-openspec-acceptance`, `does-not-prove-apply-safety`, `does-not-prove-current-tree-cleanliness`, and `does-not-prove-rule-correctness` when check/diagnostic projections are surfaced.

Native role commitments:

- Husky owns hook delegation mechanics. Habitat owns the `habitat hook <name>` command behavior behind that delegator.
- Git owns staged identity, name-status, diffs, branch/head observations, merge-base mechanics, and submodule/gitlink facts.
- Graphite owns stack/parent facts. D11 may observe a Graphite parent for base selection and must not turn it into PR readiness.
- Nx owns affected target execution, target scheduling, cache, and graph behavior. D11 may run Nx and report the command result; target truth requires accepted D3 graph facts.
- Biome owns formatting/lint/import-sort semantics. D11 owns the decision to invoke Biome locally and restage only Biome-touched staged files.
- Grit owns native diagnostic execution and output syntax. D11 must not parse raw Grit truth as target authority; it consumes D7/D6 projections.

## Rejected Or Compatibility Terms

Treat these as compatibility facts unless D0/D1 explicitly preserve or version them:

- Legacy hook notice wording: human-output compatibility phrase only. Target phrase should be `local feedback` or `local feedback trace`. If preserved, the packet must call it a D0/D1 compatibility surface and bind it to `local-feedback-only`.
- Legacy authority vocabulary in target D11 product language: rejected. Use `feedback`, `trace`, `result`, `scenario`, `validation gate`, or `non-claim`.
- Target D11 type names should use `observation`, `command record`, `trace`, `result`, or `decision` when naming source/current-behavior inputs.
- `allowPreCommit`: rejected target field. Allowed behavior must derive from `ResourceState` variant.
- `file-layer` as domain language: compatibility owner-tool label. Target meaning is D10 protected mutation guard rendered through D7 local feedback projection.
- `grit-check` as semantic source: compatibility/native tool label. Target meaning is D6 diagnostic outcome projected through D7 for local feedback.
- `formatter restage` as broad write authority: compatibility stage label. Target is a bounded formatter restage decision over formatter-touched staged paths only.
- Pre-push affected authority claims: rejected. Target is Nx affected local feedback with Graphite/Git base observation and non-claims.
- `skip` without reason: rejected. Use `not-applicable`, `dependency-refused`, `blocked`, or an owner-specific refusal reason.

## Findings Against Current Packet

### P1: The packet lacks a D11-owned target ontology and leaves core state design to implementation

Current `design.md` names the owner and repeats the high-level target contract, but it does not define `LocalFeedback`, `HookStage`, `LocalFeedbackResult`, `ResourceState`, `StagedPathDecision`, `PartialStagingRefusal`, `FormatterRestageDecision`, `PrePushBaseDecision`, or `UpstreamConsumerProjection`. Current `spec.md` has only two generic scenarios. That fails the ontology competency test: an implementation agent cannot answer which states exist, who owns them, or which invalid states are impossible.

Repair:

- Add a `Target Ontology` section to `design.md` with the commitments above.
- Add a `State Model` section to `design.md` with closed variants for pre-commit, pre-push, resource state, staged path decisions, formatter restage, and upstream-consumer results.
- Expand `specs/habitat-harness/spec.md` beyond the current generic requirement into separate normative requirements for hook scope/non-claims, resource state, staged path decision, partial staging, formatter restage, D7/D10/D6 consumption, D9 projection consumption if applicable, and pre-push base/Nx feedback.
- Replace tasks 2.1-2.3 with implementation steps that name the state families and projections, not broad "define/consume/clarify" placeholders.

### P1: Resource state still permits the impossible state the source packet identified

The source domino explicitly flags `ResourceState.kind` and `allowPreCommit` as contradictory if not constructed centrally. Current OpenSpec artifacts do not repair that design; they only say D11 should define scope and non-claims. Present code still has `ResourceState.kind` plus `allowPreCommit`, while tests rely on behavior like dirty submodule taking precedence over staged gitlink.

Repair:

- In `design.md`, replace the boolean-correlated model with a closed resource union whose variant determines commit allowance.
- In `spec.md`, add scenarios for `clean`, `not-configured`, `staged-gitlink-allowed`, `dirty-submodule-refused`, `unstaged-gitlink-refused`, `uninitialized-refused`, `locked-refused`, and inspection failure.
- Make precedence normative: dirty submodule and inspection failures refuse before staged gitlink allowance is considered.
- Require resource refusals to carry recovery instructions and D1 non-claims.

### P1: Upstream consumption is named but not specified, so D11 can recreate upstream authority

D11 says it consumes D7/D9/D10 and current hook inputs include staged file-layer checks and Grit checks, but the packet does not cite the accepted upstream projections. D7 already defines `LocalFeedbackCheckProjection` for D11. D10 defines that D11 stops at D10-origin staged protected mutation refusal. D9 defines a D11 local-feedback-safe transaction projection. D1 defines HookTrace/local feedback non-claims and compatibility treatment. D6 owns diagnostic identity and adapter failures. Current D11 does not bind to these projection names, fields, or non-ownership boundaries.

Repair:

- In `design.md`, add an `Upstream Consumer Matrix`:
  - D1: canonical non-claims, HookTrace/LocalFeedbackTrace boundary, compatibility handling for the legacy hook notice.
  - D7: `LocalFeedbackCheckProjection` fields and refusal labels.
  - D10 through D7: protected/generated/forbidden staged mutation refusals stop hook sequencing before Biome/Grit/publish/restage.
  - D6 through D7: malformed Grit JSON, adapter failure, findings, projection miss, and unavailable diagnostic states are local feedback outcomes, not D11 diagnostic truth.
  - D9: only consume local-feedback-safe transaction projection if D11 surfaces apply/fix state; otherwise state D9 is a non-owned adjacent contract and D11 must not claim apply safety.
  - D3/Nx/Graphite: pre-push affected execution is native Nx feedback; target truth requires D3 graph facts.
- In `spec.md`, add scenarios for unavailable/malformed projections causing blocked or refused local feedback rather than pass.

### P1: The packet cannot answer what a hook may claim and must never claim at each output boundary

The packet says hooks are local feedback and not CI, but it does not bind non-claims to specific output surfaces: human output, exit status, HookTrace, HookCommandRecord, pre-commit pass, pre-push pass, resource refusal, D10-origin refusal, Grit failure, formatter restage, and Nx affected result. D1 already requires canonical non-claim identifiers.

Repair:

- Add `Claim Boundary` to `design.md`: every hook result may claim only "these configured local hook stages completed/refused/failed under this local invocation." It must never claim CI, review approval, full verification, product/runtime correctness, generated freshness, safe apply completion, Graphite readiness, OpenSpec acceptance, D7 rule correctness, D6 diagnostic correctness, D10 path authority beyond consumed decision, or D9 transaction success.
- Add `NonClaim Mapping` by result family and surface.
- Add `spec.md` scenarios requiring non-claims on pass, refusal, dependency unavailable, pre-push affected failure, and legacy human-output phrase.

### P2: The legacy hook notice is not explicitly rejected or compatibility-handled in D11 target artifacts

D1 says the legacy hook notice is a D0-classified human-output compatibility phrase whose target meaning is `local-feedback-only`. Current D11 design has a general rule for legacy authority-shaped names but never names the legacy hook notice as a rejected target term. Current tests assert the legacy phrase.

Repair:

- Add `Term Disposition` to `design.md` with the legacy hook notice as `legacy-human-output-compatibility`, target `LocalFeedbackTrace`/`local feedback`, D0/D1 handling required before changing text.
- Add a `spec.md` scenario: when legacy phrase or D0-approved replacement is rendered, its target meaning is `local-feedback-only` and it does not imply CI authority.
- In `tasks.md`, add an inventory task for all hook human-output, HookTrace, and package export surfaces touched by D11.

### P2: Native tool roles are under-modeled, inviting Habitat-invented abstractions

The hard acceptance question asks whether Graphite, Husky, Nx, Biome, and Grit are represented by native roles. Current packet mentions Graphite, Husky, Nx, Biome, and Grit but does not define their native authority. Without that, implementation can turn Habitat into a second VCS, formatter, graph engine, or diagnostic engine.

Repair:

- Add `Native Tool Authority` to `design.md`:
  - Husky delegates.
  - Git supplies staged/submodule/branch/head/merge-base observations.
  - Graphite supplies parent observation only.
  - Nx runs affected targets and owns target/scheduler/cache behavior.
  - Biome formats/checks; D11 only sequences and bounds restage.
  - Grit diagnostics arrive through D6/D7 projections.
- Add spec scenarios that forbid parsing D7 human output, raw Grit output, Graphite text, or Nx success as broader Habitat authority.

### P2: Staged path, partial-staging, and formatter-restage boundaries are too implicit

The source packet requires staged path policy, partial staging refusal, and formatter restage decisions. Current D11 artifacts do not define path action semantics, deleted/renamed/copied path handling, Biome-supported file filtering, partial staging detection, or restage scope. Current code inputs show this behavior exists, but current code is not target authority.

Repair:

- Add `Staged Path Model` to `design.md`: Git name-status is normalized to repo-relative path decisions; deleted paths are not formatter candidates; renames/copies preserve both path observations where needed; path existence filtering is an observation, not authority.
- Add `PartialStagingRefusal` requirements: if a Biome-supported staged file has unstaged changes, refuse before formatting/restage/Grit and give recovery instructions.
- Add `FormatterRestageDecision` requirements: after Biome format, restage only paths whose hash changed among Biome-supported staged candidates; do not restage foreign paths.
- Add bad-case tests/gates in `tasks.md`: partially staged file, formatter touches one staged file and not another, deleted/renamed path, restage command failure.

### P2: Pre-push base selection and affected-target feedback remain ambiguous

The proposal adds a D3 note saying D11 may plan pre-push feedback before D3 but cannot implement or close target selection/base detection/target truth until D3 graph facts are stable. That is directionally right but still ambiguous. D11 must decide which base-selection states are local observations and which conditions are blocked. Current behavior falls back from Graphite parent to Git merge-base to literal `main`, but the packet does not accept, reject, or constrain that fallback.

Repair:

- Add `PrePushBaseDecision` states to `design.md`: explicit override, Graphite parent observed, Git merge-base observed, literal main fallback, and base unavailable/refused if fallback should become blocking.
- Add `AffectedTargetFeedback` state: Nx affected command result with target list, base, head, exit, and non-claims.
- State that Graphite parent observation does not prove PR readiness and Nx affected success does not prove CI, graph target truth, or product/runtime behavior.
- If D3 is required for target truth, add D3 to D11 prerequisites for pre-push implementation or split pre-push affected feedback into a later D3-dependent slice.

### P2: HookTrace and HookCommandRecord identity, relationships, and public compatibility are underspecified

Current code exposes `HookCommandRecord` and `HookTrace` types, and D1 recognizes HookTrace/LocalFeedbackTrace as local feedback. D11 does not define whether HookCommandRecord is public, internal, serialized, or a compatibility wrapper over D1 command execution concepts. It also does not define trace relationships to hook invocation, upstream projections, resource state, or non-claims.

Repair:

- In `design.md`, define `HookTrace` identity, lifecycle, and relation semantics:
  - records-local-feedback-for `HookInvocation`;
  - contains `HookStageResult`;
  - observes `HookCommandRecord`;
  - consumes upstream projection ids where applicable;
  - bounded-by D1 non-claims.
- If `HookCommandRecord` remains exported or serialized, route it through D0 compatibility and D1 command-record boundary.
- Add spec scenarios proving trace records refused/blocked states without converting them to passing receipts.

### P3: D11 phase record branch is stale relative to the active D11 worktree

The requested active branch is `codex/d11-local-feedback-packet`, and `git status --short --branch` confirms that branch. D11 `workstream/phase-record.md` says branch `codex/deep-habitat-openspec-remediation`. This is not a domain ontology defect, but it is an artifact hygiene issue that can mislead the next agent.

Repair:

- Update `workstream/phase-record.md` during packet repair to record the active branch/worktree accurately, or explicitly state that the old branch name is historical.

### P3: Validation gates are not scenario-complete for the target ontology

The current validation gates include hook tests and `pre-commit --help`, but D11's ontology needs falsifying bad cases: resource refusal precedence, D10-origin refusal sequencing, partial staging, formatter restage scope, malformed Grit projection, Graphite/Nx base decisions, and non-claim rendering. This is partly a validation lane issue, but the domain model cannot be considered implementation-ready without these scenario anchors.

Repair:

- In `tasks.md`, replace broad validation with scenario-specific tests tied to each D11 state family.
- Add both pre-commit and pre-push command behavior gates or explicitly split pre-push into a later D3-dependent slice.

## Exact Repair Recommendations By Artifact

### `/openspec/changes/deep-habitat-d11-local-feedback/design.md`

Add these sections:

- `Target Ontology`
- `Term Disposition`
- `Native Tool Authority`
- `Upstream Consumer Matrix`
- `Claim Boundary And Non-Claims`
- `State Model`
- `Pre-Commit Stage Model`
- `Pre-Push Stage Model`
- `Trace And Relationship Model`
- `Public Compatibility Inventory`

The state model must include closed variants for resource state, hook stage result, local feedback result, staged path decision, partial staging refusal, formatter restage decision, D7/D10/D6 projected check feedback, D9 transaction feedback if surfaced, and Graphite/Nx pre-push base/affected feedback.

### `/openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md`

Replace the single generic requirement with multiple requirements:

- `D11 Hooks Report Local Feedback Only`
- `D11 Resource State Determines Commit Allowance By Variant`
- `D11 Consumes D7 LocalFeedbackCheckProjection`
- `D11 Stops At D10-Origin Staged Mutation Refusals`
- `D11 Surfaces D6 Diagnostic Failures Only Through Accepted Projections`
- `D11 Refuses Partial Staging Before Formatting`
- `D11 Restages Only Formatter-Touched Staged Paths`
- `D11 Represents HookTrace As Local Feedback, Not Receipt Or External Authority`
- `D11 Pre-Push Base Decision Is Observed State Only`
- `D11 Nx Affected Feedback Does Not Claim CI Or Graph Truth`
- `D11 Handles Legacy Hook Notice As Compatibility Language Only`

Each requirement needs at least one positive scenario and one bad-case/refusal scenario.

### `/openspec/changes/deep-habitat-d11-local-feedback/tasks.md`

Replace tasks 2.1-2.3 with implementation steps that name the work:

- Define Local Feedback state families and constructors.
- Replace `ResourceState.kind` plus `allowPreCommit` with a closed variant-derived allowance.
- Consume D7 `LocalFeedbackCheckProjection` instead of parsing D7 human output or raw check JSON as target semantics.
- Preserve D10-origin refusal sequencing.
- Encode partial staging refusal and formatter restage scope.
- Encode HookTrace/HookCommandRecord compatibility and non-claim mapping.
- Encode pre-push base decision and affected-target feedback with Graphite/Nx/D3 boundaries.

Add validation tasks for each falsifying scenario.

### `/openspec/changes/deep-habitat-d11-local-feedback/proposal.md`

Update `Requires` or add a dependency note that is not contradictory:

- D6 is an accepted upstream contract D11 must respect, at least through D7 diagnostic projections.
- D3 is required for any pre-push claim about affected-target truth; otherwise pre-push remains native Nx local feedback with non-claims.
- D0/D1 compatibility rows are required before changing hook human output, JSON/trace schema, exports, scripts, help, or docs examples.

Clarify that D11 enables clean local ergonomics and handoff reliability but does not enable downstream authority packets.

### `/openspec/changes/deep-habitat-d11-local-feedback/workstream/phase-record.md`

Correct or qualify the stale branch field. Copy the repaired validation matrix and protected write set into the phase record after packet repair.

### `/openspec/changes/deep-habitat-d11-local-feedback/workstream/review-disposition-ledger.md`

Record this investigation as a blocking per-domino domain/ontology review input. Do not mark it acceptance input until accepted P1/P2 repairs are completed and rereviewed.

### `/openspec/changes/deep-habitat-d11-local-feedback/workstream/downstream-realignment-ledger.md`

Add downstream surfaces that must be realigned after repair:

- D0 compatibility matrix for hook human output, trace/export/schema, command behavior/help, and docs examples.
- D1 non-claim and compatibility handling references.
- D7 `LocalFeedbackCheckProjection` consumer contract.
- D10 hook-facing refusal sequencing.
- D9 local-feedback-safe transaction projection if D11 surfaces apply/fix state.
- D3 pre-push affected-target dependency if D11 claims target truth.

## Stop Conditions

Keep D11 blocking if any of these remain true:

- `ResourceState` has both a `kind` and independent allowed/pre-commit boolean.
- Hook output or trace can be read as CI, review, verify, generated freshness, apply safety, Graphite readiness, OpenSpec acceptance, or product/runtime readiness.
- The legacy hook notice appears as target language rather than D0/D1 compatibility phrase.
- D11 parses D7 human output or raw Grit output to infer structural/diagnostic truth.
- D11 matches protected/generated paths locally instead of consuming D10/D7 projections.
- Partial staging behavior is not a refusal with a clear sequencing stop.
- Formatter restage can include paths outside formatter-touched staged Biome candidates.
- Graphite parent or Nx affected success can be interpreted as PR readiness, graph target truth, or CI success.
- Pre-push affected-target behavior remains in scope without either accepted D3 graph facts or explicit local-feedback-only non-claims.
- The packet leaves public compatibility decisions, trace schema, output wording, or hook command behavior for implementation to decide.

## Final Verdict

Blocking. D11 is directionally correct but currently underspecified. It must be repaired into an explicit Local Feedback ontology and state model before it can become implementation-ready design/specification authority.
