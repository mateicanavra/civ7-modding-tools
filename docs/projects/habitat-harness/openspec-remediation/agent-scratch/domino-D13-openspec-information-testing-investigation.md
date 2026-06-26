# D13 OpenSpec Information And Testing Investigation

Reviewer: fresh D13 OpenSpec/information/testing reviewer  
Change: `deep-habitat-d13-scaffolding-refusal-contracts`  
Verdict: BLOCKED. The live proposal has started moving toward executable design, but the packet is not coherent across proposal, design, spec delta, tasks, phase record, ledgers, and checklist. D13 still leaves design choices for implementation.

## 1. Artifact Completeness Review

### Proposal

The proposal is the strongest artifact. It now names D13 request/outcome areas, public-surface blockers, G-HOST blocking, stop conditions, and a design-time/later-implementation validation split. It is still not sufficient by itself because later gates use placeholders and omit expected status/output/no-write oracles.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:42-57` names the closed request/outcome areas the rest of the packet must carry.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:69-82` names D0/D2/D8/G-HOST dependencies and implementation blockers.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:127-146` separates validation phases, but later commands still use `<fixture>` placeholders and do not record expected status, output family, no-write oracle, or non-claim.

Required repair: keep the richer proposal direction, but make it the packet contract rather than a proposal-only improvement.

### Design

The design is now the strongest artifact. It contains a domain boundary, ontology table, closed target state model, request/outcome matrix, refusal contract, receipt contract, D8 boundary, G-HOST/D14 blockers, write/protected paths, public compatibility blockers, and validation model. The remaining issue is not the design in isolation; it is that the spec delta, tasks, phase record, ledgers, and closure checklist have not caught up to it.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:64-130` defines the closed request/decision/refusal model.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:181-221` names write set and protected paths.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:240-266` defines the validation model with expected results, oracles, and non-claims.

Required repair: use `design.md` as the source for repairing `spec.md`, `tasks.md`, `phase-record.md`, `downstream-realignment-ledger.md`, and `closure-checklist.md`.

### Spec Delta

The spec delta is incomplete. It contains one requirement and two scenarios, so it does not specify supported project kinds, preflight conflicts, D8 candidate handoff, registered-pattern refusal, host-policy refusal, or Authoring Topology refusal.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:3-13` has only supported and unsupported scaffold scenarios.
- Source D13 required supported kinds, project preflight/refusal states, candidate pattern output state, registered pattern handoff, unsupported-kind refusal, Authoring Topology refusal, and host-policy missing refusal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:32-40`.
- D8 requires D13 to consume `CandidateHandoffProjection` and avoid active `.grit`, baseline, rule registry, hook, or apply writes by implication at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:262-266`.

Required repair: replace the single thin requirement with the requirement families in section 3.

### Tasks

The task list is not executable. The implementation tasks mirror broad objectives rather than naming concrete edits, state transitions, tests, or oracles.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:14-16` has three broad implementation bullets.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:20-24` lists broad validation commands without bad-case assertions or no-write checks.

Required repair: tasks must become implementation steps, for example "define closed supported-kind union", "add unsupported-kind refusal tests for mod/engine/control/adapter/sdk/tooling", "assert candidate-only pattern writes", "assert registered-pattern no-manifest refusal", and "cite D0 rows for every public surface changed."

### Workstream Ledgers

The workstream files exist, but they do not carry the improved proposal contract.

- Phase record: records status and gates, but has stale branch metadata and no write set/protected path matrix. See `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md:5-10` and `:22-28`.
- Review ledger: correctly keeps the per-domino review gate blocking, so D13 cannot be accepted yet. See `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/review-disposition-ledger.md:5-10`.
- Downstream ledger: lists pending surfaces but does not name D14 blockers, G-HOST acceptance dependency, D0 row requirements, or exact patch/no-patch criteria. See `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/downstream-realignment-ledger.md:5-9`.
- Closure checklist: generic checklist items are present, but not the exact D13 matrix needed for closure. See `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/closure-checklist.md:5-12`.

## 2. Information Architecture Corrections Needed

1. Make the proposal/design structure authoritative across all packet files:
   - What D13 owns.
   - What D13 refuses.
   - What D13 hands to D8.
   - What D13 consumes from D0/D2/D8/G-HOST.
   - What commands prove or falsify each state.
   - What D13 explicitly does not claim.

2. Add one scenario matrix in `design.md` and mirror it as normative requirement families in `spec.md`. The source packet already gives the injected bad-case seed at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:124-135`; the live packet must not rely on readers finding it there.

