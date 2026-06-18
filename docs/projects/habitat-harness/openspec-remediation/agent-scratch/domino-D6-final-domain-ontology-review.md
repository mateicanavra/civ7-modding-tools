# D6 Final Domain/Ontology Review

## Verdict

D6 is not acceptable for design/specification on current disk. The source packet names the right separation instinct, but the OpenSpec packet still does not define the diagnostic catalog domain contract before implementation. It leaves identity, scan roots, native/Grit command acquisition, adapter outcomes, diagnostic projection, cache/freshness, injected probes, and downstream handoffs as implementation-time invention.

Do not mark acceptance while the P1/P2 findings below remain unresolved.

## Sources Read

Mandatory skill sources read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`

Repo/process and D6 packet sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-domain-ontology-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-typescript-state-investigation.md`
- Adjacent owner packets: D7, D8, D9, D11, D13, and D15 source packets under `docs/projects/habitat-harness/phase2-workstream-packets/`
- Global D6-relevant scratch excerpts from `global-testing-validation-designer.md` and `global-code-topology-investigator.md`

Grounding commands run:

- `git status --short --branch`
- `gt status`
- `find .../docs -name AGENTS.md -print`
- `rg --files .../agent-scratch`
- `rg -n "D6|Diagnostic Pattern Catalog|diagnostic catalog|Grit|scan-root|injected|probe|D7|D8|D9|D11|D13|D15" ...`

## Accepted Terms

- `diagnostic catalog`: D6-owned catalog of diagnostic capabilities. Prefer this over bare "pattern catalog".
- `diagnostic catalog entry`: D6-owned entry binding a Habitat rule identity to a native/Grit diagnostic capability.
- `ruleId`: D2-owned Habitat rule identity consumed by D6.
- `Grit pattern identity` or `patternIdentity`: native Grit diagnostic identity, not Pattern Authority lifecycle identity.
- `diagnostic acquisition`: process of obtaining native/Grit diagnostic output.
- `native Grit check request`: command request sent to the native Grit adapter for diagnostics.
- `adapter outcome`: structured result of attempting native/Grit diagnostic acquisition.
- `adapter failure`: D6-owned diagnostic acquisition failure subset only.
- `scan root decision`: D6-owned accepted/refused/expanded scan-root state.
- `diagnostic projection`: mapping from native output into Habitat diagnostic rows.
- `diagnostic run outcome`: D6-published clean/findings/refusal/failure/projection outcome.
- `cache/freshness observation`: bounded observation for diagnostic command freshness.
- `injected diagnostic probe` and `injected probe outcome`: scoped temporary diagnostic validation result.
- `prohibited inference` or `non-claim`: explicit statement of what the diagnostic result does not prove.
- `consumer projection`: narrow DTO handed to D7/D8/D9/D11/D15 without raw adapter or whole registry leakage.

## Rejected Or Narrowed Terms

- `Diagnostic Pattern Catalog`: keep only as packet title/slug if necessary. Inside the contract, define it as a diagnostic capability catalog, not a Pattern Authority catalog.
- `pattern catalog entry`: reject. It collides with D8 Pattern Governance; use `diagnostic catalog entry`.
- `diagnostic pattern`: narrow. It is ambiguous between Grit pattern, Habitat rule, governed pattern, and apply-approved pattern.
- `detector identity`: reject unless defined as display text. Identity must be one of `ruleId`, `patternIdentity`, or `diagnosticCatalogEntryId`.
- `proof`, `proof class`, `native sample proof`, `current-tree proof`, `injected-violation proof`: reject as D6 target language. Use result/outcome/probe language. If retained in public fields, classify through D0/D1 compatibility.
- `evidence`: narrow to source citations or compatibility language. Do not use it as the D6 result model.
- `ok: boolean`: reject as target domain language for D6 outcomes. Use closed outcome states.
- `Grit failure`: reject as a shared umbrella. Split diagnostic adapter failures from D9 apply transaction failures.
- `cache provenance`: narrow to command-provenance fields. D6 should usually say cache/freshness observation.
- `admission`, `registered`, `apply candidate`, `apply approved`: forbidden D6 target states; D8/D9 own them.
- Current code terms such as `GritCheckParseResult`, `GritAdapterFailureTag`, `InjectedGritProbeResult`, `proofClass`, `HarnessRule`, and `rule.gritPattern ?? rule.id`: present-behavior evidence only, not accepted domain authority.

## Owner Boundary Map

