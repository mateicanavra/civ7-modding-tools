# D11 Local Feedback Cross-Domino Product Investigation

## Status And Verdict

Verdict: keep D11 blocking.

D11 is not implementation-ready in the reviewed disk state. It can proceed with hidden dependency assumptions around D6 staged diagnostic projections, D3 pre-push graph facts, D8 local-feedback admission/eligibility, G-HOST transitive protected/host policy gates, and D0/D1 compatibility for touched hook output and traces. The current packet has the right intent, but it is still underspecified rather than an implementation authority.

This document is investigation/review input only. It is not acceptance input and does not update the packet index, closure records, or D11 packet files.

## Source Authority Read Register

Mandatory skills and references read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`

Repo/worktree and routers read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- Active worktree confirmed: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
- Active branch confirmed: `codex/d11-local-feedback-packet`
- Initial `git status --short --branch` was clean.

D11 inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/tasks.md`
- D11 workstream phase record, review ledger, downstream realignment ledger, and closure checklist.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`

Upstream packet contracts read:

- D0 proposal/spec for public-surface compatibility.
- D1 design/spec for hook traces, non-claims, refusal/recovery, Graphite observation boundaries.
- D3 proposal/spec for Workspace Graph target facts and graph refusals.
- D6 proposal/spec for diagnostic catalog, diagnostic projections, and D11 consumption.
- D7 proposal/spec for Structural Enforcement, `LocalFeedbackCheckProjection`, and D10-origin refusal projection.
- D8 proposal/spec for Pattern Governance and explicit local-feedback admission/eligibility.
- D9 proposal/spec for local-feedback-safe transaction projections.
- D10 proposal/spec for protected/generated/host-owned mutation decisions and D11 staged refusal consumption.
- D15 OpenSpec packet plus source packet for trigger records.
- G-HOST OpenSpec packet for host-policy boundary.

Current behavior inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/PROCESS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/CONTRIBUTING.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/GRAPHITE.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/resources-submodule.md`

## User And Agent Scenario Map

A developer or agent needs pre-commit feedback to answer four questions quickly:

1. What stopped my commit?
2. Which owner owns that stop?
3. What exact local action should I take next?
4. What does hook success not prove?

The fast recovery path should be stage-ordered:

- Resource state first: clean, not configured, clean staged gitlink, dirty submodule, unstaged gitlink, locked, uninitialized, or inspection failure. Refusals need exact recovery commands and must not publish resources automatically.
- Staged protected/generated/forbidden mutations next: D11 should render D10-origin refusals through D7 local-feedback-safe projection and stop before Biome, Grit, generated publish, resource publish, or restaging.
- Partial staging before formatter writes: D11 should refuse before Biome writes or restaging and list exact files.
- Formatter handoff: D11 may restage only formatter-touched files under explicit policy and must report that this is local hygiene, not review or CI.
- Staged diagnostics: D11 should render D6 diagnostic projections, through D7 where the check outcome is structural, without parsing raw Grit JSON or diagnostic message strings.
- Transaction feedback, if present: D11 should render D9 transaction projection states such as unavailable, refused, dry-run, applied, rolled-back, rollback-failed, and recovery-required without recomputing apply safety.

Pre-push feedback needs a different recovery model:

- It should explain the selected affected base as observed Graphite/git state only.
- It should state that `nx affected` success/failure is local feedback and not CI, Graphite readiness, review completion, or product readiness.
- It should consume D3 graph target facts for target availability and graph refusals instead of treating raw `nx affected` exit status as target truth.
- It should give a recovery path for missing Graphite parent, graph-read failure, unresolved targets, and affected failure.

The current D11 packet has the non-claim headline, but it does not yet specify the recovery taxonomy, projection ownership, stop sequence, or output/trace compatibility envelope tightly enough for execution.

## Dependency Graph

Required direct dependencies:

- D0: public-surface matrix and compatibility handling for every hook command, hook output, human text, trace schema, package export, docs example, help text, root script, and generated/help surface D11 touches.
- D1: Hook traces are local feedback only; canonical non-claim identifiers; refusal and recovery instruction discipline; Graphite/OpenSpec observations are not command receipt substitutes.
- D6: D11 consumes hook/staged diagnostic projections. D11 must not parse raw Grit reports, infer diagnostic identity, or own adapter failure taxonomy.
- D7: D11 consumes `LocalFeedbackCheckProjection`, including D10-origin protected-zone refusal projections rendered by Structural Enforcement.
- D9: D11 consumes local-feedback-safe transaction projections for apply/fix state and recovery. It does not recompute apply safety.
- D10: D11 consumes staged protected/generated/forbidden mutation refusals through D10/D7 projections and stops hook sequencing at the file-layer refusal.

Conditional or transitive dependencies that must be explicit:

- D3: required for pre-push affected behavior, target availability, graph refusals, dependency resolution, and target truth. The current D11 design mentions this, but the packet index D11 row omits it.
- D8: required when local feedback eligibility or hook-scope/admission is in scope. D11 should consume eligibility through D8/D7/D10 projections and not infer from rule lane, `hookScope`, Grit metadata, or generator output.
- G-HOST: not a direct D11 behavior owner unless D11 touches host-policy declarations directly. It is relevant through D10 protected/host decisions and D9 host gates. If those projections are missing, D11 reports the missing upstream authority rather than embedding host-specific paths or policy.
- D15: not a default dependency. D11 records a trigger only if local discriminated hook DTOs cannot represent required command/state observations without contradiction.

## Missing And Extra Dependency Findings

Missing direct D6 dependency: D11 packet files currently list D0, D1, D7, D9, and D10 but omit D6 in proposal/tasks/index, despite the source packet and D6 accepted contract saying D11 consumes hook/staged diagnostic projections.

Missing D3 blocker in packet index: D11 design includes a D3 note, but the packet index row still says D11 requires only D0, D1, D7, D9, D10. Pre-push affected behavior depends on D3 graph facts and cannot be implementation-ready without D3 as at least a conditional blocker for pre-push target selection, graph refusal, affected-base provenance, and target truth.

Missing D8 eligibility edge: D11 should not decide whether a pattern is hook/local-feedback eligible. D8 owns explicit local-feedback admission; D7/D10 may project check/path decisions. D11 needs a required/conditional edge when pattern local-feedback admission, hook scope, or eligibility appears in hook behavior or recovery output.

G-HOST should remain transitive: D11 should not require G-HOST directly for all hook work. It should require accepted/live D10/D9 projections that already encode host-policy decisions. If D11 implementation touches host declarations or host-policy authoring guidance directly, that is a scope change and G-HOST becomes direct.

No extra dependency should be added for D12: D11 non-claims should say hooks do not replace verify handoff receipt, but D11 does not consume D12 to render local feedback.

## D15 Trigger Assessment

D15 should remain dormant for D11 unless D11 records a concrete representation failure. Current inputs do not show such a failure; local discriminated DTOs appear sufficient if D11 narrows its model to owned hook orchestration plus upstream projections.

If D11 does trigger D15, the exact trigger row should be:

| Trigger field | D11 value to record |
| --- | --- |
| Concrete scenario | `habitat hook pre-commit --dry-run` or normal pre-commit must correlate staged paths, pre/post git snapshots, upstream projection outcomes, delegated command argv/cwd/exit/duration, local-only non-claims, and restage decisions in one trace. |
| Current contradictory state | Hook trace can report `pass` while delegated command provenance lacks enough bounded state to prove which upstream projection was consumed, or can report a command/failure category based only on parsed text rather than a typed owner projection. |
| Local DTO alternative rejected | A D11-owned discriminated `LocalFeedbackStageOutcome` with variants for resource, file-layer check projection, partial-staging refusal, formatter handoff, D6 diagnostic projection, D9 transaction projection, pre-push graph/affected projection, and blocked-missing-upstream-projection. |
| Runtime command fields required | argv, cwd, bounded stdout/stderr or digests, exit code, duration, env subset if relevant, cache/freshness stance, staged paths, pre/post git snapshot, Graphite base observation for pre-push, and non-claim identifiers. |
| Public output impact | Any HookTrace schema, human notice, help text, docs example, or exported type change must cite concrete D0 rows and D1 output-family handling. |
| Claim boundary | Local feedback trace/provenance only; not CI, review readiness, apply safety, product/runtime readiness, Graphite readiness, OpenSpec acceptance, current-tree cleanliness, or rule correctness. |
| Rollback/escape plan | Keep provenance packet-local; if shared substrate is still required, move it into one sequential owner packet before D6/D7/D9/D11 implementation shares it. |
| Type-check/performance risk | Measure compile/test impact and avoid broad Effect/substrate migration unless it removes a named contradictory state. |