3. Split validation into design-time artifact checks and later implementation behavior checks everywhere, not only in `proposal.md`/`design.md`. `tasks.md`, `phase-record.md`, and `closure-checklist.md` still flatten the distinction.

4. Fix status/fixture drift:
   - Actual branch observed by `git branch --show-current`: `codex/d13-scaffolding-refusal-packet`.
   - Context now also records `codex/d13-scaffolding-refusal-packet` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:15-16`.
   - D13 phase record still says `codex/deep-habitat-openspec-remediation` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md:8`.

## 3. Normative Spec Requirement Families And Scenario Matrix D13 Needs

### Requirement Family: Supported Project Scaffolding Is Closed And Uniform

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Supported plugin | `bun run nx g @habitat/cli:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive` | 0 | Dry-run reports only `packages/plugins/plugin-d13-plugin-smoke/**`; no disk writes after dry-run; D0 row exists for schema/help/output if changed. | Does not prove plugin product behavior. |
| Supported foundation | `bun run nx g @habitat/cli:project d13-foundation-smoke --kind=foundation --dry-run --no-interactive` | 0 | Dry-run reports only `packages/d13-foundation-smoke/**`; no disk writes after dry-run. | Does not prove package build beyond scaffold contract. |
| Supported app | `bun run nx g @habitat/cli:project d13-app-smoke --kind=app --dry-run --no-interactive` | 0 | Dry-run reports only `apps/d13-app-smoke/**`; no disk writes after dry-run. | Does not prove app runtime behavior. |

### Requirement Family: Unsupported Project Kinds Refuse Before Writes

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Non-uniform `mod` kind | `bun run nx g @habitat/cli:project d13-mod-refusal --kind=mod --dry-run --no-interactive` | nonzero | Message names supported uniform kinds, refused kind, owning domain or next safe action; no `mods/d13-mod-refusal/**`, package, or source files. | Does not implement mod scaffolding. |
| Non-uniform `engine/control/adapter/sdk/tooling` kinds | parameterized generator tests in `test/generators/project-generator.test.ts` | nonzero per kind | Each refusal has owner/reason/recovery and preserves tree state. Current code asserts no writes for `mod` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:90-99`, but D13 must define the full target matrix. | Does not claim all future workspace kinds are unsupported forever. |
| Literal host-specific kind | If D13 wants `--kind=host-specific`, it must first change schema through D0; otherwise use an admitted non-uniform kind such as `mod` as the host-owned refusal fixture. | blocked until design chooses | The refusal must come from Habitat's designed refusal path, not an Nx schema parser error. | Does not authorize generic Habitat host policy. |

### Requirement Family: Project Preflight Refusals Are No-Write Outcomes

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Root mismatch | generator test using `kind=app` and `directory=packages/misplaced-app` | nonzero | Existing file tree unchanged; no package/source files written. Current test pattern exists at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:101-114`. | Does not validate D0 compatibility by itself. |
| Package name mismatch | generator test using `kind=plugin` and wrong `packageName` | nonzero | Canonical root remains absent. Current test pattern exists at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:116-129`. | Does not prove package namespace policy beyond refusal. |
| Existing root or package collision | generator tests | nonzero | Preexisting files are byte-preserved; target package is absent. Current tests cover this at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:131-158`. | Does not prove all filesystem races. |

