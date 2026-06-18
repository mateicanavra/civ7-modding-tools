# D6 Final Rereview: Domain/Ontology

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 findings remain for this domain/ontology rereview lane against the repaired disk state. This is not implementation acceptance. D6 remains not implementation-complete, and source implementation remains blocked behind concrete D0 compatibility rows, D1 output-family decisions where touched, and live D2 `ruleGritFacts`.

This scratch file records only this lane's final rereview. It does not update D6 packet/control files, does not mark the packet index, and does not authorize source edits.

## Sources Read

Branch/worktree grounding:

- `git status --short --branch` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation` returned `## codex/d6-diagnostic-pattern-packet-repair`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`

Mandatory skill sources read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`

TypeScript/state-space references read because the TypeScript refactoring skill points to them for domain language and reachable-state concerns:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/axes.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/design-patterns.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/where-defaults-hide.md`

Primary D6 and remediation sources read:

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
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-domain-ontology-review.md` for prior negative-review context only, not as acceptance evidence.

## Review Result

The repaired D6 packet now defines the required D6 ontology as a diagnostic capability and diagnostic run contract rather than a scaffold. The core entities and relationships are explicit: `ruleId`, `patternIdentity`, `diagnosticCatalogEntryId`, `nativeResultIdentity`, and `diagnosticFindingId` are separated in `design.md` lines 74-95, with the no-fallback rule also required by `proposal.md` lines 107-115 and `spec.md` lines 18-23.

The state-space repair is sufficient for design/specification acceptance. `design.md` lines 98-303 define closed target families for diagnostic catalog entries, scan-root decisions, native command observations, cache/freshness observations, adapter outcomes, run outcomes, injected probe outcomes, and downstream consumer projections. The spec delta mirrors these as SHALL requirements and scenarios in `spec.md` lines 3-262.

The D6/D7/D8/D9/D11/D13/D15 boundaries are now explicit enough. D6 owns diagnostic acquisition/projection only (`design.md` lines 48-60), excludes adjacent authorities (`design.md` lines 62-72), and publishes a consumer table that says what downstream owners receive and must not infer (`design.md` lines 294-302). The downstream ledger repeats those owner boundaries for D7, D8, D9, D11, D13, and D15 at `downstream-realignment-ledger.md` lines 15-20.

Proof/evidence-shaped target language has been removed from D6 core types. The remaining `proofClass` mentions are compatibility-only and explicitly blocked behind D0/D1 handling (`design.md` lines 275-277, `tasks.md` lines 47-48, `phase-record.md` lines 34-36, and `downstream-realignment-ledger.md` line 12). That is acceptable for design/specification because the target model uses `validationClass`, probe outcomes, limitations, and non-claims instead.

Source implementation is clearly blocked. The proposal requires D0/D1/D2 prerequisites before source implementation (`proposal.md` lines 75-85), the design enumerates public/durable blockers (`design.md` lines 304-326), tasks keep implementation blocked until prerequisite rows/facts exist (`tasks.md` lines 14-24), and the phase record repeats that design acceptance is not implementation completeness (`phase-record.md` lines 29-39). The packet index still records D6 as repaired pending final rereview and not implementation-complete (`packet-index.md` line 25), which is consistent with this lane producing scratch review only.

## P1/P2 Findings

None.

No unresolved P1/P2 findings remain for this domain/ontology rereview lane.

## P3 Tightenings

1. `proposal.md` line 91 references `DiagnosticCapabilityProjection`, but the design defines `DiagnosticCatalogEntry` and `DiagnosticConsumerProjection` rather than a type with that name. This is non-blocking because D8's receiving contract is otherwise clear in `design.md` lines 294-302 and `downstream-realignment-ledger.md` line 16. Tighten by replacing the dangling type-like name with the defined term or by explicitly defining it as a bounded D8 projection.

2. `design.md` line 236 includes `baselineState` inside `DiagnosticFindingProjection`. The downstream ledger correctly limits baseline fields to D5-owned projections at `downstream-realignment-ledger.md` line 14, so this is not a D6 authority blocker. Tighten later by renaming or wrapping that field as a D5-sourced projection, or by moving baseline joining fully to D5/D7.

3. `spec.md` line 6 says an entry binds to one accepted `patternIdentity`. The surrounding scenarios prevent Pattern Governance admission inference, especially `spec.md` lines 24-29 and `design.md` lines 123-124, so this is non-blocking. Tighten by saying "valid D2-published `patternIdentity`" to avoid overloading "accepted."

## Non-Acceptance Claims

This review does not accept implementation behavior, current TypeScript source, native Grit runtime behavior, command JSON compatibility, public exports, test coverage, D0 rows, D1 output-family mappings, or live D2 `ruleGritFacts`.

Skills used: domain-design, information-design, ontology-design, solution-design, typescript-refactoring, typescript.
