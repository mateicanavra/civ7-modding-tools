Status: BLOCKING

# D8 OpenSpec / Information / Testing Investigation

## Scope

This investigation reviews D8 Pattern Governance as a design/specification
packet only. It does not authorize Habitat source refactor work. The controlling
input is the Phase 2 D8 packet, not the current D8 OpenSpec starter packet.

The D8 packet is not execution-ready. The existing proposal, design, spec,
tasks, and workstream files establish a useful starting structure, but they do
not yet contain the complete Pattern Governance ontology, requirement families,
bad-case matrix, validation oracles, implementation blockers, downstream
handoffs, rereview evidence, or closure records that D0-D7 require before
implementation.

## Sources Read

- Required skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `civ7-open-spec-workstream/references/source-map.md`
  - `civ7-open-spec-workstream/references/artifact-contracts.md`
  - `civ7-open-spec-workstream/references/validation-checks.md`
- D8 controlling and current packet inputs:
  - `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/proposal.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/design.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/tasks.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/phase-record.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/downstream-realignment-ledger.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/closure-checklist.md`
- Remediation control records:
  - `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- Accepted D0-D7 control-pattern inputs:
  - D0-D7 `workstream/review-disposition-ledger.md`
  - D0-D7 `workstream/phase-record.md`
  - D0-D7 `workstream/closure-checklist.md`
  - D7 `proposal.md`, `specs/habitat-harness/spec.md`, `tasks.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D7-final-openspec-information-review.md`
- Domain and current-code evidence:
  - `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`
  - `tools/habitat-harness/src/generators/pattern/generator.cjs`
  - `tools/habitat-harness/src/generators/pattern/registration.cjs`
  - `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat-harness/test/generators/pattern-generator.test.ts`
  - `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`

## OpenSpec Artifact Findings

### Status Finding

D8 must remain BLOCKING. The packet index already records D8 as a draft
starter packet with global constraints applied and a per-domino adversarial gate
blocking acceptance. The current D8 workstream review ledger repeats that global
constraints are not acceptance evidence and that fresh per-domino domain,
OpenSpec, topology, validation, information-design, and cross-domino review
remain required.

This investigation agrees with that status. The current D8 files do not contain
complete proposal/design/spec/tasks/ledgers comparable to accepted D0-D7.

### Proposal Findings

`proposal.md` correctly names Pattern Governance, the source D8 packet, D0/D2/D5/D6
dependencies, and D9/D13 consumers. It is not complete enough to authorize
implementation because it omits:

- a complete Pattern Governance lifecycle state table from the Phase 2 packet:
  candidate draft, manifest-invalid candidate, registered diagnostic pattern,
  registered hook-scoped pattern, registered apply-approved pattern, refused
  pattern, and retired pattern;
- explicit D0 public-surface blocker rows for generator schema/options, generated
  candidate manifest shape, registered manifest shape, rule registry writes,
  Pattern Authority package exports, docs/examples, command output, and tests;
- a dependency matrix that distinguishes accepted D0/D2/D5/D6 design authority
  from live source implementation prerequisites;
- D5 `BaselineAuthorityProjection`, D6 diagnostic identity/projection, and D2
  `ruleGovernanceFacts`/`ruleGritFacts`/`ruleBaselineFacts` consumption as source
  blockers rather than broad references;
- a stop condition for treating current `PatternAuthorityLifecycle` as the
  target lifecycle without repair;
- D13 starter packeting handoff rules for candidate generation and refusal output;
- D9 handoff rules for apply-approved patterns and non-apply patterns.

### Design Findings

`design.md` states the right acceptance threshold: a later implementation agent
must have no product, domain, naming, sequencing, public-surface, or validation
decision to invent. It does not meet that threshold.

The design needs a D8-specific decision center equivalent to D6/D7, including:

- target ontology and rejected terminology;
- current behavior diagnosis for generator, registration, manifest validation,
  candidate storage, active Grit pattern writes, baseline contract validation,
  and rule registry writes;
- domain boundary and forbidden-owner matrix for D2, D5, D6, D7, D9, D13, Local
  Feedback, and Transformation Transaction;
- current-to-target lifecycle mapping from current source states
  `candidate`, `registered-advisory`, and `registered-enforced` into the
  complete D8 governance states;
- closed state model for lifecycle admission, registration refusal, baseline
  authority consumption, diagnostic identity consumption, hook-scope approval,
  apply-safety disposition, retirement, and downstream projections;
- Pattern Governance public-surface inventory and concrete D0 row placeholders;
- implementation write set and protected paths;
- design-time validation matrix and later implementation validation matrix;
- exact refactor sequence that prevents file presence, Grit markdown, baseline
  existence, generator options, or registry row presence from becoming
  admission authority.

Current code shows why this is required. The generator can write candidate
manifests and registered outputs; registration validates a manifest, checks a
baseline contract, writes an active Grit pattern, and appends a broad
`rules.json` entry. The manifest validator already rejects many bad states, but
the target OpenSpec packet still has to decide which of those are D8 target
states, which are compatibility facts, and which must be replaced by
D2/D5/D6/D9 projections.

### Spec Findings

`specs/habitat-harness/spec.md` contains one broad requirement with two
scenarios. That is insufficient for D8. It does not encode the Phase 2 contract
or provide enough falsifiable scenarios for implementation.

The spec must be expanded into separate requirement families for lifecycle
identity, candidate non-enforcement, manifest validation, registration
admission, baseline authority consumption, diagnostic catalog consumption,
hook-scope approval, apply-safety separation, refusal reasons, retirement,
consumer projections, D0 blockers, and prohibited inferences.

### Task Findings

`tasks.md` still leaves implementation agents to design the actual model. Tasks
such as "Define pattern lifecycle states and admission gates" and "Connect
governance to D2 facets and D5 baselines" are unresolved design work, not
execution steps.

The accepted D0-D7 pattern requires tasks to separate packet readiness,
implementation prerequisites, characterization, state-model introduction,
semantic migration slices, validation, downstream realignment, and closure.
D8 tasks must do the same.

### Workstream Findings

The D8 workstream files are generic and cannot support closure:

- `phase-record.md` records the branch as `codex/deep-habitat-openspec-remediation`,
  but this active worktree is on `codex/d8-pattern-governance-packet`.
- `phase-record.md` lists commands without expected status, actual status,
  bad case, cache/freshness stance, non-claims, or blocker disposition.
- `review-disposition-ledger.md` has no imported D8-specific P1/P2 findings,
  no repair evidence, and no final rereview evidence.
- `downstream-realignment-ledger.md` has generic pending rows and does not name
  the exact D2/D5/D6/D9/D13/D0 handoffs.
- `closure-checklist.md` is still unchecked and does not require D8-specific
  ontology, lifecycle state matrix, validation bad cases, wording audit, or
  final rereview lanes.

## Information Architecture Repair

### Reader And Task

The reader is a later implementation agent and reviewer with enough repo context
to execute Habitat changes, but not enough authority to invent D8 product
decisions. The task is not to understand the old Phase 2 packet; it is to
execute an already-reviewed Pattern Governance contract.

The repaired packet should therefore make `design.md` the decision center,
`spec.md` the normative scenario contract, `tasks.md` the implementation
sequence, and workstream files the control record. The implementation agent
should never need to infer target behavior from current source, old scratch,
or broad Phase 2 prose.

### Required Packet Shape

`proposal.md` should answer:

- why D8 exists in product terms;
- exactly which authority inputs control D8;
- what changes and what does not change;
- dependency state for D0, D2, D5, D6, D9, and D13;
- public-surface inventory and D0 blockers;
- D8 stop conditions and prohibited inferences;
- design-time validation and later implementation validation.

`design.md` should contain these D8-specific sections:

- Current Behavior Diagnosis
- Product Scenario And Acceptance Threshold
- Domain Boundary And Forbidden Owners
- Target Ontology
- Rejected Terms And Compatibility Facts
- Lifecycle State Matrix
- Consumed Upstream Contracts
- Published Downstream Projections
- Public Surface / D0 Compatibility Inventory
- Target State Model
- Bad-Case Matrix
- Implementation Write Set
- Protected Paths
- Refactor Sequence
- Validation Matrix
- Non-Claims

`spec.md` should contain multiple falsifiable requirement families rather than
one broad requirement. Every scenario should make one invalid state impossible
or rejected.

`tasks.md` should be ordered as:

1. Packet readiness and source blockers.
2. Current behavior characterization.
3. D0/D2/D5/D6 prerequisite citation.
4. D8 lifecycle state model.
5. Candidate generation migration.
6. Manifest validation and admission migration.
7. Registered diagnostic and hook-scoped registration migration.
8. Apply-safety handoff to D9.
9. Retirement/refusal state handling.
10. D13 candidate/generator handoff.
11. Validation and bad-case tests.
12. Downstream realignment and closure.

Workstream files should mirror the D0-D7 accepted control pattern: status,
first investigation inputs, imported findings, repair evidence, final rereview
evidence, validation results, write set, non-claims, and closure checklist.

## Required Spec Requirements

The D8 spec must include at least these requirement families.

### Requirement: Pattern Governance Owns Lifecycle Admission

D8 SHALL be the single authority for governed pattern lifecycle admission.

Required scenarios:

- Candidate draft is created and remains non-enforcing.
- Manifest-invalid candidate is rejected before registration.
- Registered diagnostic pattern is admitted only with accepted manifest,
  diagnostic identity, fixtures, false-positive model, current-tree scan result,
  and baseline authority projection.
- Registered hook-scoped pattern is admitted only after an explicit hook-scope
  decision and matching rule registry reference.
- Registered apply-approved pattern is admitted only through an explicit
  apply-safety disposition and D9 handoff.
- Refused pattern records a stable refusal reason.
- Retired pattern cannot be selected as active enforcement without a new
  admission decision.

### Requirement: Candidate Artifacts Are Never Active Authority

D8 SHALL prevent candidate files, candidate manifests, and generator options
from acting as active rule, baseline, hook, or apply authority.

Required bad cases:

- Candidate manifest has `registration.accepted: true`.
- Candidate manifest is stored under registered manifest path.
- Candidate Grit markdown exists with Habitat tags but no accepted manifest.
- Candidate generator output collides with active Grit pattern, baseline, or
  rule registry row.
- Candidate has a baseline file or hook scope and is still treated as candidate
  success.

### Requirement: Manifest Validation Is Necessary But Not Sufficient

D8 SHALL define manifest validation as one admission input, not complete
Pattern Governance acceptance.

Required scenarios:

- Missing manifest refuses registered promotion.
- Malformed manifest refuses registered promotion.
- Placeholder authority or proof fields refuse registered promotion.
- Grit frontmatter/prose refuses as authority.
- Nx generator options refuse as authority.
- Registered manifest outside canonical registered path refuses.
- Orphan manifest without matching D2 governance reference refuses.
- Manifest/rule reference mismatch refuses.
- Manifest validation success still waits for D5/D6/D9/D13-specific gates where
  applicable.

### Requirement: D2 Governance Facts Are Consumed, Not Recomputed

D8 SHALL consume D2 governance, baseline, and Grit projections rather than whole
registry rows or optional field inference.

Required scenarios:

- D8 consumes `ruleGovernanceFacts` for Pattern Authority references.
- D8 consumes `ruleGritFacts` or D6 diagnostic identity projection for Grit
  diagnostic relation.
- D8 consumes `ruleBaselineFacts` and D5 `BaselineAuthorityProjection` for
  baseline relation.
- D8 refuses source implementation while those projections are absent where
  touched.
- Whole `HarnessRule`, prose `scope`, `lane`, `gritPattern`, `manifestPath`, or
  file presence cannot become D8 target authority after projections exist.

### Requirement: D5 Baseline Authority Is Consumed As Projection

D8 SHALL use D5 baseline authority results without redefining baseline truth.

Required scenarios:

- Explicit empty baseline allows eligible registration only through accepted D5
  projection.
- Explicit debt baseline records accepted debt without erasing D8 admission
  requirements.
- External exception projection remains D5-owned and must not become Pattern
  Governance proof by prose.
- Baseline refused by D5 refuses D8 admission.
- Baseline file presence alone cannot admit a registered pattern.
- Rule-introduction manifest mismatch refuses D8 admission.

### Requirement: D6 Diagnostic Catalog Is Consumed Without Admission Leakage

D8 SHALL consume diagnostic identity and diagnostic consumer projection from D6
without absorbing diagnostic acquisition.

Required scenarios:

- Registered diagnostic pattern consumes accepted diagnostic identity.
- Missing, unexpected, malformed, or projection-missed diagnostic identity
  refuses admission.
- Native Grit command success does not imply D8 admission.
- Injected probe or fixture success does not imply hook scope or apply safety.
- D6 diagnostic failures remain diagnostic failures and do not become D8
  lifecycle states except through explicit refusal projection.

### Requirement: Hook Scope Is An Explicit Governance Decision

D8 SHALL make hook scope a closed decision, not a property inferred from rule
lane, manifest prose, or generated output.

Required scenarios:

- Hook decision `none` admits a non-hook registered pattern when all other gates
  pass.
- Hook decision `pre-commit` requires registered enforced lifecycle and matching
  rule registry hook reference.
- Manifest says pre-commit but D2/D11-facing rule reference omits hook scope:
  refused.
- Rule reference says pre-commit but manifest says none: refused.
- Advisory pattern with pre-commit hook scope: refused.

### Requirement: Apply Approval Is Separate From Diagnostic Registration

D8 SHALL separate diagnostic registration from apply approval and SHALL NOT
treat registered diagnostic state as apply-safe.

Required scenarios:

- `grit-check` registered pattern with `applySafety.kind: apply` is refused or
  handed to D9 as a separate decision, according to the accepted D8/D9 contract.
- `grit-apply` pattern without apply safety proof fields is refused.
- Apply-approved pattern requires D9-owned dry-run/no-write/applied-diff/rollback
  and type/test proof references.
- Non-apply pattern records `not-apply` rationale and cannot be consumed by D9
  as apply-ready.
- D9 apply transaction failure cannot be flattened into D8 diagnostic refusal.

### Requirement: Refusal Reasons Are Stable And Exhaustive

D8 SHALL represent refusal as first-class lifecycle output.

Minimum refusal reasons:

- missing manifest;
- malformed manifest;
- placeholder manifest;
- contradicted manifest;
- orphan manifest;
- manifest-invalid candidate;
- Grit metadata only;
- Nx options only;
- missing D2 governance facts;
- missing D5 baseline authority projection;
- baseline contract rejected;
- missing D6 diagnostic identity;
- diagnostic projection rejected;
- missing fixture strategy;
- missing false-positive model;
- current-tree scan blocks registration;
- hook-scope mismatch;
- apply-safety absent or contradicted;
- active artifact collision;
- retired pattern referenced as active.

### Requirement: Downstream Consumers Receive Narrow Projections

D8 SHALL publish consumer-specific projections rather than expose the full
Pattern Governance state model.

Required projections:

- D9 apply governance projection: apply-approved, not-apply, or refused with
  stable reason and D9-owned next action.
- D13 candidate/generator projection: candidate generated, candidate refused,
  registration prerequisites missing, or registration handoff required.
- D7/D11 enforcement/hook-facing projection where hook-scoped enforcement needs
  a lifecycle/hook decision without owning D8 admission.
- D2 registry write projection for canonical governance facts.

### Requirement: Public Surface Changes Wait For D0 Rows

D8 implementation SHALL stop before changing public or durable surfaces without
concrete D0 rows.

Required surfaces:

- generator schema/options and lifecycle values;
- generated candidate manifest JSON;
- registered Pattern Authority manifest JSON;
- active Grit pattern output;
- `rules.json` write shape;
- package exports in `src/rules/pattern-authority/manifest.ts`;
- Pattern Authority validation issue reasons;
- command output/errors from generator registration;
- docs/examples/guidance;
- tests that encode public compatibility behavior.

## Required Tasks/Validation

### Required Task Repairs

The repaired D8 `tasks.md` must convert design gaps into executable steps:

- import this investigation and all fresh D8-specific lane findings into the
  review ledger;
- rewrite proposal/design/spec/tasks/control records before source
  implementation;
- record D8 write set and protected paths;
- block source edits until concrete D0 rows, live D2 governance/baseline/Grit
  projections, live D5 baseline projection, live D6 diagnostic identity or
  consumer projection, and accepted D9/D13 handoff contracts exist where
  touched;
- characterize current source behavior for candidate generation, registered
  promotion, manifest validation, baseline contract validation, hook scope, and
  rule registry writes;
- introduce the D8 closed lifecycle state model;
- migrate current source state names only after D0 compatibility handling is
  cited;
- delete or reject file-presence admission paths;
- add tests for each bad-case family above;
- run final rereview lanes before packet index movement.

### Required Design-Time Validation Gates

These gates are required before D8 can move from BLOCKING to accepted for
design/specification:

| Gate | Command Or Check | Expected Result | Non-Claim |
| --- | --- | --- | --- |
| D8-OPEN | `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | exit 0 after repaired packet | Does not prove source implementation. |
| D8-ALL-OPEN | `bun run openspec:validate` | exit 0 for full OpenSpec corpus | Does not prove Habitat behavior. |
| D8-DIFF | `git diff --check` | exit 0 | Diff hygiene only. |
| D8-WORDING | complete-standard wording audit over `$D8_CHANGE/**`, D8 active packet/control files, and D8 final scratch | no active reduced-standard guidance | Historical reduced-standard wording is allowed only as superseded finding text. |
| D8-FINAL-REREVIEW | fresh final domain/ontology, TypeScript/validation, OpenSpec/information, code/topology, and cross-domino rereview | no unresolved P1/P2 | Design/specification acceptance only. |