### Requirement Family: Pattern Generation Produces Candidate-Only State

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Candidate pattern | `bun run nx g @habitat/cli:pattern grit-d13-candidate --lifecycle=candidate --openspecChangeId=deep-habitat-d13-scaffolding-refusal-contracts --dry-run --no-interactive` | 0 | Only candidate paths are listed; no active `.grit`, `rules.json`, baseline, hook, local-feedback, or apply state. D8 requires this no-active-write rule at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:54-78` and `:262-266`. | Candidate generation does not register a rule. |
| Candidate collision with active pattern/rule/baseline | generator tests or fixture command with existing active surface | nonzero | No candidate files written; refusal names collision and protected surface. D8 requires refusal before candidate writes at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:69-72`. | Does not decide D8 admission. |

### Requirement Family: Registered Pattern Requests Hand Off To D8 Or Refuse

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Registered advisory without manifest | `bun run nx g @habitat/cli:pattern grit-d13-advisory --lifecycle=registered-advisory --dry-run --no-interactive` | nonzero | Refusal names Pattern Governance/D8, missing manifest, no active writes. Current test shape exists at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/pattern-generator.test.ts:57-69`. | Does not create Pattern Authority admission. |
| Registered enforced without manifest | `bun run nx g @habitat/cli:pattern grit-d13-enforced --lifecycle=registered-enforced --dry-run --no-interactive` | nonzero | Refusal names Pattern Governance/D8, missing manifest, no active writes. Current test shape exists at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/pattern-generator.test.ts:71-83`. | Does not admit hook/local-feedback/apply state. |
| Manifest with placeholder authority | generator test with placeholder manifest | nonzero | No active writes; refusal reason is closed and points to Pattern Authority repair. Current test shape exists at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/pattern-generator.test.ts:85-110`. | Does not prove manifest validity alone is sufficient. |

### Requirement Family: Host Policy And Authoring Topology Refusals Are Explicit Blockers

| Case | Command or test | Expected status | Required oracle | Non-claim |
| --- | --- | --- | --- | --- |
| Host policy missing for host-specific scaffold | exact command must be supplied after G-HOST acceptance | nonzero | Refusal names Host Policy Boundary, missing host declaration, next safe action, and no writes. G-HOST is still blocking in the index at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md:28` and D13 requires it at `:33`. | Does not implement host policy. |
| MapGen Authoring Topology request | exact command or fixture must be supplied by D13/D14 handoff | nonzero | Refusal names Authoring Topology owner, future trigger, and no generated domain/op/stage/step/recipe files. Source D13 requires this refusal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:38-40`. | Does not implement Authoring Topology. |

## 4. Design-Time Vs Later Implementation Validation Split

### Design-Time Checks Already Run

These checks prove only OpenSpec shape, not implementation readiness:

- `git status --short --branch`: observed clean branch `codex/d13-scaffolding-refusal-packet` before this scratch edit.
- `gt status`: passed through to `git status`; working tree was clean before this scratch edit.
- `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`: exit 0, `Change 'deep-habitat-d13-scaffolding-refusal-contracts' is valid`.
- `bun run openspec:validate`: exit 0, 249 OpenSpec items passed.
- `git diff --check`: exit 0 after this scratch edit.

Non-claims:

- Passing OpenSpec validation does not prove D13 contains an executable scenario matrix.
- Passing OpenSpec validation does not repair unresolved P1/P2 review findings.
- Passing OpenSpec validation does not satisfy D0 compatibility rows, D8 candidate-handoff projections, or G-HOST host-policy acceptance.

### Later Implementation Checks Required For D13 Closure

D13 implementation validation command set after packet repair and source implementation:

1. `bun run --cwd tools/habitat test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`
   - Expected status: 0.
   - Required command record: includes explicit positive and negative D13 cases from section 3, including no-write assertions for every refusal.
   - Non-claim: broad generator tests alone do not prove D13 unless they assert the D13 scenario matrix.

2. `bun run nx g @habitat/cli:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive`
   - Expected status: 0.
   - Required command record: dry-run only, no persisted files, D0-compatible output if output changes.

3. `bun run nx g @habitat/cli:project d13-mod-refusal --kind=mod --dry-run --no-interactive`
   - Expected status: nonzero.
   - Required command record: designed refusal output with owner/reason/next action/non-claim, no files.

4. `bun run nx g @habitat/cli:pattern grit-d13-candidate --lifecycle=candidate --openspecChangeId=deep-habitat-d13-scaffolding-refusal-contracts --dry-run --no-interactive`
   - Expected status: 0.
   - Required proof: candidate-only output; no active `.grit`, registry, baseline, hook, local-feedback, or apply writes.

5. `bun run nx g @habitat/cli:pattern grit-d13-advisory --lifecycle=registered-advisory --dry-run --no-interactive`
   - Expected status: nonzero.
   - Required proof: D8-owned refusal for missing manifest/admission, no active writes.

6. `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`
   - Expected status: 0 after packet repairs.
   - Non-claim: validates change shape only.

7. `bun run openspec:validate`
   - Expected status: 0 after packet repairs.
   - Non-claim: validates OpenSpec corpus only.

8. `git diff --check`
   - Expected status: 0.
   - Non-claim: whitespace check only.

G-HOST-dependent host-specific commands cannot be closure evidence until G-HOST is accepted or D13 records that generic host-specific closure is blocked.

## 5. P1/P2 Findings

### P1: D13 artifacts disagree; proposal/design are ahead of spec/tasks/ledgers

The proposal and design now describe a closed request/outcome surface, but the spec delta, tasks, downstream ledger, phase record, and closure checklist still do not encode it. A later implementer would still have to decide which spec scenarios are normative, which tasks prove each state, and which ledgers block closure.

Evidence:

- Proposal names D13 request/outcome areas at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:42-57`.
- Design defines the detailed matrix at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:92-130`.
- Tasks reduce implementation to broad bullets at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:14-16`.
- Spec delta contains only two scenarios at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:7-13`.
- D13 downstream ledger does not record G-HOST/D14/D0 row blockers with patch/no-patch criteria at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/downstream-realignment-ledger.md:5-9`.

