# D6 OpenSpec Information Final Review

## Sources Read

Mandatory skill and workflow sources read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- all files under `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/`

Repo and D6 sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-domain-ontology-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-typescript-state-investigation.md`

Commands run:

- `git status --short --branch`
- `gt status`
- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict` - passed structurally.
- checked for `/docs/projects/habitat-harness/public-surface-compatibility-matrix.md` - missing.

## Artifact Coherence Assessment

D6 is not executable as design/specification authority yet. It is OpenSpec-valid as a file shape, but it is not information-complete enough for a future implementation agent. The current packet still asks implementation to decide the product/domain model that the packet is supposed to settle.

The source D6 packet contains the controlling semantic work: diagnostic catalog entries, scan-root validation, native Grit command request, adapter failure projection, current-tree projection, injected probe input/result, cache/freshness stance, non-claims, and stop conditions. The OpenSpec packet reduces that to broad phrases such as "diagnostic acquisition/projection contracts" and "failure states". That is weak scent and weak authority: the headings look orderly, but the reader cannot derive exact implementation states from them.

The packet index correctly marks D6 as `draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING`, and the review ledger still has a blocking P1 row. That status is accurate. The phase record, proposal, tasks, and closure checklist should not be allowed to imply readiness until the content-level repairs below land.

## Required Packet Structure

Repair the D6 packet into this structure rather than adding more generic tables:

1. `proposal.md`
   - Replace scaffold framing with the executable product scenario: "D6 publishes diagnostic capability and diagnostic run outcomes for native/Grit checks without admission, baseline, or apply authority."
   - Add a "Required Before Source Implementation" block naming missing D0 public-surface rows and live D2 `ruleGritFacts` as blockers.
   - Replace broad verification gates with D6-specific gates from the source packet: adapter tests, injected probe tests, native Grit fixture tests, and `habitat check --tool grit-check --json`.

2. `design.md`
   - Add a "D6 Owns / Must Not Own" boundary block with D2, D5, D7, D8, D9, D11, and D15 boundaries.
   - Add the target domain model directly: `RuleGritFacts`, `DiagnosticCatalogEntry`, `PatternIdentity`, `ScanRootDecision`, `NativeGritCheckRequest`, `GritAdapterOutcome`, `DiagnosticProjection`, `DiagnosticRunOutcome`, `InjectedProbeInput`, `InjectedProbeOutcome`, and `DiagnosticConsumerProjection`.
   - Add closed accepted/refusal outcome families. Do not leave "failure states" as a container phrase.
   - Add identity rules for `ruleId`, `patternIdentity`, native `local_name`/`check_id`, and `diagnosticCatalogEntryId`. Missing `gritPattern` must be a D2/D6 failure state, not fallback to `ruleId`.
   - Add D15 trigger posture: no default D15 migration; trigger only when D6-local command/cache/freshness DTOs cannot represent required states without shared substrate change.

3. `specs/habitat-harness/spec.md`
   - Split the single broad requirement into normative requirements for catalog entry identity, D2 `ruleGritFacts` consumption, scan-root decisions, native Grit request, adapter outcomes, diagnostic projection, cache/freshness observations, injected probe outcomes, prohibited inferences, and downstream consumer projections.
   - Each requirement needs scenarios for accepted and refused states. The minimum scenario set is: valid diagnostic facet, invalid/missing Grit facet, accepted scan root, each refused scan-root family, native request built, tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected shape, clean result, findings result, projection miss, unexpected pattern identity, cache/freshness unobservable, valid injected probe, probe metadata refusal, probe detection success, control-path match failure, and cleanup/final-status failure.

4. `tasks.md`
   - Replace placeholder implementation tasks with ordered semantic slices: D0 surface inventory, D2 `ruleGritFacts` consumption, diagnostic catalog DTOs, scan-root decision model, adapter failure subset, projection outcomes, cache/freshness states, injected probe outcomes, consumer projections, compatibility facades, validation matrix, downstream realignment.
   - Add explicit block: no TypeScript source edits until D0 row classes exist and D2 live projections exist or D6 is explicitly kept design/specification-only.

5. `workstream/phase-record.md`
   - Correct branch state. The file says `codex/deep-habitat-openspec-remediation`, while the active branch is `codex/habitat-docs-durability-pattern`.
   - Add current gate status: design/specification review only, source implementation not authorized, D0 matrix missing, D1/D2 accepted-design-only.
   - Record validation commands with expected status, oracle, cache/freshness stance, and non-claims.