Absent that representation failure, D11 should specify no D15 activation.

## Downstream Realignment Plan

After D11 implementation facts exist, realign at least these surfaces:

- D11 OpenSpec packet and workstream ledgers: source authority, dependency graph, write set, projection contracts, validation gates, and review dispositions.
- Packet index: D11 dependency row must include D6 and D3 for pre-push affected behavior, plus D8/G-HOST conditional wording.
- D0 public-surface compatibility matrix: concrete rows for `habitat hook pre-commit`, `habitat hook pre-push`, `habitat hook --help`, hook human notice, HookTrace/LocalFeedbackTrace schema if public/exported, docs examples, Husky delegators, and any package exports.
- D1 output-family records: hook trace non-claims, refusal/recovery instructions, Graphite observation handling, and legacy local-feedback notice compatibility.
- Tests: hook trace tests, resource-state constructor tests, staged D10 refusal stop tests, D6 diagnostic projection rendering tests, D7 local-feedback check projection tests, D9 transaction projection rendering tests, pre-push D3 graph/base/affected tests, partial-staging refusal tests, and public-output bad-case tests.
- `docs/process/resources-submodule.md`: already aligned with current explicit publish/refusal behavior; keep it as the model.
- `docs/process/CONTRIBUTING.md`: currently says resource diffs are auto-committed/pushed via pre-commit. D11 implementation should update this to match explicit `bun run resources:publish` plus hook refusal behavior.
- `docs/process/GRAPHITE.md`: if D11 changes pre-push base detection or Graphite handoff guidance, add a local-feedback/non-claim note rather than treating hook pass as PR readiness.
- Root `AGENTS.md` hook guidance: update only if behavior changes, preserving the rule that hooks reduce local friction while CI remains authoritative.
- `.husky/pre-commit` and `.husky/pre-push`: keep stable unless D0 compatibility rows authorize any command-path change.
- Tool docs/examples under `tools/habitat-harness/docs/**`: update examples that show legacy hook notice output or old recovery behavior.

## Findings

### P1: D6 staged diagnostic dependency is missing from D11 execution authority

D11 source authority says Diagnostic Pattern Catalog owns staged Grit diagnostics, and D6 accepted spec says D11 consumes hook/staged diagnostic projections. Current D11 OpenSpec `Requires` omits D6, and tasks only say D7/D9/D10. This lets an implementation parse raw Grit JSON, inspect `CheckReport` internals, or classify adapter failures locally in hooks.

Repair: add D6 as a D11 direct requirement in proposal, design, tasks, spec scenarios, phase record, and packet-index recommendation. D11 must consume D6 projections directly or via D7 `LocalFeedbackCheckProjection` where the check outcome owns the final structural status. It must not parse raw Grit reports, raw process records, or diagnostic message text as target behavior.

### P1: Packet index omits D3 despite pre-push affected behavior depending on graph truth

D11 design notes that pre-push affected-target feedback consumes D3 graph facts, but the packet index D11 row omits D3. The current hook runs `nx affected` with fixed targets and Graphite/merge-base base detection; D3 owns target availability, dependency resolution, graph refusals, and false-green prevention.

Repair: keep D11 blocking until the packet index and D11 artifacts state that pre-push base/affected behavior is blocked by D3 graph facts. D11 may specify pre-commit-only work without D3 only if pre-push behavior is explicitly out of scope, but the current D11 packet includes `habitat hook pre-push`.

### P1: D11 does not specify a projection-only owner map for local recovery output

Current D11 says "consume D7/D9/D10 decisions" but does not enumerate the exact local feedback stage outcomes, owner for each outcome, recovery shape, stop point, and non-claims. That leaves implementation to invent semantics for resource state, file-layer refusal, D6 diagnostics, D8 eligibility, D9 transaction state, and D3 affected failures.