| Concern | D6 Position | Owning Domain |
| --- | --- | --- |
| Rule identity and metadata facets | D6 consumes projected Grit facts only | D2 Rule Registry Metadata |
| Diagnostic catalog entry identity | D6 owns binding from `ruleId` to accepted diagnostic identity | D6 Diagnostic Catalog |
| Native/Grit command acquisition | D6 owns diagnostic request/outcome shape | D6 Diagnostic Catalog |
| Grit pattern syntax/engine semantics | D6 observes through adapter, does not redefine | Grit/native tool |
| Scan-root acceptance/refusal for diagnostic execution | D6 owns diagnostic scan-root decision | D6 Diagnostic Catalog |
| Normalized findings before enforcement assembly | D6 owns diagnostic projection; D7 consumes | D6 then D7 |
| Final report assembly, selector failures, `CheckReport.ok`, rendering | D6 must not own | D7 Structural Enforcement |
| Baseline state, debt growth/shrink, baseline authority | D6 must not own | D5 Baseline Authority |
| Pattern candidate/registered/hook/apply lifecycle | D6 must not own | D8 Pattern Governance |
| Apply safety, dry-run/live writes, rollback, formatter handoff | D6 must not own | D9 Transformation Transaction |
| Hook orchestration and local-feedback semantics | D6 publishes staged diagnostic projection only | D11 Local Feedback |
| Candidate pattern scaffolding and unsupported scaffold refusals | D6 may supply diagnostic capability references only | D13 Scaffolding |
| Broad process/provenance substrate | D6 may trigger only after local DTO minimization fails | D15 Execution Provenance Trigger |

## Required State Families

D6 must normatively define these state families before implementation:

1. Diagnostic catalog entry states: valid Grit diagnostic entry, valid native diagnostic entry, malformed/missing Grit facet, unsupported diagnostic tool, diagnostic capability unavailable.
2. Identity states: `ruleId`, `patternIdentity`, `diagnosticCatalogEntryId`, native `local_name`, native `check_id`, identity precedence, mismatch, and missing identity refusal. Missing `gritPattern` must not fall back to `ruleId` unless D2 explicitly models that as valid.
3. Scan-root states: accepted, expanded exact test files, injected-probe root accepted only in probe mode, empty, outside repo, missing, generated output, protected path, unapproved root, ignored path without expansion, unsupported file/test expansion.
4. Native command request states: executable/tool selection, argv, cwd, bounded env subset, scan roots, cache mode, freshness requirement, output bounds, prohibited inferences.
5. Adapter acquisition states: tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected result shape, truncated/empty output, cache/freshness unobservable, internal adapter contract violation, parsed native report.
6. Diagnostic projection states: clean result, findings result, projection miss, unexpected pattern identity, path normalization failure, message/severity normalization, multi-pattern native output filtering.
7. Cache/freshness states: ordinary workspace cache allowed, fresh required, fresh observed, cache hit/replay observed if available, required provenance missing, unknown-but-allowed, unknown-and-refused.
8. Injected probe states: valid input, metadata missing, pattern mismatch, path outside scope, path already exists, ignored/protected path, fresh execution required, expected probe diagnostic observed, control diagnostic unexpectedly observed, projection miss, adapter failure, cleanup restored, cleanup dirty.
9. Consumer projection states: D7 enforcement consumer, D8 governance reference consumer, D9 apply precondition/non-claim consumer, D11 local feedback consumer, D15 trigger evaluation consumer.
10. Prohibited inference states: diagnostic success is not governance admission, not baseline authority, not apply safety, not full current-tree cleanliness, not CI/product proof, and not hook authority.

## P1 Findings

### P1-1: Current spec does not define the D6 domain contract

Current disk has one broad OpenSpec requirement and two scenarios: successful diagnostic findings and diagnostic cannot run. This is below the bar for D6. It does not define catalog entry identity, scan roots, adapter acquisition, parsed reports, projection outcomes, cache/freshness, injected probes, or consumer projections.

Exact repair: split `specs/habitat-harness/spec.md` into normative requirements for each required state family above. Each requirement needs at least one success scenario and one refusal/failure scenario. The spec must make scan-root refusal, adapter failure, parse failure, projection miss, clean result, findings result, cache/freshness refusal, and injected probe failure distinct states.

### P1-2: Diagnostic identity is unresolved

The packet says "detector identity" and "pattern catalog entries" but never defines identity rules. That lets `ruleId`, `gritPattern`, native `local_name`, native `check_id`, and a future governed pattern id collapse into one overloaded concept.

