# D11 Local Feedback OpenSpec Information/Testing Investigation

Status: investigation/review input only; not acceptance input and not a
closure record.

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
Live branch observed: `codex/d11-local-feedback-packet`.

## Source Authority Read Register

### Mandatory Skills And References Read

| Source | Read | Use In This Investigation |
| --- | --- | --- |
| `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md` | full | Single-owner domain boundary, authority overlap, seam and ambiguity tests. |
| `/Users/mateicanavra/.agents/skills/information-design/SKILL.md` | full | Artifact hierarchy, reader task, traceability, signal/noise, current vs historical status. |
| `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md` | full | Frame challenge, stakeholder/consumer fit, reversible vs high-commitment packet decisions. |
| `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md` | full | Falsification-first validation, oracle requirement, risk-proportional testing. |
| `/Users/mateicanavra/.agents/skills/testing-design/references/principles/universal.md` | full | Falsification, explicit oracle, equivalence/boundaries, spec-gap detection. |
| `/Users/mateicanavra/.agents/skills/testing-design/references/principles/heuristics.md` | full | Oracle decision tree, state-transition explosion rule, boundary testing rule. |
| `/Users/mateicanavra/.agents/skills/testing-design/references/leaflet-software-testing.md` | full | Software test layering, contract tests, mutation of weak oracles, environment-independent checks. |
| `/Users/mateicanavra/.agents/skills/testing-design/references/axes.md` | full | D11 validation posture: rigorous enough for local false-green prevention, binary command outcomes, fast feedback. |
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md` | full | OpenSpec workstream loop, downstream spec role, shortcut-language refusal. |
| `civ7-open-spec-workstream/references/source-map.md` | full | Authority order and OpenSpec artifact locations. |
| `civ7-open-spec-workstream/references/artifact-contracts.md` | full | Proposal/design/spec/tasks contract and compaction-safe phase records. |
| `civ7-open-spec-workstream/references/phase-loop.md` | full | Phase readiness, verification, downstream realignment, closure distinction. |
| `civ7-open-spec-workstream/references/validation-checks.md` | full | Phase readiness checks, shortcut scan, closure validation. |

### D11 Inputs Read

| Source | Read | Notes |
| --- | --- | --- |
| Source domino packet `$PHASE2_PACKET_DIR/D11-local-feedback.md` | full | Richer scenario inventory than current OpenSpec packet; still contains old local-authority vocabulary. |
| Current D11 packet `$OPENSPEC_CHANGES/deep-habitat-d11-local-feedback/**` | full | Proposal, design, spec, tasks, phase record, review ledger, downstream ledger, closure checklist. |
| Packet index `$REMEDIATION_DIR/packet-index.md` | full | D11 remains incomplete/blocking; index currently lists D11 dependencies without D6. |
| Current hook code `$HABITAT_TOOL/src/lib/hooks.ts` | full | Present behavior includes resource state, staged file-layer, partial staging, Biome, Grit JSON parsing, Graphite base, Nx affected, HookTrace. |
| Current hook tests `$HABITAT_TOOL/test/lib/hooks.test.ts` | full | Current tests cover several D11 scenarios but still assert legacy hook notice wording. |
| D0/D1/D6/D7/D9/D10 OpenSpec specs and targeted designs | read relevant full specs plus projection sections | Used to identify exact upstream projections and prohibited inferences. |
| `$REMEDIATION_DIR/context.md` | read relevant section | Operational fixture has stale `$ACTIVE_REMEDIATION_BRANCH` value: `codex/d10-protected-zone-authority-packet`. |
| Root `AGENTS.md` in active worktree | full | Confirms Graphite workflow, absolute `apply_patch` rule, hooks are local friction reduction while CI is authoritative. |

### Commands Run

| Command | Result | Interpretation |
| --- | --- | --- |
| `git -C $ACTIVE_REMEDIATION_WORKTREE status --short --branch` | clean on `codex/d11-local-feedback-packet` | Start state clean. |
| `gt status` | clean worktree reported through Graphite/git | Graphite is present enough to use Graphite workflow later; no commit made here. |
| `bun run openspec -- validate deep-habitat-d11-local-feedback --strict` | exit 0; change is valid | Shape validation passes only. It does not establish implementation readiness. |

## Artifact-By-Artifact Critique

### Proposal

The proposal correctly frames D11 as local feedback rather than CI, verify,
apply, or rule/check ownership. It is not implementation-ready.

Blocking gaps:

- `Requires` omits D6 even though the source packet, accepted D6 contract, and
  supervisor watchpoint require D11 to consume D6 staged diagnostic projections.
- `What Changes` says D7/D9/D10 only; it does not say D11 consumes D6
  diagnostics directly or through a D7 `LocalFeedbackCheckProjection`.
- The D3 pre-push note is useful, but it leaves pre-push behavior split between
  D3, D7, D12, and D11 without naming the exact D11-owned hook local-feedback
  scope vs graph/verify owners.
- Verification gates include `habitat hook pre-commit -- --help`, but no
  expected output/exit oracle, no `pre-push` help/unknown-hook oracle, and no
  bad-case command gates for required false-green refusals.

### Design

The design is underspecified. It names the domain boundary and rejected alternative
but does not resolve enough decisions for implementation.

Missing design decisions:

- No hook stage state machine. The source packet requires a pipeline of local
  feedback stages; the current design does not define stage order, terminal
  outcomes, stage inputs, or which stage owns stopping.
- No resource state union design. The source packet explicitly calls out
  `ResourceState.kind` / `allowPreCommit` contradiction; current design does
  not choose constructors or discriminated states.
- No exact D6/D7/D9/D10 projection consumption. It says "consume D7/D9/D10"
  but not the projection names, state families, prohibited inferences, or
  unavailable-state behavior.
- No public compatibility map. D0 requires hook output, human-output claims,
  HookTrace, package exports, CLI hook surfaces, and docs examples to have rows
  before source changes. D11 only says a disposition is needed later.
- No staged mutation semantics for Git name-status actions, deleted files,
  rename/copy pairs, partial staging, formatter touched paths, or restage
  failures.
- No state-space reduction plan for HookTrace and outcomes. Current trace can
  record command phases, but the target design does not define which trace
  states are compatibility-only vs target `LocalFeedbackTrace`.
- No pre-push base resolution algorithm. It must be deterministic: explicit
  base override, Graphite parent observation, merge-base fallback, and final
  refusal/pass behavior when required authority is unavailable.

### Spec Delta

The spec delta has one broad requirement and two scenarios. That is insufficient
for a D11 authority packet.

Spec gaps:

- It does not define D11-owned hook commands, hook-local feedback stages,
  `LocalFeedbackTrace`/`HookTrace`, resource states, partial staging, restaging,
  pre-push base resolution, or non-claims as normative requirements.
- It has no normative scenario for D6 diagnostic finding, D6 diagnostic
  adapter failure, D6 unavailable/refusal, or Grit diagnostic local feedback.
- It has no normative scenario for D7 `LocalFeedbackCheckProjection`
  unavailable/refusal.
- It has no normative scenario for D9 transaction projection unavailable or
  refused local feedback.
- It has no normative scenario for D10 protected-zone/forbidden-file
  refusals stopping the hook before Biome, Grit, generated publish, resource
  publish, or restaging.
- It has no false-green refusal requirement. A hook pass is still representable
  after unavailable required authority, unparseable diagnostic output,
  protected-zone refusal, partial staging, or affected-target failure.

### Tasks

Tasks are not implementation slices. They are broad reminders.

Problems:

- 2.1 through 2.3 are design statements, not executable source/test slices.
- No task names the exact later write set. Required D11 write-set records include
  `$HABITAT_TOOL/src/lib/hooks.ts`, hook CLI entrypoint/command wiring if
  touched, `$HABITAT_TOOL/test/lib/hooks.test.ts`, any new test fixtures, and
  D0 matrix/docs surfaces before implementation.
- No protected path list. D11 must protect generated outputs, resources,
  lockfiles, `dist/`, `mod/`, D6/D7/D9/D10 source redesign files unless a task
  explicitly owns a projection-consumption seam.
- No tasks for D6/D7/D9/D10 projection adapters, current HookTrace
  compatibility, or D0/D1 public compatibility handling.
- Validation tasks do not state oracles. They name commands but not expected
  exit status, required output fragments, cache/freshness stance, bad-case
  setup, or non-claims.

### Workstream Ledgers And Control Files

- `phase-record.md` has stale branch `codex/deep-habitat-openspec-remediation`;
  live branch is `codex/d11-local-feedback-packet`.
- `$REMEDIATION_DIR/context.md` has stale `$ACTIVE_REMEDIATION_BRANCH`:
  `codex/d10-protected-zone-authority-packet`.
- `review-disposition-ledger.md` correctly marks per-domino review blocking,
  but it has no D11-specific findings yet.
- `downstream-realignment-ledger.md` is too generic. It should name D6, D7,
  D9, D10, D0/D1 public compatibility, current hook tests, docs/examples, and
  packet index dependency repair.
- `closure-checklist.md` separates design and later implementation, but it
  does not include D11-specific upstream projection, false-green, wording, or
  public compatibility closure gates.

## Required Spec Requirement Families And Scenario List

D11 needs a materially larger spec delta. The complete requirement
families are below.

### 1. Hook Commands Are Local Feedback Entrypoints

Scenarios:

- `habitat hook pre-commit` runs configured local stages and emits canonical
  D1 non-claims.
- `habitat hook pre-push` runs pre-push local feedback without claiming CI,
  review, Graphite readiness, OpenSpec acceptance, product/runtime behavior, or
  apply safety.
- Unsupported or missing hook name exits nonzero with expected-name message and
  produces no passing trace.
- Hook help output is public-surface compatible through D0 rows.

### 2. Hook Stage State Machine Is Closed

Scenarios:

- Clean pre-commit passes only after all required stages return pass or
  explicit not-applicable.
- Resource-blocked state refuses before file-layer, Biome, Grit, publish, and
  restage commands.
- File-layer failed state stops before Biome, Grit, generated publish, resource
  publish, or restaging.
- Partial staging refusal stops before formatting/restaging.
- Biome format failure stops before restage/check/Grit.
- Formatter restage failure stops before Biome check/Grit.
- Biome check failure stops before Grit.
- Grit diagnostic finding produces local diagnostic feedback and nonzero hook
  result.
- Every terminal state maps to exactly one hook outcome and trace state.

### 3. D6 Diagnostic Projection Consumption Is Explicit

Scenarios:

- D6 `DiagnosticRunOutcome.kind == "findings"` or hook-eligible diagnostic
  projection renders at least one normalized diagnostic and cannot pass.
- D6 clean diagnostic projection may contribute to pass only for that
  diagnostic stage and does not imply current-tree cleanliness.
- D6 adapter failures `tool-unavailable`, command failed/interrupted,
  `GritNoJson`, `GritMalformedJson`, `GritSchemaDrift`,
  `GritUnexpectedResultShape`, `projection-missed`,
  `unexpected-diagnostic-identity`, or `cache-observation-missing` are
  non-passing local feedback states.
- D11 must not parse raw Grit JSON/text/process records or current hook message
  text as target semantics.
- D11 must not infer Pattern Governance, apply safety, hook sequencing, or
  full current-tree cleanliness from a D6 diagnostic projection.

If mediated through D7: D11 consumes D7 `LocalFeedbackCheckProjection` with
kind `diagnostic-unavailable` or other check outcome labels. The prohibited
inference is: treating `diagnostic-unavailable` as a D7-owned diagnostic domain,
or treating D7's local-feedback-safe projection as a replacement for D6
`DiagnosticRunOutcome` ownership.

### 4. D7 Check Projection Consumption Is Explicit

Scenarios:

- D11 consumes `LocalFeedbackCheckProjection`, not D7 human output.
- Projection `pass`, `advisory-only`, `fail`, `selector-refused`,
  `dependency-refused`, `diagnostic-unavailable`, `baseline-refused`,
  `protected-zone-refused`, and `not-applicable` have closed hook outcomes.
- Any required selected-rule refusal or unavailable dependency blocks hook pass.
- D7 projection non-claims are preserved in hook human output and trace.

### 5. D10 Protected/Generated/Forbidden Refusals Stop Hook Work

Scenarios:

- D10-origin `ProtectedMutationGuardProjection` with
  `refused-direct-generated-edit`, `refused-direct-protected-edit`,
  `refused-forbidden-file`, `blocked-missing-host-declaration`,
  `blocked-declaration-conflict`, malformed D2 projection, or unknown zone
  reference blocks pre-commit.
- D11 does not match protected paths locally to decide policy.
- D10 refusal output includes repo-relative path/action, owner authority,
  recovery instruction, and D1 non-claims.
- Hook stops before Biome, Grit, generated publish, resource publish, or
  restaging after D10-origin refusal.

### 6. D9 Transaction Local Feedback Is Projection-Only

Scenarios:

- If D11 surfaces apply/fix local feedback, it consumes a D9 projection for
  unavailable, refused, dry-run, applied, rolled-back, rollback-failed, or
  recovery-required outcomes.
- D9 projection unavailable/refused blocks any local success claim for the
  apply/fix feedback stage.
- D11 must not recompute apply safety from diagnostic findings, dry-run output,
  changed paths, or formatter results.

### 7. Resource State Is A Discriminated Union

Scenarios:

- `clean` allows pre-commit resource stage.
- `not-configured` is a local non-claim pass only if D11 explicitly keeps that
  behavior under D0/D1 compatibility.
- `staged-gitlink` is allowed only when the submodule worktree is clean.
- `dirty-submodule`, `unstaged-gitlink`, `locked`, `uninitialized`, and
  inspection failure states refuse with recovery instructions.
- State construction cannot represent `allowPreCommit: true` for refused
  resource variants.

### 8. Staged Paths, Partial Staging, Formatting, And Restage Are Bounded

Scenarios:

- Deleted, renamed, copied, added, and modified staged paths are normalized to
  repo-relative path/action facts.
- Partially staged Biome-supported file refuses before formatting.
- Biome format failure blocks pass.
- Restage command failure blocks pass.
- Only formatter-touched staged paths are restaged.
- Formatter or restage must not alter protected paths outside the stage policy.

### 9. Pre-Push Base And Affected Targets Are Local Feedback

Scenarios:

- Explicit base override is used without Graphite probing.
- Graphite parent, when available, is observed as local base state only.
- Merge-base fallback is used only under the specified priority.
- Required pre-push base authority unavailable/refused cannot be a silent pass
  if D11 chooses to make that authority required.
- Nx affected nonzero exit maps to `affected-failed` and blocks hook pass.
- Pre-push pass does not claim CI, Graphite readiness, OpenSpec acceptance, or
  product/runtime behavior.

### 10. Public Compatibility And Legacy Wording Are Controlled

Scenarios:

- Any hook command, hook output, help text, `HookTrace`, exported type, docs
  example, or D0 plane touched by D11 cites concrete D0 surface rows.
- Existing legacy hook notice phrase is treated only as D1/D0 compatibility wording
  whose target meaning is `local-feedback-only`.
- Target code/product terms use checks, diagnostics, command records, receipts,
  decisions, transactions, outcomes, validation gates, and non-claims.

### 11. False-Green Refusal Is Normative

Scenarios:

- Hook pass cannot occur after unavailable required authority.
- Hook pass cannot occur after unparseable diagnostic output.
- Hook pass cannot occur after D6 adapter failure.
- Hook pass cannot occur after D10 protected/generated/forbidden refusal.
- Hook pass cannot occur after partial staging refusal.
- Hook pass cannot occur after Biome format/restage/check failure.
- Hook pass cannot occur after affected-target failure.
- Hook pass cannot occur after contradictory `CheckReport` / local feedback
  projection validation.

## Validation Matrix With Command/Test Oracles

This is a design for later implementation validation, not a record that those
checks passed.

| Scenario | Later Command/Test | Oracle |
| --- | --- | --- |
| Clean pre-commit local feedback | `bun run --cwd tools/habitat test -- test/lib/hooks.test.ts -t "passes clean"` | exit 0; trace outcome `pass`; D1 non-claims present; no CI/apply/product claims. |
| Resource-blocked | focused hook test for dirty/locked/uninitialized resources | exit 1; no file-layer/Biome/Grit/publish/restage calls; recovery instruction present. |
| File-layer failed / D10 refusal | focused hook test with D7 `LocalFeedbackCheckProjection` carrying D10 refusal | exit 1; stops before Biome/Grit/restage; renders D10 owner/recovery without path-policy recomputation. |
| D6 diagnostic finding | hook-stage unit/contract test with D6 findings projection | exit 1; renders at least one normalized diagnostic; no raw Grit parsing. |
| D6 adapter unavailable/refusal | table test for `tool-unavailable`, `GritNoJson`, `GritMalformedJson`, schema drift, unexpected identity, projection miss | exit 1; terminal outcome is diagnostic unavailable/refused; false-green impossible. |
| D7 projection unavailable/refusal | contract test for each `LocalFeedbackCheckProjection.kind` | only `pass` or allowed `advisory-only` can contribute to hook pass; refused/unavailable states block. |
| D9 projection unavailable/refused | contract test for D9 local-feedback projection | D11 renders recovery/non-claims; never computes apply safety; unavailable/refused blocks success for that stage. |
| Protected-zone refusal | hook test using `ProtectedMutationGuardProjection` or D7 projection `protected-zone-refused` | exit 1; no Biome/Grit/publish/restage; output stays local feedback. |
| Partial staging | existing plus expanded test for supported and unsupported extensions | supported partial staged path exits 1 before format/restage; unsupported path behavior is explicitly specified. |
| Biome format/check failure | focused tests for nonzero formatter/check | nonzero hook result; later stages not run after failure. |
| Restage failure | focused test where `git add --` fails | nonzero hook result; trace outcome `formatter-restage-failed`; no Grit. |
| Grit diagnostic local feedback | focused test with D6/D7 projection rather than parsed message text | finding blocks pass and local output includes diagnostic owner/recovery if present. |
| Pre-push explicit base | existing pre-push test | explicit base used; Graphite/merge-base not probed; non-claims present. |
| Pre-push Graphite parent | existing/expanded pre-push test | Graphite parent observed as base; not PR readiness. |
| Pre-push fallback unavailable | new test for Graphite and merge-base unavailable | either specified fallback to `main` with non-claim or explicit refusal; no silent success if authority is required. |
| Nx affected failure | existing pre-push test | exit follows Nx nonzero; outcome `affected-failed`; false-green impossible. |
| Unknown hook/help | `bun run habitat hook -- --help`, `bun run habitat hook definitely-not-a-hook` or unit equivalent | help exits per D0 row; unknown exits nonzero with expected names and no passing trace. |
| Public compatibility | D0 matrix validation plus D11 changed-surface audit | every changed hook output/trace/export/docs surface has D0 row and closed handling. |
| Wording audit | scan for legacy authority terms and shortcut terms in `$D11_CHANGE` | only source critique or forbidden-language sections may match; target terms repaired. |
| OpenSpec shape | `bun run openspec -- validate deep-habitat-d11-local-feedback --strict` | exit 0; shape only, not implementation readiness. |
| Full OpenSpec corpus | `bun run openspec:validate` | exit 0 before packet acceptance; shape only. |
| Whitespace | `git diff --check` | exit 0 before commit/closure. |

Design-time gates are the packet repair review, strict OpenSpec validation,
wording audit, and review-ledger disposition. Later implementation gates are
source tests, hook command probes, D0 matrix checks, and source/corpus
validation after code changes.

## Wording Audit Concerns

- Source D11 uses legacy authority wording throughout. That is acceptable as historical input
  only; target D11 packet language should use validation gates, command
  records, local feedback traces, outcomes, receipts, decisions, diagnostics,
  transactions, and non-claims.
- Current D11 packet still says "present-behavior input" and repair records
  in ledgers. For control artifacts this is tolerable if the wording is
  not target product vocabulary, but D11 should avoid carrying authority terms into
  hook output, type names, product docs, or target spec requirements.
- Current hook code and tests still assert the legacy hook notice that says local feedback only and CI
  remains authoritative.` D1 treats this as a D0-classified compatibility
  phrase, not target meaning. D11 must either preserve through explicit D0 row
  or replace/version it through D0 handling.
- The proposal includes shortcut terms only as forbidden strategy, which is
  acceptable. The repaired packet should keep shortcut terms out of allowed
  implementation tasks.

## Findings

### P1 Findings

| ID | Finding | Why It Blocks | Required Repair |
| --- | --- | --- | --- |
| D11-P1-001 | D11 omits D6 as a direct consumed authority in proposal/requirements and has no D6 diagnostic scenarios. | Supervisor watchpoint requires D11 to explicitly consume D6 staged diagnostic projections. Without this, implementation can collapse diagnostic feedback into current hook Grit parsing or D7-only check output. | Add D6 to `Requires`; define D6 `DiagnosticRunOutcome` / hook-eligible diagnostic projection consumption; name D7 `LocalFeedbackCheckProjection` only as mediation, with prohibited inference that D7 owns D6 diagnostic truth. |
| D11-P1-002 | Spec delta is underspecified as an implementation authority. | Two scenarios leave product/domain trade-offs to implementation: stage order, terminal states, upstream unavailable states, false-green refusal, public compatibility, and hook trace compatibility. | Replace with complete D11 requirement families and normative scenarios listed above. |
| D11-P1-003 | False-green refusals are not normative. | Hook pass remains spec-representable after unavailable required authority, unparseable diagnostics, protected-zone refusal, partial staging, formatter/restage failure, or affected-target failure. | Add a false-green refusal requirement and focused scenarios/tests that make those pass states unrepresentable or validation-rejected. |
| D11-P1-004 | Tasks are not executable slices and do not name write set/protected paths. | Later implementation would decide file ownership, sequencing, public compatibility, and validation oracles while coding. | Rewrite tasks into ordered slices with exact write set, protected paths, dependencies, and per-slice validation commands/oracles. |
| D11-P1-005 | Public compatibility is deferred generically. | D0/D1 require hook output, help, HookTrace, exports, docs examples, and legacy hook notice wording to be classified before changes. | Add D0 matrix rows/gates as explicit pre-source blockers and task requirements; do not allow hook output/trace changes without D0 closed handling. |

### P2 Findings

| ID | Finding | Impact | Required Repair |
| --- | --- | --- | --- |
| D11-P2-001 | D9 consumption is named but not designed. | If D11 surfaces apply/fix local feedback, implementation may parse legacy transaction objects or infer apply safety. | Define D9 local-feedback-safe transaction projection states and D11 non-ownership. If D11 will not surface D9 in this slice, explicitly carve it out and remove/adjust dependency claims. |
| D11-P2-002 | Pre-push graph and affected-target boundary is ambiguous. | D11 may accidentally own graph truth, verify semantics, or D12 affected-target receipt behavior. | Define D11 pre-push as local feedback only; name D3/D7/D12 ownership and D11's exact base-resolution and Nx-result rendering responsibilities. |
| D11-P2-003 | Resource state design from source packet is absent. | Existing `kind` + `allowPreCommit` contradiction remains a known invalid-state risk. | Add discriminated resource states and constructor/oracle scenarios. |
| D11-P2-004 | Current control files have stale branch metadata. | Continuity records can misroute later agents. | Repair `workstream/phase-record.md` branch to `codex/d11-local-feedback-packet`; update `$REMEDIATION_DIR/context.md` operational fixture if that file is in scope for packet/control edits. |
| D11-P2-005 | Downstream realignment ledger is generic. | Consumers cannot see which D6/D7/D9/D10/D0/D1 assumptions changed or need no-patch disposition. | Add explicit rows for D6 diagnostic projections, D7 local-feedback projection, D9 transaction projection, D10 local feedback/guard projections, D0/D1 public compatibility, hook tests/docs, and packet index D6 dependency. |

### P3 Findings

| ID | Finding | Repair |
| --- | --- | --- |
| D11-P3-001 | `design.md` says "Affected owners" and "Adjacent domains consume this packet" but does not include a compact upstream/downstream projection table. | Add one table naming owner, D11 consumes, D11 must not infer, and source blocker. |
| D11-P3-002 | Validation gates in proposal/phase record do not separate design-time from implementation-time gates. | Split into `Design packet gates` and `Later implementation gates`. |
| D11-P3-003 | `openspec validate` passes, which could be misread as readiness. | Record in phase/closure language that strict validation is shape validation only. |

## Repair Recommendations By Artifact

### `proposal.md`

- Add D6 to `Requires`.
- Replace `Consume D7/D9/D10 decisions` with explicit D6/D7/D9/D10 projection
  consumption.
- Add public compatibility blockers for hook commands, help, human output,
  `HookTrace`/`LocalFeedbackTrace`, package exports, docs examples, and legacy
  wording.
- Split verification gates into design-time and later implementation gates with
  expected outcomes.

### `design.md`

- Add a stage state machine table: stage, input projection, owner, pass
  condition, refusal condition, terminal outcome, trace fields, next stage.
- Add upstream projection table:
  - D6: `DiagnosticRunOutcome` / diagnostic consumer projection; no Pattern
    Governance, apply safety, raw Grit, or hook sequencing inference.
  - D7: `LocalFeedbackCheckProjection`; no human-output parsing or D6/D10
    authority absorption.
  - D9: local-feedback-safe transaction projection; no apply-safety
    recomputation.
  - D10: `ProtectedMutationGuardProjection`, `ForbiddenArtifactProjection`,
    D7-rendered protected-zone refusal; no local path-policy matching.
- Add resource-state discriminated union and invalid-state rejection.
- Add pre-push base priority and affected-target failure handling.
- Add D0/D1 public compatibility plan and exact target language decisions.

### `specs/habitat-harness/spec.md`

- Replace the current broad requirement with the requirement families and
  scenario list above.
- Include normative false-green refusal scenarios.
- Include mediated-D6-through-D7 wording that names the projection and
  prohibited inference.
- Include public compatibility and non-claim scenarios.

### `tasks.md`

Rewrite into slices such as:

1. D0/D1 compatibility rows for D11 surfaces.
2. D6 diagnostic projection consumption adapter/tests.
3. D7 `LocalFeedbackCheckProjection` consumption adapter/tests.
4. D10 protected/forbidden refusal hook sequencing tests.
5. Resource state union and constructor tests.
6. Partial staging/Biome/restage stage tests.
7. Pre-push base/affected local feedback tests.
8. Hook output/trace compatibility and wording audit.
9. Docs/examples/downstream realignment.
10. Final design and implementation validation gates.

Each slice should include write set, protected paths, expected test command,
oracle, and non-claims.

### Workstream Files

- Repair stale branch in `workstream/phase-record.md`.
- Consider repairing `$REMEDIATION_DIR/context.md` operational fixture branch
  during control-file edits.
- Add D11-specific findings to `review-disposition-ledger.md` when accepted by
  the workstream owner.
- Expand downstream ledger rows as described above.
- Add false-green, D6/D7/D9/D10 projection, public compatibility, and wording
  gates to closure checklist.

## Verdict

D11 is blocking.

The packet is OpenSpec-shape valid, but it is not implementation-ready. It still
allows later implementation agents to decide product/domain trade-offs,
validation oracles, upstream projection ownership, false-green behavior, public
compatibility handling, and target wording.

The highest-priority ambiguity is D6: D11 must explicitly consume D6 staged
diagnostic projections. D7's `LocalFeedbackCheckProjection` may mediate
local-feedback-safe check rendering, but D11 must not collapse D6 diagnostic
ownership into D7 or into current hook Grit parsing. Until that is repaired in
proposal/design/spec/tasks and control files, D11 should not authorize source
implementation.

Skills used: domain-design, information-design, solution-design, testing-design,
civ7-open-spec-workstream.
