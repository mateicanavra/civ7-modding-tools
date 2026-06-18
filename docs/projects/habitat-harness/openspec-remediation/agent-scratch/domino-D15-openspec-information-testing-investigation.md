# D15 OpenSpec / Information / Testing Review

## Verdict

D15 is close to a complete dormant trigger packet: the proposal, design, spec, phase record, closure checklist, and downstream ledger consistently reject default substrate migration and preserve the `dormant` / `trigger-requested` / `trigger-accepted` state model.

I found no P1 blockers in this review lane. P2 blockers remain. The packet should not be accepted for design/specification until the trigger-consumer set, wording-control audit scope, and implementation-readiness wording are repaired and rereviewed on the same disk state.

Validation run during this review:

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`: passed.
- `bun run openspec:validate`: passed, 249 items.
- `git diff --check`: passed.

## P1 Findings

None.

## P2 Findings

### P2: Trigger-consumer authority is inconsistent for G-HOST

The D15 source packet and packet index define the active trigger set as D6/D7/D9/D11, while the OpenSpec packet expands the set to include G-HOST. This leaves a future executor unable to know whether G-HOST may directly trigger D15 or must route command-observation insufficiency through G-HOST/D9/D10-local projections.

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:26` names consumers as primarily D6/D9 and optionally D7/D11, with no G-HOST row.
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:63` says to embed the D15 checklist in D6, D7, D9, or D11.
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md:35` says D15 requires D6, D7, D9, or D11 identifying impossible local states.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:31` and `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:42` include G-HOST.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:69` and `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:119` include G-HOST.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:30` includes G-HOST in the accepted-upstream sufficiency scenario.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/downstream-realignment-ledger.md:9` treats G-HOST as a dormant trigger consumer.

Required repair:

Pick one authority model and align every artifact. Either:

- Add G-HOST to the source packet and packet-index D15 trigger set with a clear reason why host-policy command/projection observations may directly trigger D15, or
- Remove G-HOST as a direct D15 trigger consumer from proposal/design/spec/tasks/downstream ledger and state that host-policy-related command observation insufficiency must be resolved inside G-HOST or through accepted D9/D10 projections unless a later authority packet explicitly adds G-HOST to D15.

### P2: The wording/control audit task misses the actual D15 review-file naming convention

The pre-repair task checklist used an outdated D15 scratch glob, while the context router and other D15 closure artifacts use `$AGENT_SCRATCH/domino-D15-*.md`. That mismatch meant the required wording/control audit could pass while skipping the actual first-wave and final D15 scratch reviews.

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/context.md:318` through `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/context.md:327` define D15 scratch outputs with the `domino-D15-` prefix.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:32` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:34` use `$AGENT_SCRATCH/domino-D15-*.md`.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:21` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:23` use `$AGENT_SCRATCH/domino-D15-*.md`.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/tasks.md:31` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/tasks.md:33` used the outdated D15 scratch glob before repair.

Required repair:

Change the task audit scope to `$AGENT_SCRATCH/domino-D15-*.md`, or list the `$D15_*_REVIEW` variables from `context.md` directly so the audit cannot miss a required D15 review artifact.

### P2: Implementation-readiness wording does not explicitly require `trigger-accepted`

The design correctly says `dormant` authorizes no source work and that `trigger-accepted` requires a separate accepted OpenSpec change. But the `Implementation Readiness` section starts with "Before implementation starts" and lists prerequisites without explicitly naming `trigger-accepted` as the first prerequisite. The proposal also says an expected Habitat implementation write set is named in `design.md`, but no concrete write set exists while D15 is dormant.

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:53` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:59` define `dormant`, `trigger-requested`, and `trigger-accepted`.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:88` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:96` list implementation readiness without explicitly requiring `trigger-accepted`.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:52` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:55` claim an expected Habitat implementation write set is named in `design.md` while also saying this packet authorizes no code.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:36` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:44` provide the clearer conditional wording that should be mirrored in the design/proposal.

Required repair:

Rewrite the design section as "Implementation Readiness After `trigger-accepted`" and make `trigger-accepted` the first prerequisite. State that no Habitat source write set exists while D15 is `dormant` or merely `trigger-requested`; a later accepted owner packet must name the concrete write set and protected paths. Update the proposal affected-owner bullet to match that wording instead of claiming the dormant design names an expected implementation write set.

## P3 Findings

### P3: Source-packet injected bad cases should be visibly conditional on a triggered implementation

The OpenSpec phase record and design now separate design-time validation from later implementation gates. The source packet mostly does too, but the "Injected bad case" row reads as an imperative test obligation and should be explicitly tied to `trigger-accepted` implementation validation.

Evidence:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:101` through `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:107` label later implementation validation if triggered.
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:152` through `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:153` say to include missing-binary, nonzero-command, and oversized-output cases without restating the trigger condition.
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:36` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:44` correctly scopes command observation fixtures to a later accepted `trigger-accepted` state.

Required repair:

Prefix the source-packet injected bad-case row with "If a later accepted packet changes D15 to `trigger-accepted`..." or move it under the later implementation validation list so design-time closure cannot be read as requiring implementation fixtures.

## Required Repairs

1. Align G-HOST trigger-consumer authority across the source packet, packet index, proposal, design, spec, tasks, review ledger, and downstream ledger.
2. Fix the wording/control audit scope so it includes the actual `domino-D15-*.md` scratch review files or the explicit `$D15_*_REVIEW` variables.
3. Make implementation readiness explicitly conditional on a later accepted `trigger-accepted` state, and remove the dormant-packet implication that `design.md` already names an implementation write set.
4. Clarify the source-packet injected bad-case row as later implementation-only.
5. After repair, rerun strict D15 OpenSpec validation, full OpenSpec validation, `git diff --check`, and the wording/control audit over the corrected scope.

## Acceptance Blockers

- P2 trigger-consumer authority inconsistency for G-HOST.
- P2 wording/control audit scope mismatch.
- P2 implementation-readiness / write-set conditionality gap.
- Historical first-wave workstream blocker, resolved by the final closure pass:
  the review-disposition ledger previously kept per-domino adversarial review
  open, and the final D15 review-disposition ledger now records all five final
  rereview lanes accepted for design/specification with no unresolved P1/P2.
- Historical first-wave closure blockers, resolved by the final closure pass:
  the closure checklist previously had open first-wave repair, final rereview,
  validation, diff hygiene, wording/control audit, and packet-index items, and
  the final D15 closure checklist now records those design/specification gates
  closed while preserving source implementation blockers.

## What Is Sound

- The core OpenSpec requirement correctly states that shared command-observation substrate adoption is packet-local and not a default migration: `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:5` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:8`.
- The trigger-request contract has the right information shape for an executor: command family, contradiction, rejected local alternative, required fields, public impact, write/protected set, validation gates, and rollback plan: `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:71` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:86`.
- The later implementation gates in the phase record are correctly conditional on `trigger-accepted`: `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:36` through `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:44`.
