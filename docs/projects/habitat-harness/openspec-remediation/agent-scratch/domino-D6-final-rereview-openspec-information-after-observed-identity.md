# D6 Final Rereview: OpenSpec / Information After Observed Identity Repair

## Scope

Fresh final rereview of the latest D6 OpenSpec artifact shape and information
design after the observed-identity repair. This review is design/specification
only. It is not implementation acceptance, does not approve source edits, and
preserves the D0/D1/D2 source blockers.

## Sources Read

- `git status --short --branch` in
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
  confirmed branch `codex/d6-diagnostic-pattern-packet-repair`.
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`

## Verdict

Accepted for design/specification only in the OpenSpec/information lane. No
unresolved P1/P2 remain for this lane against the latest disk state reviewed
here.

This is not implementation acceptance. Source remains blocked behind concrete
D0 compatibility rows, D1 output-family/compatibility decisions where touched,
and live D2 `ruleGritFacts`, as stated in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:75`,
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:275`,
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:30`,
and `docs/projects/habitat-harness/openspec-remediation/packet-index.md:25`.

## Assessment

### Observed Identity Evidence

The observed-identity repair is acceptable. The design now separates accepted
catalog identity from raw native evidence: `DiagnosticIdentity` is the selected
catalog identity, while `ObservedDiagnosticIdentity` carries `local_name`,
parsed `check_id`, native rule evidence, and an explicit mismatch state
(`design.md:76`, `design.md:133`, `design.md:145`). Resolution rules require
observed evidence to match the selected `DiagnosticIdentity`; disagreement
between `local_name` and parsed `check_id` produces a mismatch and must not
project as a finding (`design.md:89`, `design.md:96`).

The parsed report and finding model keep observed evidence raw until projection
(`design.md:293`, `design.md:299`). Run outcomes preserve the difference by
using `unexpected-diagnostic-identity` with an `ObservedDiagnosticIdentity`
payload (`design.md:336`, `design.md:342`), and prose explicitly says
projection converts observed evidence to accepted identity only after a match
(`design.md:348`). The spec mirrors that information contract with observed
evidence language and a native identity disagreement scenario that emits
`unexpected-diagnostic-identity` and forbids coercion into selected
`DiagnosticIdentity` (`spec.md:143`, `spec.md:177`).

### Non-Empty Findings

The non-empty findings repair is acceptable. Native findings reports,
`DiagnosticRunOutcome.kind == "findings"`, and findings consumer projections now
use `NonEmptyReadonlyArray` (`design.md:293`, `design.md:297`, `design.md:336`,
`design.md:409`). Clean outcomes and clean consumer projections are separately
typed with `readonly []` (`design.md:337`, `design.md:401`), so empty findings
cannot be smuggled through a findings state.

The spec states the same invariant in scenario form: findings reports, run
outcomes, and consumer projections each carry at least one diagnostic finding
(`spec.md:156`), and D7 findings projections must not represent an empty
diagnostic set (`spec.md:249`). Tasks also preserve this as implementation work
instead of leaving it implicit (`tasks.md:46`, `tasks.md:51`).

### Control-Record Consistency

The control records are consistent with the repaired packet and with this
design/spec-only lane. Proposal and phase record state D6 is still a packet
review, not source implementation (`proposal.md:10`, `phase-record.md:24`).
The review ledger records prior P1/P2 findings as repaired or repaired pending
latest-disk rereview, including the observed-identity and non-empty findings
rows (`review-disposition-ledger.md:43`, `review-disposition-ledger.md:49`,
`review-disposition-ledger.md:50`). Its acceptance rule still requires fresh
final rereviews and explicitly says even accepted D6 is not
implementation-complete (`review-disposition-ledger.md:53`).

The closure checklist and packet index remain blocking until final rereview
updates occur (`closure-checklist.md:29`, `packet-index.md:25`). That is not a
contradiction; it is the correct control state before this scratch result is
incorporated by the workstream owner. Downstream realignment also preserves the
same non-claims and D0/D1/D2 source blockers (`downstream-realignment-ledger.md:11`,
`downstream-realignment-ledger.md:22`).

### Additional Shape Checks

The earlier command/acquisition/projection/probe repairs remain acceptable in the
latest disk:

- Closed command families are explicit in `NativeGritCommandFamily`, and the spec
  refuses unknown/bare string command families (`design.md:214`, `spec.md:82`).
- Parsed acquisition can carry only `CompletedDiagnosticCommandObservation`;
  `not-run`, `interrupted`, and `tool-unavailable` are failure causes, not parsed
  report states (`design.md:232`, `design.md:249`, `design.md:286`,
  `spec.md:111`).
- Probe success requires `cleanup: "restored"` and dirty/not-restored cleanup is
  represented only as `probe-cleanup-failed` (`design.md:357`, `design.md:374`,
  `spec.md:214`, `spec.md:237`).
- Consumer projections are discriminated variants rather than optional failure
  bags, with clean/findings/refused/adapter-failed and bounded remaining failure
  states (`design.md:396`, `design.md:441`).

## P1/P2 Blockers

None for this OpenSpec/information lane.

## P3 Follow-Ups

- Consider splitting the grouped consumer projection variant for
  `projection-missed`, `unexpected-diagnostic-identity`, and
  `cache-observation-missing` into three explicit variants or adding a short
  rationale for why downstream consumers receive only the bounded limitation at
  that projection layer (`design.md:432`). This is not a blocker because
  `DiagnosticRunOutcome` retains state-specific evidence and the consumer
  projection remains discriminated.
- Consider adding latest-disk rereview scratch variables for the post
  non-empty/observed-identity passes in `context.md` after the workstream owner
  incorporates final rereview outputs. This is navigational polish, not packet
  acceptance scope.