### Required Later Implementation Validation Gates

Later implementation gates must include exact expected status, actual status,
cache/freshness stance, non-claims, and blocker disposition. Minimum gates:

- `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts`
  with bad cases for candidate non-registration, registered promotion without
  manifest, placeholder manifest, baseline missing, hook mismatch, active
  artifact collision, and candidate baseline collision.
- `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts`
  with bad cases for missing/malformed/placeholder/contradicted/orphan
  manifests, Grit-only authority, Nx-options-only authority, hook mismatch,
  apply-safety contradiction, and retired/manifest-invalid lifecycle.
- Focused D2/D5/D6 integration tests proving D8 consumes projections and refuses
  when projections are absent, malformed, or contradicted.
- Focused D9 handoff tests proving diagnostic registration does not imply
  apply-safe state.
- Focused D13 handoff tests proving generated candidate output remains
  non-enforcing and registration prerequisites are explicit.
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json` only as
  a D2/D4 compatibility observation, not as D8 admission proof.
- A current-tree command proof only after D0/D1/D7 decide the relevant command
  output families; otherwise command proof remains blocked and non-authoritative.
- `git status --short --branch` recorded only for dirty-state classification;
  clean status is not proof of Pattern Governance correctness.

### Complete-Standard Wording Audit

D8 needs a complete-standard wording audit across:

- `openspec/changes/deep-habitat-d8-pattern-governance/**`;
- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
  as source input;
- D8 investigation scratch;
- D8 final review/rereview scratch records;
- packet index row after any status movement.

Audit terms include:

- reduced-scope implementation language: `starter packet`, `draft`, `pending`,
  `optional`, `only if needed`, `fallback`, `shim`, `temporary`, `dual path`,
  `support both`, `silent skip`, `compatibility until later`,
  `generated-output hand edit`;
- authority leaks: `file presence implies`, `Grit prose proves`,
  `baseline file proves`, `generator options prove`, `registered diagnostic is
  apply-safe`, `hook scoped by lane`;
- closure overclaims: `implementation-ready`, `accepted`, `complete`, `green`,
  or `validated` without final rereview and recorded gates.

Allowed hits must be explicitly marked as historical source wording, negative
finding text, forbidden-language lists, or superseded prior state. Active packet
language must use complete-standard wording.

## Control Record Repairs

### Phase Record

Repair `workstream/phase-record.md` to include:

- Status: BLOCKING until repaired packet and final rereviews record no
  unresolved P1/P2.
- Active worktree and branch using remediation variables or the correct current
  branch, not the stale branch currently recorded.
- Objective: specify complete Pattern Governance lifecycle/admission before
  source implementation.
- Current gate: design/specification repair gate open.
- First investigation inputs table including this file and all other D8-specific
  scratch records.
- Dependency state table for D0, D2, D5, D6, D9, D13, and any D7/D11 hook-facing
  consumer.
- Source implementation blockers.
- Design-time validation matrix with expected/result/non-claim columns.
- Later implementation validation matrix with bad cases.
- Write set and protected paths.
- Non-claims.

### Review Disposition Ledger

Repair `workstream/review-disposition-ledger.md` to:

- import each accepted P1/P2 finding from this investigation and sibling D8
  investigations;
- mark global constraints as applied but not acceptance evidence;
- record exact repair evidence by artifact and section;
- record fresh final rereview evidence after repairs;
- state that D8 remains BLOCKING until all accepted P1/P2 findings are repaired
  and final rereviews find no unresolved P1/P2.

### Downstream Realignment Ledger

Repair `workstream/downstream-realignment-ledger.md` with separate rows for:

- D0 public-surface matrix and concrete D0 rows;
- D2 `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`;
- D5 `BaselineAuthorityProjection`;
- D6 diagnostic identity/consumer projection;
- D7/D11 hook-scoped enforcement/local-feedback consumers, if touched;
- D9 apply transaction handoff;
- D13 candidate/generator refusal handoff;
- packet index status;
- docs/examples;
- tests and fixtures;
- generated outputs as regenerated-only, never hand-edited.

Each row needs disposition, required action, owner packet, source blocker, and
non-claim.

### Closure Checklist

Repair `workstream/closure-checklist.md` so design/specification acceptance
requires:

- proposal cites controlling authority, source packet, and exact dependency
  states;
- design defines current diagnosis, ontology, lifecycle state matrix, consumed
  contracts, published projections, D0 inventory, write set, protected paths,
  validation matrix, and non-claims;
- spec contains all required normative requirement families and bad-case
  scenarios;
- tasks are executable implementation slices, not design prompts;
- review ledger has no accepted unresolved P1/P2 findings;
- downstream ledger has concrete D8 handoffs;
- complete-standard wording audit passes;
- strict D8 OpenSpec validation passes;
- full OpenSpec validation passes;
- `git diff --check` passes;
- final rereview lanes read repaired disk state and record no unresolved P1/P2;
- packet index is updated only after acceptance evidence exists, and only to
  accepted for design/specification, not implementation-complete.

## P1/P2 Blockers

| ID | Severity | Finding | Required Repair |
| --- | --- | --- | --- |
| D8-INFO-001 | P1 | Current D8 artifacts do not define the complete Pattern Governance lifecycle required by the Phase 2 packet. | Add complete lifecycle state matrix to proposal/design/spec/tasks: candidate draft, manifest-invalid candidate, registered diagnostic, registered hook-scoped, registered apply-approved, refused, and retired. |
| D8-INFO-002 | P1 | `spec.md` has one broad requirement and two scenarios, leaving most D8 authority decisions to implementation. | Expand spec into the requirement families listed in this investigation, with falsifiable bad-case scenarios. |
| D8-INFO-003 | P1 | `design.md` lacks D8 target ontology, current diagnosis, closed state model, consumed-contract matrix, published projections, D0 inventory, and refactor sequence. | Rewrite design as the D8 decision center before implementation. |
| D8-INFO-004 | P1 | Current tasks are unresolved design prompts. | Rewrite tasks into ordered packet readiness, prerequisite, characterization, semantic migration, validation, downstream realignment, and closure steps. |
| D8-INFO-005 | P1 | D8 does not block source implementation behind concrete D0 rows for generator, manifest, registry, export, command, docs, and test surfaces. | Add D0 public-surface inventory and source stop conditions across proposal/design/spec/tasks/phase record. |
| D8-INFO-006 | P1 | D8 does not state live D2/D5/D6 projection prerequisites precisely enough to prevent whole-row or file-presence admission. | Add source blockers for D2 governance/Grit/baseline projections, D5 baseline authority projection, and D6 diagnostic identity/projection. |
| D8-INFO-007 | P1 | D8 does not separate diagnostic registration, hook-scope approval, and apply approval into distinct target states and handoffs. | Add hook-scope and apply-safety requirements plus D9 handoff and D13 candidate/generator handoff. |
| D8-INFO-008 | P1 | Workstream ledgers cannot support acceptance or closure. | Repair phase record, review ledger, downstream ledger, and closure checklist to D0-D7 control standard. |
| D8-INFO-009 | P1 | D8 has no final rereview evidence and global constraints are not acceptance evidence. | Keep status BLOCKING until fresh final D8 rereviews record no unresolved P1/P2 against repaired disk state. |
| D8-TEST-001 | P2 | Validation gates are command names without expected status, actual status, oracle, bad case, cache stance, non-claim, or blocker disposition. | Add design-time and later implementation validation matrices with exact oracles and bad cases. |
| D8-TEST-002 | P2 | The current validation set does not falsify the central bad case: candidate output without accepted manifest, fixture proof, baseline authority, hook-scope decision, or apply-safety decision becomes registered or active. | Add candidate-not-registered bad-case tests and registration refusal tests. |
| D8-TEST-003 | P2 | `bun run habitat classify tools/habitat-harness/src/rules/rules.json` is listed as a D8 gate even though it does not prove Pattern Governance admission. | Reclassify this as a compatibility observation with non-claims, or replace it with D8-specific projection/admission tests. |
| D8-CTRL-001 | P2 | `phase-record.md` records a stale branch value. | Replace with `$ACTIVE_REMEDIATION_BRANCH` or the correct active branch. |
| D8-CTRL-002 | P2 | Downstream realignment is generic and does not name the D9/D13 consumer contracts D8 enables. | Add concrete downstream rows for D9 apply governance and D13 candidate/generator refusal. |
| D8-CTRL-003 | P2 | D8 closure checklist can pass without complete-standard wording audit or final rereview evidence. | Add wording audit and final rereview gates before any packet-index status movement. |

## Acceptance Rule

D8 remains BLOCKING. It can move only to accepted for design/specification after
the packet is rewritten to the complete standard, all accepted P1/P2 findings
are repaired, strict and full OpenSpec validation pass, diff hygiene passes,
the D8 complete-standard wording audit passes, and fresh final rereview lanes
record no unresolved P1/P2 against the repaired disk state.

Even after that movement, D8 remains not implementation-complete. Source
implementation must remain blocked behind concrete D0 rows and live D2/D5/D6
projection facts wherever those surfaces are touched.
