# D6 Final Rereview: OpenSpec And Information Design

## Scope

Fresh final rereview of the repaired D6 disk state for OpenSpec packet shape,
information architecture, task clarity, review controls, validation split, packet
index state, and reduced-standard wording. This review did not inspect or change
source implementation.

Observed branch before review/write:
`codex/d6-diagnostic-pattern-packet-repair`.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`

Commands also read current OpenSpec change listing with
`bun run openspec -- list`.

## Verdict

Not accepted for design/specification in the OpenSpec/information-design lane.

The repaired packet is much stronger than scaffold: proposal/design/spec/tasks are
coherent at the artifact level, the review and closure controls are explicit, the
design-time gates are separated from later implementation gates, and the packet
index correctly keeps D6 blocking and not implementation-complete. However, two
remaining P2 ambiguities in the target model still force later implementation to
invent identity/command semantics. That fails the packet's own stated threshold
that implementation should have no product/domain/type-state decisions left to
invent.

This is not implementation acceptance. D6 source implementation remains blocked
behind concrete D0 rows, D1 output-family decisions where touched, and live D2
`ruleGritFacts`.

## P1/P2 Blockers

### P2: Native catalog entries do not align with downstream identity projections

References:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:101`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:113`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:282`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:5`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:126`

The design models `DiagnosticCatalogEntry` as either `grit-diagnostic` with
`patternIdentity` or `native-diagnostic` without `patternIdentity`, but
`DiagnosticConsumerProjection` requires `patternIdentity` unconditionally. The
spec also says each entry binds a `ruleId` to a `patternIdentity` or native
diagnostic acquisition contract, while later projection requirements require
native diagnostic results to match the selected `patternIdentity`.

Required repair shape:

- If D6 is intended to cover only Grit-pattern diagnostics plus native Grit command
  observations, remove or rename the `native-diagnostic` / `native-habitat-rule`
  entry branch so every catalog entry has a D2-backed `patternIdentity`.
- If non-Grit native diagnostics are intended D6 entries, introduce a closed
  diagnostic identity union, for example a `grit-pattern` identity with
  `patternIdentity` and a `native-rule` identity with a native diagnostic identity.
  Propagate that identity through finding projection, run outcome, consumer
  projection, and spec scenarios. Downstream projection must not require a field
  that one catalog-entry branch cannot provide.

### P2: `NativeGritCheckRequest.commandId` is widened to arbitrary string

References:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:153`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:159`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:60`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:66`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:72`

`commandId: "grit-check-current-tree" | "grit-docs-apply-dry-run" | string`
collapses to plain `string` in TypeScript, so the target model does not actually
close the D6 command families. That conflicts with the packet's state-space
collapse framing and with the spec's bounded JSON/text/apply-dry-run command
families.

Required repair shape:

- Replace the bare string escape hatch with a closed discriminant for D6-owned
  command kinds and keep arbitrary runtime correlation in a separate non-authority
  field if needed.
- If future command kinds are intentionally open, model that as an explicit
  `unsupported-or-external-command` refusal/trigger state with owner and output
  contract, not as a string accepted inside the core D6 request model.
- Align the spec scenarios and later validation matrix with the closed command
  family names.

## Non-Blocking Observations

- Packet index state is correct for pre-acceptance: D6 remains "repaired from
  scaffold", final rereview is blocking, and the row preserves D0/D1/D2 source
  blockers plus "not implementation-complete"
  (`packet-index.md:3`, `packet-index.md:25`).
- The design-time/later-implementation split is clear in the proposal, phase
  record, tasks, and closure checklist (`proposal.md:137`, `phase-record.md:52`,
  `tasks.md:14`, `closure-checklist.md:39`).
- I did not find active reduced-standard framing in the repaired D6 surfaces.
  The packet uses "design/specification only" as a gate boundary, not as a lower
  bar for D6 quality.
- After the blockers are repaired and all final lanes close, the control files
  should distinguish this fresh rereview scratch from the prior negative
  `$D6_FINAL_INFORMATION_REVIEW` input before D6 moves to accepted
  design/specification.

## Validation After Writing

- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
  passed: `Change 'deep-habitat-d6-diagnostic-pattern-catalog' is valid`.
- `git diff --check` passed.