6. `workstream/review-disposition-ledger.md`
   - Add the existing D6 domain/ontology and TypeScript state investigations as blocking review sources.
   - Track each accepted P1/P2 finding separately with disposition and repair evidence. A single "per-domino review gate pending" row is not enough to close the loop.

7. `workstream/downstream-realignment-ledger.md`
   - Replace "later domino packets" with owner-specific rows for D7, D8, D9, D11, and D15.
   - For each row, state what the downstream owner receives and what it must not infer.

8. `workstream/closure-checklist.md`
   - Add content gates: competency questions answered, closed outcome families present, identity mapping present, scan-root model present, adapter/apply failure split present, injected probe result model present, D0 public-surface inventory present, downstream consumer projection present, and validation matrix present.
   - Keep OpenSpec validation as shape proof only, not acceptance proof.

9. `packet-index.md`
   - Keep D6 blocking until the repaired review ledger records no accepted unresolved P1/P2 findings.
   - When repaired, update status to "accepted for design/specification; not implementation-complete" only after ledger evidence exists.

## Wording-Audit Findings

- `OpenSpec packet scaffold` in `proposal.md` and `phase-record.md` is stale once D6 is meant to become executable authority. Use `design/specification authority packet` only after content repairs; until then keep `draft scaffold` and blocking status.
- `Define diagnostic acquisition/projection contracts` is a weak placeholder. Replace it with named artifacts and closed states.
- `Specify native/Grit diagnostic normalization and failure states` hides adapter taxonomy, output parse states, projection states, and scan-root/cache states. Replace with separate requirements.
- `No proof artifact framework` is too broad. D6 must reject target proof/evidence language while preserving D0/D1 compatibility facades where needed.
- `detector identity` is vague. Use exact identities: `ruleId`, `patternIdentity`, `diagnosticCatalogEntryId`, and display label if needed.
- `Diagnostic pattern` and `pattern catalog entry` are boundary-risk terms because D8 owns Pattern Governance. Prefer `diagnostic catalog entry` and `Grit pattern identity`.
- `Diagnostic command output may gain clearer labels` hand-waves public compatibility. Replace with a concrete D0-blocked surface inventory.
- `bun run habitat check --json` is too broad for D6. The source scenario is `bun run habitat check --tool grit-check --json`; keep broad check only as a D7/compatibility smoke if explicitly justified.
- `May affect` and `where command provenance requires it` leave compatibility/freshness decisions to implementation. Convert them into closed blocker/trigger rules.

## Validation And Closure Status Findings

- OpenSpec strict validation passes, but that only proves OpenSpec shape. It does not prove D6 is content-complete.
- The public-surface compatibility matrix file is missing, so D6 source implementation must remain blocked.
- The review ledger still contains a blocking P1 per-domino review gate and has not dispositioned the existing D6 domain/ontology and TypeScript state findings.
- The packet index still marks D6 as draft/blocking. That matches the current packet and should not be changed until repairs land.
- The closure checklist can currently pass shape checks while the domain model is absent. It needs semantic closure checks.
- The validation gate set is stale relative to the source packet: it drops `test/lib/grit-injected-probe.test.ts`, `test/grit/grit-patterns.test.ts`, and the `--tool grit-check` command scenario.

## P1 Findings

### P1-1: The OpenSpec packet drops the source D6 state model

The source packet requires unavailable tool, parse failure, scan-root refusal, clean result, findings result, cache/freshness unobservable, and injected-probe failure states. The spec delta has one requirement and two scenarios.

Required repair: split `spec.md` into the normative requirements listed above, and add scenarios for every accepted/refusal family. The future implementation agent must not have to decide which states exist.

### P1-2: Diagnostic identity is unresolved

The packet does not define the relationship among D2 `ruleId`, D2 `gritPattern`, native Grit `local_name`/`check_id`, projected diagnostic `ruleId`, and D6 `diagnosticCatalogEntryId`.

Required repair: make identity rules a first-class design section and spec requirement. Forbid fallback from missing Grit pattern identity to `ruleId` unless D2 explicitly models that as valid `ruleGritFacts`.

### P1-3: D6 has no published downstream consumer projection

D7, D8, D9, D11, and D15 are named consumers, but the packet does not define what they receive or what they must not infer.

Required repair: define `DiagnosticConsumerProjection` and owner-specific downstream rows. Include `prohibitedInferences` on every result family.

### P1-4: Diagnostic adapter failures are not separated from apply failures