Required repair: propagate the proposal/design request/outcome model into `spec.md`, `tasks.md`, `phase-record.md`, `downstream-realignment-ledger.md`, and `closure-checklist.md`.

### P1: Validation gates are repaired in design but stale elsewhere

`design.md` now defines expected results, oracles, and non-claims, but `proposal.md`, `tasks.md`, and `phase-record.md` still do not agree with that design. The executable packet cannot rely on one artifact carrying the testing contract while the task and closure artifacts remain broad.

Evidence:

- Proposal later gates use placeholders and lack expected outcomes at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:137-146`.
- Design has the stronger validation matrix at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:240-266`.
- Tasks validation is command names only at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:20-24`.
- Phase record gates are command names only at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md:22-28`.
- Source D13 names expected statuses and injected bad cases at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:124-135`.

Required repair: copy the design validation matrix into `tasks.md`, `phase-record.md`, and closure criteria with command, expected status, expected output/refusal reason, no-write oracle, freshness/cache stance, proof claim, and non-claim. Include explicit negative cases: unsupported kind, registered pattern without manifest, candidate collision, host-specific scaffold missing host policy, and Authoring Topology request.

### P1: G-HOST is a blocking dependency, but D13 ledgers/checklist do not encode blocked closure

D13 now says G-HOST blocks source behavior, but the workstream control artifacts do not carry that blocker. D13 cannot claim host-specific refusal closure until G-HOST is accepted or until D13 explicitly records host-policy behavior as blocked/non-claim.

Evidence:

- D13 proposal says G-HOST remains blocking at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:81-82`.
- Packet index says G-HOST is incomplete and per-domino gate blocking at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`.
- Packet index says G-HOST must resolve host-policy boundaries before D13 can claim generic closure at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md:60-61`.
- G-HOST review ledger has an unresolved P1 per-domino review gate at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/review-disposition-ledger.md:10`.
- D13 downstream ledger does not record G-HOST as a closure blocker at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/downstream-realignment-ledger.md:5-9`.

