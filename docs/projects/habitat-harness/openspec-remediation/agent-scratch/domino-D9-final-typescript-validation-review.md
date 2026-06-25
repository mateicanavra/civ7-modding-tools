# D9 Final TypeScript/Validation Review

## Verdict

Accepted for the design/specification lane.

No unresolved P1/P2 TypeScript state-space or validation findings remain against the current disk state of `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction`.

This is not source acceptance. The current implementation evidence in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit-apply.ts` still has the legacy flags, nullable proof DTO, boolean result, inline host validation, and broad orchestration module that D9 is meant to replace. The packet now treats that source as evidence, not target authority, and gives implementation agents a sufficiently exact replacement model and falsification suite.

## Findings

No P1/P2 findings.

Minor non-blocking observation: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md` says live-write intent carries "user intent and D8 apply admission only", while the design type also includes `worktree: WorktreeObservation`. Read in context, the scenario is clearly forbidding pre-D9 approved write sets, not forbidding worktree observation, so this is not blocking. If touched later, changing "only" to "without an approved write set" would remove the ambiguity.

## Review Evidence

Required skill anchoring was completed from the current local skill corpus before review:

- Domain Design: `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- Information Design: `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- Solution Design: `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- Testing Design: `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- TypeScript Design and relevant references under `/Users/mateicanavra/.agents/skills/typescript/`, including `where-defaults-hide.md`, `refactoring-patterns.md`, `design-patterns.md`, `philosophy.md`, `axes.md`, `integration-combos.md`, `module-organization.md`, `sdk-design.md`, `ecosystem.md`, and `real-world-examples.md`

The duplicate TypeScript skill corpus under `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/dev/1.0.0/skills/typescript` was checked by byte comparison for the relevant files and matched the primary corpus.

Disk evidence reviewed:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D9-typescript-state-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit-apply.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/grit-apply.test.ts`

## TypeScript State-Space Review

The repaired packet now specifies the exact collapse needed for D9 implementation:

- Request construction is explicit: `DryRunIntent` and `LiveWriteIntent` are command-facing intent variants, while `LiveWriteAttempt` is D9-produced after dry-run/copy/path planning. `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/design.md` states that no command parser may construct `LiveWriteAttempt` directly, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md` makes the same distinction normative.
- The prior circularity is removed. A live-write request no longer appears to require an already approved write set; it carries intent plus D8 admission, and D9 later constructs `LiveWriteAttempt` only after producing `ApprovedWriteSet`.
- Terminal and intermediate states are closed discriminated unions: admission, dry-run inventory, write-set approval, live write, formatter handoff, gate handoff, rollback, recovery, refusal, non-claim, and terminal outcome.
- Legacy `GritApplyTransactionOptions`, `GritApplyTransactionProof`, `GritApplyTransactionResult`, `ok: boolean`, nullable command fields, and `proof` language are classified as compatibility surfaces rather than target model.
- Branded identifiers are required for authority-bearing strings: pattern ids, Grit pattern paths, repo-relative paths, approved write paths, write-set ids, command ids, SHA-256 digests, D0 surface ids, D1 non-claim ids, D8 admission ids, and D10 decision ids.
- Non-empty collections are required where emptiness would make a state false-green: approved writes, blocked writes, rollback paths, recovery instructions, gate command records, and D0 citations.
- Exhaustive `never` handling is required for command rendering and legacy projection.
- The packet rejects broad proof DTO authority and requires `ApplyTransactionRecord` / `TransactionOutcome` as the target state source.

## Boundary And Ownership Review

The packet now protects D9 from owning adjacent domains:

- D8 owns apply admission and lifecycle; D9 consumes `ApplyAdmissionProjection`.
- D10/G-HOST own protected/generated and host-specific policy; D9 consumes path/gate projections.
- Grit owns native pattern semantics and output behavior; D9 records and classifies observations.
- Biome, Git, and Nx are modeled as tool/vendor owners whose command outcomes are recorded without turning them into product proof.
- Current MapGen public-ops validation in generic transaction code is correctly treated as host-specific current evidence that must become a G-HOST/D10-declared gate or remain source-blocked.

This satisfies the review bar for "no host-specific logic in generic D9".

## Validation Review

The repaired validation surface is adversarial enough for acceptance in the design/spec lane. `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/tasks.md` requires type-level/compile-time rejection of false states and runtime tests for dirty live refusal, dirty dry-run, zero-match dry-run, ambiguous dry-run, unapproved inventory, outside-root refusal, create/delete refusal, protected-zone refusal, missing host gate, unexpected live path, formatter failure, gate failure, rollback success, and rollback failure.

The validation requirements are not just green-path command runs. They specifically target false-green states from the current implementation evidence:

- `ok: true` plus failure state
- dry-run carrying rollback-after-apply semantics
- live write without D8 admission
- live write without D10/G-HOST decisions where touched
- rollback command outside rollback state
- formatter/gate success inside failed outcomes
- legacy proof projection reporting success from a refusal/failure target

The implementation tasks are executable slices, not design deferrals. The sequence starts with state model construction and compile-time rejection tests, then request/admission, write-set approval, live write/handoffs/rollback, public compatibility projection, and focused validation. Source implementation remains explicitly blocked where D0/D8/D10/G-HOST live inputs are absent, which is a correct dependency gate rather than an underspecified task.

## Commands Run

- `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`
  - Result: passed. Output included `Change 'deep-habitat-d9-transformation-transaction' is valid`.
- `bun run openspec:validate`
  - Result: passed. Output reported `Totals: 249 passed, 0 failed (249 items)`.
- `git diff --check`
  - Result: passed with no output.

Skills used: domain-design, information-design, solution-design, testing-design, typescript.