The existing investigations show current Grit failure vocabulary includes both diagnostic adapter failures and D9 apply transaction failures. The packet does not define a D6-only subset.

Required repair: define a closed `DiagnosticAdapterFailureKind` subset and explicitly forbid `GritApply*` states in D6 acquisition, projection, and injected probe outcomes. Retain broad current tags only as D0-backed compatibility facades if necessary.

### P1-5: Compatibility and dependency blockers are not executable

D6 can affect command JSON, package exports, human output, docs/examples, and test-facing vocabulary, but the D0 matrix is missing and D2 live `ruleGritFacts` are not available.

Required repair: add blocker tables to `design.md`, `tasks.md`, and `phase-record.md`: no source implementation until concrete D0 row classes and live D2 projections exist, or until the packet explicitly states design/specification-only closure.

## P2 Findings

### P2-1: Scan-root and cache/freshness states are under-modeled

`scan-root validation` and `cache/freshness policy` are named but not modeled. The source packet needs exact handling for generated/protected/outside/missing/unapproved roots, injected-probe roots, ordinary workspace cache, and fresh-only probe runs.

Required repair: add `DiagnosticScanRootDecision`, `DiagnosticCacheRequirement`, and `DiagnosticCacheObservation` to design and spec scenarios.

### P2-2: Injected probe language overclaims

The source and scratch history show `proofClass` and "injected proof" terminology can be read as governance proof, current-tree cleanliness, or apply safety.

Required repair: use `InjectedProbeInput`, `InjectedProbeOutcome`, and `validationClass: "injected-violation-diagnostic"` as target terms. Any retained `proofClass` is compatibility-only and must be mapped at a boundary.

### P2-3: Validation gates are incomplete and stale

The OpenSpec packet gates omit source-required injected-probe/native fixture tests and use `habitat check --json` instead of the D6 scenario command.

Required repair: define a validation matrix with gate, expected status, oracle, bad case, cache/freshness stance, and non-claims. Include adapter parsing/failure, scan-root refusals, projection identity, injected probes, native Grit fixture result, D2 projection integration, and `habitat check --tool grit-check --json`.

### P2-4: The ledger system cannot close the existing findings

The review ledger has global constraints plus one generic blocking row. It does not import the D6-specific investigations as findings with disposition.

Required repair: add individual P1/P2 rows for the existing domain/ontology and TypeScript-state findings, then require repair evidence before status promotion.

## P3 Findings

### P3-1: Heading scent is too generic

Headings such as `Target Contract`, `Implementation Readiness`, and `Validation` do not predict the D6-specific model. A future agent scanning headers will not find identity, state families, consumer projections, or blockers.

Required repair: rename sections to the thing they control, for example `Diagnostic Identity Rules`, `Closed Diagnostic Outcome Families`, `Scan-Root And Freshness Decisions`, `Consumer Projection Contract`, and `Implementation Blockers`.

### P3-2: The closure checklist is shape-biased

The checklist checks that tasks are implementation steps and spec uses SHALL language, but not that the ontology and state-space questions are answered.

Required repair: add the semantic checklist items from `Required Packet Structure`.

### P3-3: Title and internal language remain boundary-risky

`Diagnostic Pattern Catalog` can survive as a historical slug, but internally `pattern catalog` should not become D6's target term.

Required repair: define title semantics once: "catalog" means diagnostic capability catalog only. Use `diagnostic catalog entry` internally.

## Exact Repair Recommendations

Do not implement TypeScript source from the current packet. Repair documents first in this order:

1. Rewrite `design.md` around the D6 target model and blocker tables.
2. Expand `specs/habitat-harness/spec.md` into full normative scenario coverage for every closed state family.
3. Rewrite `tasks.md` into ordered semantic implementation slices, with D0/D2 blockers before source edits.
4. Update `phase-record.md` with correct branch, current gate, D0/D1/D2 dependency status, validation matrix shape, and non-claims.
5. Update `review-disposition-ledger.md` to import and disposition the D6 scratch findings.
6. Update `downstream-realignment-ledger.md` with D7/D8/D9/D11/D15 owner-specific actions and prohibited inferences.
7. Update `closure-checklist.md` to require semantic closure, not just OpenSpec shape.
8. Only then update `packet-index.md` from draft/blocking to accepted-for-design/specification, and only if no accepted unresolved P1/P2 findings remain.

Acceptance standard: a future implementation agent should be able to map every source edit to an explicit D6 requirement, task slice, validation oracle, compatibility row class, and downstream consumer projection without inventing product/domain trade-offs.
