# D5 Final Domain/Ontology Rereview

## Grounding

Mandatory skills read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`

Current packet/control surfaces read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`

Negative-control inputs read as repair/disposition evidence, not acceptance evidence:

- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-domain-ontology-investigation.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-information-design-investigation.md`

Additional cross-check read:

- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`

Validation commands run during this rereview:

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`: passed.
- `git diff --check`: passed.

## Verdict

Accepted for design/specification only.

Current disk has no unresolved P1 or P2 domain/ontology findings. D5 now has a proper accepted/refused Baseline Authority ontology, distinct identities for diagnostic keys, baseline entries, external exception projection entries, and baseline application matches, bounded D7/D8 consumer contracts, and source implementation blockers behind concrete D0 rows and live D2 baseline facts.

Implementation remains blocked behind concrete D0 rows for every touched public/durable surface and live D2 rule identity/facet projection facts where D5 consumes rule baseline metadata. This rereview does not accept source implementation, D7, D8, D13, or current runtime behavior.

## P1 Findings

None.

The prior P1 issues are repaired on current disk:

- Accepted/refused ontology: `design.md:58-73` defines the D5 target ontology, and `spec.md:3-195` gives normative accepted/refused scenarios.
- Identity split: `design.md:62-65` distinguishes `DiagnosticKey`, `BaselineEntry`, `ExternalExceptionProjectionEntry`, and `BaselineApplicationMatch`; `spec.md:9-11` forbids generic debt-row authority.
- External exception semantics: `design.md:71`, `design.md:98`, `design.md:125`, and `spec.md:59-101` distinguish external sources, fixed/derived projection, source failures, projection mismatch, and parser-owned explicit-baseline bypass.
- Rule-introduction manifest semantics: `design.md:72`, `spec.md:141-167`, and `tasks.md:43-44` require exact matching for rule id, owner project, owner tool, baseline path, sorted initial diagnostic keys, and comparison base, with missing/mismatch refusal.
- D7/D8 ownership: `proposal.md:54-57`, `design.md:46-56`, `design.md:156-182`, `spec.md:169-189`, and `downstream-realignment-ledger.md:7-9` keep D5 as publisher of baseline authority/application/integrity results while D7 owns enforcement/reporting and D8 owns lifecycle/admission.

## P2 Findings

None.

The prior P2 issues are repaired on current disk:

- Public surface inventory and D0 blocking are explicit at `design.md:136-154` and `spec.md:191-195`.
- Write set and protected paths are explicit at `design.md:184-214`.
- Design-time gates and later implementation gates are separated at `phase-record.md:41-63` and `closure-checklist.md:3-30`.
- The D5-specific command gate is no longer replaced by broad all-rule checking: `proposal.md:121-129`, `design.md:216-239`, `tasks.md:55-67`, and `phase-record.md:55-62` name `bun run habitat check --rule baseline-integrity --json` and preserve broad `habitat check --json` only as non-substitute context.
- Durable path routing is repaired through `$REMEDIATION_DIR/context.md` variables in `context.md:60-76` and active packet/control references.

## P3 Findings

### P3-1: One D2 handoff phrase can be sharpened to the accepted ontology

`design.md:158-162` says D5 consumes D2 facts including a "rule-introduction manifest relation." The packet already defines `RuleIntroductionBaselineManifest` acceptance/refusal precisely at `design.md:72`, `spec.md:141-167`, and `tasks.md:43-44`, so this is not ambiguous enough to block. Still, the phrase is close to prior negative-control shorthand. Prefer "RuleIntroductionBaselineManifest identity/facet projection" or "rule-introduction manifest acceptance input" in a later cleanup.

### P3-2: One scenario uses generic "decision" wording where the target type is known

`spec.md:151` says D5 publishes "an accepted introduced-rule baseline decision." This is understandable inside the Rule Introduction Manifest requirement, but the target model names `BaselineExpansionDecision` at `design.md:70` and `tasks.md:39`. Prefer "accepted `BaselineExpansionDecision` for an introduced rule" in a later wording pass.

## Wording Audit

Historical scratch files still contain stale/reduced phrases as negative-control findings. That is acceptable because `phase-record.md:26-30`, `review-disposition-ledger.md:5-7`, and `phase-record.md:48-49` explicitly mark earlier investigations as repair guidance and not acceptance evidence.

Active packet/control guidance does not contain unresolved ownership-leaking language. The only remaining hits are either rejected-language examples in `design.md:75-90`, non-goal/protected-path statements in `design.md:205-214` and `design.md:241-248`, or the P3 wording polish items above.

## Non-Claims

- This rereview does not edit packet/source files.
- This rereview does not commit.
- This rereview does not accept D5 implementation.
- This rereview does not accept D0, D2, D7, D8, or D13.
- Passing OpenSpec validation proves packet shape only, not runtime behavior.

Skills used: domain-design, information-design, ontology-design, solution-design.
