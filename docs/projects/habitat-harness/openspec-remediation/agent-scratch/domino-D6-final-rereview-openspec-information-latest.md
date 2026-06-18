# D6 Final Rereview: OpenSpec And Information Design Latest Disk

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 remain for this latest-disk OpenSpec/information lane. This is not implementation acceptance. Source implementation remains blocked behind the D0 public/durable compatibility rows, D1 output-family decisions where touched, and live D2 `ruleGritFacts` implementation called out by the packet.

## Scope

This rereview evaluated the latest disk state for `deep-habitat-d6-diagnostic-pattern-catalog` as an OpenSpec artifact and information-design packet. I did not implement source code, did not edit D6 packet/control files, and did not evaluate runtime source correctness.

## Sources Read

- `git status --short --branch` for `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`.
- `AGENTS.md`.
- `docs/projects/habitat-harness/openspec-remediation/context.md`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`.
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`.

## Acceptance Rationale

The packet now has a clear reader path: proposal frames D6 as diagnostic capability/run outcomes and explicitly excludes governance, baseline, apply, report assembly, and substrate ownership (`proposal.md:45`, `proposal.md:61`, `proposal.md:75`, `proposal.md:87`). The design then decomposes the domain into identity, scan-root, command observation, cache/freshness, adapter outcome, run outcome, injected probe, and consumer-projection sections (`design.md:74`, `design.md:96`, `design.md:165`, `design.md:189`, `design.md:231`, `design.md:248`, `design.md:299`, `design.md:327`, `design.md:369`). The spec mirrors those sections as normative SHALL scenarios rather than leaving implementation agents to infer behavior from prose (`spec.md:3`, `spec.md:39`, `spec.md:69`, `spec.md:105`, `spec.md:143`, `spec.md:175`, `spec.md:198`, `spec.md:233`, `spec.md:264`).

The latest repair closes the previously open identity and native-diagnostic ambiguity. D6 now binds each catalog entry to a closed `DiagnosticIdentity`, with Grit identities coming from D2 `ruleGritFacts` and native identities using a D6-owned native identity instead of requiring `patternIdentity` (`design.md:76`, `design.md:88`, `design.md:127`, `design.md:161`; `spec.md:3`, `spec.md:18`, `spec.md:27`). That removes the old `gritPattern ?? ruleId` fallback path from target language and turns missing identity into refusal (`proposal.md:113`, `proposal.md:129`; `design.md:90`, `design.md:523`; `tasks.md:28`).

The command and acquisition model is now closed enough for design/specification acceptance. `NativeGritCommandFamily` enumerates command families, `NativeGritCheckRequest` carries bounded request fields, and parsed acquisition is limited to `CompletedDiagnosticCommandObservation`; non-run, interrupted, and tool-unavailable observations remain failure causes, not parsed-report states (`design.md:191`, `design.md:210`, `design.md:218`, `design.md:225`, `design.md:264`; `spec.md:69`, `spec.md:82`, `spec.md:111`). This is the critical information-design fix because it prevents one section from describing completed reports while another admits impossible parsed states.

The latest non-empty findings-state repair is present in all required artifact layers. `ParsedGritDiagnosticReport.kind == "findings-report"` carries `NonEmptyReadonlyArray<NativeDiagnosticFinding>`, `DiagnosticRunOutcome.kind == "findings"` carries `NonEmptyReadonlyArray<DiagnosticFindingProjection>`, and the findings consumer projection also carries non-empty diagnostics (`design.md:271`, `design.md:275`, `design.md:314`, `design.md:372`). The spec states the same requirement directly (`spec.md:154`, `spec.md:160`, `spec.md:238`, `spec.md:243`), and the tasks encode it as an implementation slice rather than an unresolved design question (`tasks.md:46`, `tasks.md:51`).

The injected probe information model no longer overclaims. Successful probe validation is representable only as `probe-diagnostic-observed` with restored cleanup, while dirty or un-restored cleanup is separated into `probe-cleanup-failed` and may retain the diagnostic only as failure context (`design.md:330`, `design.md:339`, `design.md:347`; `spec.md:203`, `spec.md:211`, `spec.md:226`). This preserves the intended non-claims: a probe outcome is diagnostic validation, not Pattern Governance admission, apply safety, or current-tree cleanliness (`spec.md:198`; `phase-record.md:83`).

Downstream boundaries are now discriminated and consumer-specific. D7 receives diagnostic outcomes/projections without raw Grit internals; D8 receives capability and probe outcomes without admission authority; D9 receives identity and limitations only; D11 and D15 remain constrained consumers (`design.md:419`; `spec.md:233`; `downstream-realignment-ledger.md:15`). The public/durable blocker section and tasks preserve D0/D1/D2 source prerequisites, so this acceptance cannot be misread as implementation readiness (`design.md:429`, `design.md:483`; `spec.md:264`; `tasks.md:14`; `phase-record.md:30`).

The control artifacts accurately describe the pre-acceptance state for this review. They still mark latest-disk final rereview as required (`phase-record.md:22`, `review-disposition-ledger.md:52`, `closure-checklist.md:29`), which is correct before this scratch file exists. That control wording is not a semantic blocker; it is the gate this rereview is answering.

## P1/P2 Blockers

None.

## P3 Observations

None for this lane. The existing packet-index row should remain blocking until the workstream owner has all required final lanes and updates the control files; this review only accepts the OpenSpec/information lane for design/specification.

## Validation

- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict` exited 0. OpenSpec reported `Change 'deep-habitat-d6-diagnostic-pattern-catalog' is valid`.
- `git diff --check` exited 0.