Repair: add a D11 stage contract table with `stage`, `upstream owner`, `input projection`, `D11 output`, `stop/continue rule`, `recovery instruction`, `trace fields`, and `non-claims`. Required stages: resource state, D10/D7 staged guard, partial staging, formatter handoff/restage, D6/D7 diagnostics, D9 transaction feedback if rendered, pre-push D3 graph/base/affected.

### P1: Public output and trace compatibility are too generic for implementation

D11 currently says HookTrace and human output may change under D0/D1 compatibility, but does not require concrete D0 row IDs before changing hook output, help, docs examples, trace schema, package exports, or Husky command paths. D0 matrix file is not yet present in the expected project path, so implementation cannot cite concrete rows today.

Repair: make D11 source implementation blocked until concrete D0 rows exist for every touched hook surface. Add D1 canonical non-claim IDs to the D11 spec, not just prose notices. Legacy hook notice text must be either preserved as a D0 compatibility phrase or replaced only through D0-approved versioning/deprecation.

### P2: D8 local-feedback admission is underspecified

D8 owns explicit local-feedback admission and says hook eligibility cannot be inferred from rule lane, Grit metadata, hook fields, or generator output. D11 currently has no conditional D8 dependency or scenario for missing/refused local-feedback admission.

Repair: add D8 as conditional dependency where D11 reports pattern eligibility, hook scope, or local-feedback admission. D11 should consume eligibility through D8/D7/D10 projections and render refused/missing admission as local recovery, not silently skip or decide eligibility locally.

### P2: G-HOST relevance needs transitive wording to preserve generic Habitat

D10 and D9 require G-HOST for host-owned generated/protected surfaces and host gates. D11 should not embed Civ7/MapGen/resource path policy. Current D11 does not say whether host-policy failures reach hook output through D10/D9 projections.

Repair: state that G-HOST is consumed only through D10 and D9 projections unless D11 directly touches host-policy declarations. If a D10/D9 projection reports missing host declaration or host gate, D11 renders the missing-authority recovery and remains generic.

### P2: Product recovery behavior is not strong enough for agents

The current D11 product scenario says fast feedback, but not what a developer/agent does next after each failure. The hook can fail from resources, partial staging, protected mutation, formatter, Grit diagnostics, malformed JSON, Graphite base, graph refusal, or Nx affected. These need exact recovery instructions and non-claims.

Repair: add scenario map and acceptance cases for each failure family. Each case must name owner, stage, blocked next commands, exact local action, whether retrying commit/push is appropriate, and what hook success still does not prove.

### P2: Current hook behavior demonstrates target risks D11 must explicitly repair

Current `hooks.ts` has target-risk patterns: `ResourceState.kind` plus `allowPreCommit` boolean correlation, legacy hook notice wording, local parsing of `CheckReport`/Grit adapter message text, direct fixed `nx affected` target list, and Graphite base observation recorded as hook trace state. These are acceptable as current-behavior inputs, not target authority.

Repair: D11 should require discriminated resource states with allowed/refused derived from variant; projection-based diagnostic and check handling; D3-backed pre-push target/graph handling; D1 non-claim IDs; and tests that make contradictory states unrepresentable or rejected.

### P3: Downstream docs contain stale hook/resource guidance

`docs/process/resources-submodule.md` correctly says publishing is explicit and hooks only check/refuse. `docs/process/CONTRIBUTING.md` still says resource diffs are auto-committed/pushed via `habitat hook pre-commit`.

Repair: add this to D11 downstream realignment. The doc should point to `bun run resources:publish` and describe hook refusal/retry, not automatic publish.

## Exact Repair Recommendations By Artifact

### `openspec/changes/deep-habitat-d11-local-feedback/proposal.md`

- Add D6 to `Requires`.
- Add conditional D3 requirement for all pre-push affected/base/target behavior.
- Add conditional D8 requirement for local-feedback eligibility/hook-scope admission.
- Add transitive G-HOST wording through D10/D9 projections.
- Replace "Consume D7/D9/D10 decisions" with D6/D7/D8/D9/D10/D3 projection-specific wording.
- Add D0 blocker text requiring concrete rows before touching hook command, human output, trace schema, help, Husky delegators, docs/examples, or exports.

### `openspec/changes/deep-habitat-d11-local-feedback/design.md`

