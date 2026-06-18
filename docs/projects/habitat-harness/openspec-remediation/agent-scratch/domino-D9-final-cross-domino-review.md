# D9 Final Cross-Domino/Product Rereview

## Verdict

Accepted for design/specification lane.

I found no unresolved P1/P2 cross-domino or product-scenario blockers in the
current repaired D9 Transformation Transaction packet. D9 now gives a complete
product contract for safe structural apply transactions as a design/spec packet:
it owns the transaction lifecycle, consumes accepted D0-D8 design inputs without
overclaiming implementation readiness, keeps D10/G-HOST source blockers explicit,
publishes D11/D13 projections, avoids D15 by default, and prevents downstream
owners from parsing legacy `GritApply*` proof/result blobs as authority.

This verdict is for current disk state only. Previous final agents are not used
as acceptance evidence. The first-wave cross-domino/product review was used only
as the required repair-input artifact named in the prompt.

## P1/P2 Findings

None.

## Review Basis

Read current disk state under
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
on branch `codex/d9-transformation-transaction-packet`, including:

- source packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- packet index:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- first-wave cross-domino/product review:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D9-cross-domino-investigation.md`
- repaired D9 OpenSpec packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/proposal.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/design.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/tasks.md`
  and D9 workstream ledgers/checklists.

Mandatory review anchors read before review: Domain Design, Information Design,
Solution Design, System Design, Team Design, TypeScript Design, and the Civ7
Open Spec Workstream source map.

## Lifecycle Circularity Challenge

The repaired model solves the important circularity around intent versus live
write attempt.

The source packet asked for typed request-mode constructors but the first-wave
review found that implementation could still choose between optional mode flags,
preapproved write sets, or current hard-coded apply constants. The repaired
`design.md` now separates:

- `DryRunIntent`: command/user intent plus D8 admission and worktree
  observation.
- `LiveWriteIntent`: command/user intent plus D8 admission and worktree
  observation.
- `LiveWriteAttempt`: a D9-produced internal state requiring clean worktree,
  approved write set, rollback policy, and formatter/gate handoff policy.

The normative spec reinforces that command parsing may create only dry-run or
live-write intent, and that D9 may construct `LiveWriteAttempt` only after
dry-run/copy/path planning approves the write set. That keeps D9 responsible
for deriving approved write sets before live attempts and prevents D8 admission,
Grit file presence, or command flags from becoming direct live-write authority.

## Product Scenario Completeness

D9 now covers the required safe structural apply transaction scenario end to
end:

- apply request mode construction;
- missing/refused D8 apply admission;
- diagnostic-only patterns not authorizing writes;
- dry-run zero-match, approved inventory, ambiguous output, parse failure,
  command failure/interruption, and dry-run/copy mismatch;
- dirty live refusal and dirty dry-run allowance;
- outside-root, protected/generated-zone, host-policy, create/delete, and
  unexpected-path refusals;
- isolated-copy check as observation, not authority;
- live write success and post-write path verification;
- formatter handoff success/failure/path drift;
- declared gate success/failure and prior-success non-claim;
- rollback success, rollback failure, rollback probe distinction, residual
  dirty paths, and recovery instructions;
- docs/source apply lanes kept distinct;
- public `habitat fix` compatibility gated by D0, with `--json` explicitly not
  a current D9 surface unless D0 authorizes it;
- downstream projections for D11 and D13.

This is enough for a later implementation agent to avoid inventing transaction
semantics while still leaving source work blocked where live dependency facts do
not exist.

## Sequencing And Dependency Compatibility

D9 consumes accepted D0-D8 design inputs correctly:

- D0 remains the required public-surface compatibility authority for `habitat
  fix`, exports, DTOs, command output, docs examples, and any JSON addition.
- D1 remains the receipt/record/non-claim boundary. Legacy proof/result exports
  may only be compatibility projections from `ApplyTransactionRecord`.
- D6 diagnostics are context only and cannot admit writes.
- D7 check/current-tree results do not approve writes.
- D8 is the only apply-admission source D9 consumes, via
  `ApplyAdmissionProjection`.

D10 and G-HOST remain explicit implementation blockers where touched. D9 may
design against their projections, but it refuses or blocks source
implementation without live protected/generated-zone decisions and host-gate
declarations. This is the right cross-domino shape: D9 owns transaction state,
not protected-zone policy or host policy.

D9 stays one cohesive packet. Splitting it would move path approval, rollback,
formatter, and gate failure semantics into neighboring owners and recreate the
ambiguity D9 is meant to remove.

## Downstream Handoff Acceptance

D11 receives local-feedback-safe states: unavailable/refused/dry-run/applied/
rolled-back/rollback-failed/recovery-required, plus recovery instructions and
non-claims. It is not forced to recompute apply safety, path approval, rollback
status, formatter success, or host gate meaning.

D13 receives transaction prerequisites for future apply-capable candidates, but
candidate generation remains separate from D8 apply admission and D9 write
safety.

D15 is not triggered. The repaired state model represents the local command,
vendor, rollback, and handoff states inside D9-owned transaction records. D15
remains a trigger only if a future concrete contradiction cannot be represented
locally.

## Validation

- `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`
  passed: `Change 'deep-habitat-d9-transformation-transaction' is valid`.
- `bun run openspec:validate` passed: 249 items passed, 0 failed.
- `git diff --check` passed after writing this scratch file.

## Residual Non-Blocking Risks

- D9 is not implementation-complete and should not be marked source-ready.
- Public-surface source changes remain blocked until concrete D0 rows exist.
- Source implementation where apply admission is consumed remains blocked until
  live D8 projections exist.
- Protected/generated and host-specific source behavior remains blocked until
  D10/G-HOST live projections exist.
- Current code still contains legacy `GritApply*` state shapes and MapGen gate
  logic; this review accepts the repaired design/spec contract, not the source
  state.