Required repair: add D13 closure language stating that host-policy refusal scenarios remain blocked until G-HOST is accepted for design/specification and D13 names the consumed host-policy input. Add a downstream ledger row for G-HOST with `blocked` disposition and exact unblock criteria.

### P2: Public surface compatibility is scoped but not attached to concrete D0 rows

D13 names the public surfaces that may change and states D0 is required, but it does not cite concrete D0 row IDs or make implementation explicitly blocked on those rows in tasks/closure.

Evidence:

- D13 proposal requires concrete D0 rows for touched generator/public surfaces at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:71-74`.
- D13 proposal scopes the public surfaces at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:96-113`.
- D0 requires compatibility rows before later packets change generator behavior, help/output, public examples, or related surfaces at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:3-9` and stops packets without rows at `:22-27`.
- D13 tasks defer dependency gates to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:10`.

Required repair: D13 design/tasks/closure must either cite concrete D0 rows or say source implementation is blocked until rows exist for project generator schema/help/output, pattern generator schema/help/output, docs examples, and any JSON/refusal output.

### P2: Phase record branch metadata is stale

The context router has been updated to the D13 branch, but the D13 phase record still points at a generic remediation branch.

Evidence:

- Actual current branch observed: `codex/d13-scaffolding-refusal-packet`.
- Context router records the same branch at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:15-16`.
- D13 phase record says `codex/deep-habitat-openspec-remediation` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md:8`.

Required repair: correct the phase record branch before D13 claims compaction-safe state or closure readiness.

## 6. Required Closure Language And Packet-Index/Control Status Criteria

### Closure Language Required In D13

D13 closure language should say:

> D13 is accepted for design/specification only when proposal, design, spec delta, tasks, phase record, review ledger, downstream ledger, and closure checklist all contain the same closed Scaffolding and Refusal contract; every supported/refused/candidate/host/topology scenario has an expected command status, output/refusal family, write/no-write oracle, and non-claim; D0 rows are cited for every public generator/help/docs/output surface changed; D8 candidate handoff is consumed without active writes; G-HOST host-policy input is accepted or the host-specific closure claim remains blocked; and the per-domino review ledger has no accepted unresolved P1/P2 findings.

Implementation closure should separately say:

> Later source implementation may close only after the approved write set is followed, all D13 scenario commands/tests pass with recorded outputs, no-write oracles are demonstrated for every refusal, OpenSpec validation and `git diff --check` pass, downstream docs/tests/specs are realigned, and repo/Graphite state is clean or explicitly handed off.

### Packet Index Criteria

At the time of this first-wave review, the packet-index status was expected to remain:

`incomplete packet; per-domino adversarial gate BLOCKING`

That historical first-wave control state is superseded by the later final
rereview and packet-index acceptance update. At first-wave time, the index was
not to move to accepted design/specification until:

1. This review's accepted P1/P2 findings are dispositioned in the D13 review ledger.
2. D13 artifacts are repaired and rereviewed with no unresolved P1/P2 blockers.
3. D13 downstream ledger records G-HOST as accepted input or blocked dependency.
4. D13 cites D0 compatibility rows for all public generator/schema/help/docs/output changes.
5. D13 spec contains the requirement families and scenario matrix in section 3.
6. `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict` and `bun run openspec:validate` pass after repairs.

### Control Status

Blocked now:

- Design/spec acceptance: blocked by unresolved P1s above.
- Source implementation: blocked by packet-index D13 status, unresolved D13 review gate, missing cross-artifact D13 executable matrix, and G-HOST dependency.
- D14 downstream use: blocked until D13 gives D14 exact refusal/authoring-topology language and accepted status.