Exact repair: add identity rules to `design.md` and scenarios to `spec.md`: D2 owns `ruleId`; native/Grit owns `patternIdentity`; D6 owns `diagnosticCatalogEntryId`; native identity precedence and mismatch handling are explicit; missing pattern identity is a D2/D6 refusal and cannot silently fall back to `ruleId`.

### P1-3: D6 still risks absorbing D8 and D9 authority

"Pattern catalog" language, "proof" language, and broad "Grit failure" language can be read as pattern admission or apply readiness. D8 explicitly owns candidate/registered/hook/apply lifecycle. D9 explicitly owns dry-run/live transaction states and apply failure tags.

Exact repair: replace target language with diagnostic capability/outcome language. Define a forbidden-state table in `design.md`: D6 entries cannot contain governance lifecycle, apply approval, write safety, rollback, dirty-worktree apply refusal, formatter handoff, or baseline authority fields.

### P1-4: Diagnostic adapter failures and apply transaction failures are not separated

Prior scratch identifies current failure vocabulary that mixes diagnostic acquisition failures with `GritApply*` transaction failures. Current D6 OpenSpec does not split the taxonomy.

Exact repair: define `DiagnosticAdapterFailureKind` as a D6 closed subset. Explicitly forbid D9 apply failure tags in D6 acquisition, projection, and probe outcomes. If the broad current export survives, classify it as a D0-backed compatibility facade, not D6 target ontology.

### P1-5: No D6 consumer projection exists for D7/D8/D9/D11/D15

The proposal names consumers but the downstream ledger only says "Later domino packets". Without a D6-published projection, each downstream packet can read raw Grit adapter state or recreate D6 semantics.

Exact repair: define `DiagnosticConsumerProjection` in `design.md` and require it in `spec.md`. Minimum fields: `ruleId`, `diagnosticCatalogEntryId`, `patternIdentity`, `scanRootDecisionKind`, `adapterOutcomeKind`, `diagnosticOutcomeKind`, normalized diagnostics, freshness decision, limitations/prohibited inferences, and optional probe outcome. Add a consumer-specific table saying what D7, D8, D9, D11, and D15 receive and must not infer.

### P1-6: Injected probe semantics overclaim through proof language

The source packet and global validation notes still use "injected violation proof". Current D6 scaffold does not decide whether this is compatibility or target language.

Exact repair: define `InjectedProbeInput` and `InjectedProbeOutcome` as diagnostic validation states. Use `validationClass` or `probeKind`, not `proofClass`, in target language. If public output/export compatibility requires `proofClass`, map from target probe state at the boundary and record D0/D1 handling.

## P2 Findings

### P2-1: Scan-root plans are lazy named and under-modeled

"Scan-root validation" is not a domain contract. D6 must own derivation, acceptance, exact test-file expansion, and refusal families for diagnostic execution.

Exact repair: add `ScanRootPlan` or `ScanRootDecision` state family with scenarios for every accepted/refused state listed above. State whether each root came from D2 `ruleGritFacts`, command/test override, or injected probe input.

### P2-2: Native command acquisition is not modeled as a first-class outcome

The source packet requires native Grit command request and cache/freshness policy, but the OpenSpec packet does not specify argv/cwd/env/cache/output/provenance obligations. This makes D15 trigger evaluation impossible.

Exact repair: define `NativeGritCheckRequest`, `GritCommandOutcome`, and `DiagnosticCommandObservation` as bounded D6-local records. Add a D15 minimization rule: D15 is not triggered unless D6 proves these local records cannot represent required command provenance without contradictory states.

### P2-3: Cache/freshness is an observation family, not an optional note

Current D6 validation text says injected probes must run fresh, but the OpenSpec packet does not encode when unknown cache status is allowed, refused, or D15-triggering.

Exact repair: add `DiagnosticCacheRequirement` and `DiagnosticCacheObservation` states. Injected probes and validation/probe paths require fresh observable execution; ordinary current-tree diagnostics may allow workspace cache only if the result carries the allowed unknown/non-claim.

### P2-4: D0 public surface dependency is hand-waved

D6 can touch command JSON, human adapter-failure text, exported Grit adapter types/functions, injected-probe types/helpers, tests, docs/examples, and proof-shaped names. The proposal says compatibility rules apply but does not enumerate row classes.

Exact repair: add a D0 blocker table in `design.md` and `tasks.md` naming all D6-touched surfaces. Implementation must be blocked until concrete D0 rows exist for command JSON, package exports, human output, docs/examples, and test-facing public vocabulary.

### P2-5: Validation gates do not prove the stated state families