- Add a local feedback stage table with owner, projection, output, stop/continue rule, recovery instruction, trace field, and non-claims.
- Define target `LocalFeedbackTrace`/`HookTrace` semantics as D1-bounded local feedback, not authority outside the local hook.
- Define resource state as discriminated variants: `clean`, `not-configured`, `staged-gitlink-allowed`, `dirty-submodule-refused`, `unstaged-gitlink-refused`, `locked-refused`, `uninitialized-refused`, `inspection-failed-refused`.
- Define pre-push graph consumption through D3 target facts and graph refusals; raw `nx affected` exit status is command outcome, not target truth.
- Define D15 trigger minimization and explicitly state no trigger unless the local DTO alternative fails.

### `openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md`

- Expand beyond the current two scenarios.
- Add requirements for D6 diagnostic projection rendering, D7 local-feedback check projection, D10/D7 protected mutation refusal, D9 transaction projection rendering, D3 pre-push graph facts, D8 local-feedback eligibility, D0/D1 compatibility/non-claims, and D15 trigger/no-trigger decision.
- Add scenarios for blocked-missing-upstream-projection so missing D6/D7/D8/D9/D10/D3 inputs cannot be reported as hook success.

### `openspec/changes/deep-habitat-d11-local-feedback/tasks.md`

- Add pre-implementation tasks to cite concrete D0 rows and D1 output-family/non-claim decisions.
- Add D6, D3, D8 conditional, and G-HOST-through-D10/D9 dependency checks.
- Split implementation tasks by stage, not by vague "clarify output".
- Add falsifying tests for staged D10 refusal, D6 diagnostic projection failure, D8 missing admission, D9 transaction recovery projection, D3 graph refusal, resource-state contradiction, and legacy notice compatibility.

### `openspec/changes/deep-habitat-d11-local-feedback/workstream/phase-record.md`

- Correct stale branch value from `codex/deep-habitat-openspec-remediation` to the active `codex/d11-local-feedback-packet` when packet files are repaired.
- Record the expanded dependencies and exact no-code status.
- Add pre-push D3 blocker and D6 staged diagnostic blocker as current gate conditions.

### `openspec/changes/deep-habitat-d11-local-feedback/workstream/review-disposition-ledger.md`

- Record these P1/P2 findings as accepted/repaired/rejected during D11 packet repair.
- Do not mark per-domino review complete until D6, D3, D8, D0/D1, and product recovery repairs are dispositioned.

### `openspec/changes/deep-habitat-d11-local-feedback/workstream/downstream-realignment-ledger.md`

- Add rows for packet index dependency repair, D0 matrix rows, D1 non-claim/output family, resources/contributing docs, Graphite workflow docs if pre-push behavior changes, root AGENTS hook guidance, Husky delegators, and tool docs/examples.

### `docs/projects/habitat-harness/openspec-remediation/packet-index.md`

Recommendation only; do not edit in this review pass.

- Change D11 `Requires` from `D0, D1, D7, D9, D10` to `D0, D1, D6, D7, D9, D10; D3 for pre-push affected/base/target behavior; D8 where hook eligibility/local-feedback admission is consumed; G-HOST through D10/D9 where host-owned protected/generated surfaces or host gates are projected`.
- Keep D11 status blocking until per-domino review repairs accepted P1/P2 findings.

### Current hook code/tests

Recommendation only; no source edits in this review pass.

- Later implementation should stop local parsing of raw Grit/check output as target diagnostic authority and consume accepted projections.
- Replace boolean-correlated `ResourceState` with discriminated constructors.
- Keep restaging restricted to formatter-touched files and prove partial-staging refusal remains before writes.
- Replace legacy hook notice wording or preserve it only through D0/D1 compatibility.
- Make pre-push target/base behavior consume D3 graph facts and render Graphite base as observed state only.

## Stop Condition Check

D11 must remain blocking because all four stop conditions in the user prompt are currently present:

- Hidden dependency assumptions: yes, D6 and D3 are not fully represented in D11/index requirements.
- Stale packet index blockers: yes, D11 index row omits D6 and D3 conditional blocker.
- Missing D6 diagnostic dependency: yes, direct blocker.
- Unclear product recovery behavior: yes, the packet does not yet specify recovery and non-claims per hook failure family.

Skills used: domain-design, information-design, solution-design, system-design, ontology-design, civ7-open-spec-workstream.