Current gates omit several source-packet gates and do not include bad cases for identity fallback, apply-tag leakage, scan-root refusals, cache unknown in fresh-required paths, structured adapter failure rendering, or control-probe findings.

Exact repair: replace the current gate list with a validation matrix. Required gates include adapter acquisition/failure tests, scan-root decision tests, projection identity tests, injected probe tests, native Grit fixture/corpus tests, `bun run habitat check --tool grit-check --json`, OpenSpec strict validation, and `git status --short --branch` cleanup proof. Each row must record expected status, cache/freshness stance, bad case, and non-claims.

### P2-6: Downstream realignment is generic and therefore non-actionable

The downstream ledger currently lists "Later domino packets" rather than D7/D8/D9/D11/D15-specific handoffs. That fails the owner-boundary requirement.

Exact repair: rewrite `workstream/downstream-realignment-ledger.md` with one row per owner. D7 consumes diagnostic run outcomes; D8 consumes diagnostic capability/result references without admission; D9 consumes diagnostic limitation facts but not apply safety; D11 consumes staged diagnostic local-feedback outcomes; D15 consumes only trigger evidence if local DTOs fail.

### P2-7: Tasks remain placeholders rather than semantic slices

Tasks 2.1-2.3 say define acquisition/projection contracts, separate catalog entries, and specify normalization/failure states. Those are headings, not executable design slices.

Exact repair: rewrite `tasks.md` into ordered semantic slices: D0 surface inventory, D2 `ruleGritFacts` prerequisite, identity model, catalog entry model, scan-root model, native request/outcome model, adapter failure subset, projection model, cache/freshness model, injected probe model, consumer projection model, validation matrix, and downstream ledger updates.

## P3 Findings

### P3-1: `Grit` should be adapter-boundary language

Use `Grit` where the native tool is the actual boundary: `NativeGritCheckRequest`, `GritAdapterOutcome`, `GritPatternIdentity`. Do not prefix D7/D8/D11 consumer states with `Grit`; use diagnostic catalog language.

### P3-2: Closure checklist can pass while ontology is absent

The checklist checks proposal/design/tasks/spec shape but not competency questions, closed state families, identity mapping, owner split, or consumer projections.

Exact repair: add checklist items requiring all P1/P2 state-family repairs, D0 blocker table, D2 prerequisite, D15 minimization decision, validation matrix, and no unresolved accepted P1/P2 findings.

### P3-3: Title should be challenged but not block on rename alone

The slug/title may remain for continuity, but the packet must explicitly define "Diagnostic Pattern Catalog" as diagnostic capability catalog. A rename to "Diagnostic Capability Catalog" or "Grit Diagnostic Catalog" would reduce D8 ambiguity, but internal terminology repair is the blocking concern.

## Exact Repair Recommendations

1. Rewrite `design.md` around the D6 ontology: purpose, entities, identities, relationships, state families, owner exclusions, public-surface blockers, D15 trigger posture, rejected alternatives.
2. Expand `specs/habitat-harness/spec.md` into full SHALL requirements for catalog entry identity, D2 consumption, scan-root decisions, native command requests, adapter outcomes, diagnostic projections, cache/freshness observations, injected probe outcomes, prohibited inferences, and consumer projections.
3. Rewrite `proposal.md` to say D6 creates diagnostic capability and diagnostic run contracts only. Remove or compatibility-classify proof/admission/apply implications.
4. Rewrite `tasks.md` into ordered semantic slices and make source implementation explicitly blocked until D0 rows and live D2 projections exist.
5. Rewrite `workstream/downstream-realignment-ledger.md` with D7/D8/D9/D11/D13/D15-specific boundary actions.
6. Update `workstream/review-disposition-ledger.md` with these findings as blocking until all P1/P2 repairs are applied.
7. Update `workstream/closure-checklist.md` so closure cannot pass without identity rules, complete state families, consumer projections, D0 blockers, D2 prerequisites, validation matrix, and no unresolved P1/P2 issues.
8. Update `workstream/phase-record.md` with exact validation gates, expected statuses, cache/freshness stance, and non-claims. Use `habitat check --tool grit-check --json` for D6-specific CLI behavior, not only broad `habitat check --json`.
9. Do not implement TypeScript source from the current packet. Any later implementation must be a separate step after repaired D6 OpenSpec acceptance.

## Acceptance Gate

Current disk has unresolved P1/P2 findings. D6 remains a draft scaffold and must not authorize implementation until the review ledger records these findings as repaired and no accepted unresolved P1/P2 issues remain.

Skills used: domain-design, information-design, ontology-design, solution-design, typescript-refactoring.
