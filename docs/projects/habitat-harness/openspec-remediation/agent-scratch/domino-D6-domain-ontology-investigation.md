# D6 Diagnostic Pattern Catalog Domain/Ontology Investigation

## Sources Read

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

Repo/workstream guidance read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/README.md`
- `docs/process/GRAPHITE.md`
- `docs/projects/habitat-harness/FRAME.md`
- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`

Input authorities and grounding read:

- `docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/**`
- `docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D1-proof-contract-boundary.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-failures.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-injected-probe.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/global-domain-adversary.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-domain-ontology-investigation.md`

Commands run for state grounding:

- `git status --short --branch`
- `gt status`
- `bun run openspec -- list`
- `find .../openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog -maxdepth 4 -type f`
- `rg` queries over D6 scaffold and Grit grounding files

## Verdict

D6 is not acceptable for design/specification in its current OpenSpec scaffold.

The source D6 domino has the right boundary instinct: D6 must separate Grit diagnostic acquisition/projection from Pattern Governance and Transformation Transaction. The current OpenSpec scaffold does not encode that contract. It preserves the title and a few stop conditions, but leaves the central ontology unresolved: diagnostic identity, pattern identity, scan-root decision, native command request, adapter result, output parse state, diagnostic projection, injected probe result, freshness decision, and downstream consumer result are not modeled as accepted/refused states.

This is not implementation detail. These are the semantic commitments that prevent later agents from treating a diagnostic as admission, treating fixture success as current-tree check behavior, treating an adapter failure as a structural pass, or treating a diagnostic pattern as apply-safe. Under the ontology-design mandate, the current packet is noun harvesting plus generic relationship language: it says "catalog", "projection", "failure states", and "pattern entries", but it does not answer the competency questions or define identity/relationship semantics.

Stop condition: D6 must remain blocking until the OpenSpec packet encodes the full diagnostic catalog domain contract with no unresolved P1/P2 findings.

## Ontology Frame

### What D6 Must Do

D6 must let Habitat answer this product question:

> When a user or downstream Habitat stage asks for Grit diagnostics, what exactly was selected, where was it scanned, what native command was requested, what did the adapter observe, how were native results projected into Habitat diagnostics, what did the result mean, and which stronger inferences are prohibited?

Operational purpose: validation and classification, not formal inference. The right representation is OpenSpec scenarios plus future TypeScript discriminated states. RDF/OWL would be overkill; loose prose is undercommitment.

Commitment strength: constrained local schema. D6 needs closed states and typed relationships, especially at the D2/D6/D7/D8/D9/D11/D15 boundaries.

Identity scope: repo-local scoped IDs. D6 must distinguish:

- `ruleId`: D2-owned Habitat rule identity.
- `patternIdentity`: Grit-native diagnostic pattern identity.
- `diagnosticCatalogEntryId`: D6-owned entry identity, likely derived from `ruleId` plus accepted D2 `ruleGritFacts`, not from raw current-code fallback.
- `scanRootId` or `scanRootPath`: repo-relative scan root accepted/refused by D6.
- `probeId`: injected probe case identity, separate from the diagnostic pattern and rule.

Relationship semantics: typed relationships, not generic `uses`, `owns`, or `proofs`.

Evidence split: D6 may emit diagnostic check outcomes, adapter command outcomes, and injected probe outcomes. It must not turn these into generic proof artifacts. D1 already requires proof/evidence-shaped names to remain compatibility facts unless explicitly retained for a concrete invariant.

### D6 Owns

- Diagnostic catalog entry contract for native/Grit checks.
- Relationship between D2 `ruleGritFacts` and D6 diagnostic catalog entries.
- Grit diagnostic identity mapping: Habitat rule identity to Grit pattern identity to projected diagnostic identity.
- Scan-root derivation, acceptance, and refusal for diagnostic execution.
- Native Grit check request shape required for diagnostics: command id, argv, cwd, env subset, scan roots, cache/freshness stance, and prohibited inferences.
- Adapter result taxonomy for diagnostic execution: tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected result shape, cache/freshness unobservable, internal adapter contract violation.
- Native result projection into Habitat diagnostics: path normalization, message, severity, pattern match, unexpected pattern identity, projection miss.
- Clean diagnostic result vs findings diagnostic result.
- Injected probe input/result contract for diagnostic behavior: probe path, control path, scope metadata, expected diagnostic, cleanup status, final git status, and failure families.
- The D6 consumer projection supplied to D7, D8, D9, D11, and D15 trigger evaluation.

### D6 Must Not Own

- Rule metadata declaration, selector vocabulary, or malformed rule registry states. D2 owns those and publishes `ruleGritFacts`.
- Baseline debt authority, growth/shrink decisions, baseline application, or `baselined` truth. D5 owns those.
- Check report assembly, selector failure reporting, final `CheckReport.ok`, renderer behavior, or structural enforcement status derivation. D7 owns those.
- Pattern lifecycle, registration, hook-scope admission, apply admission, false-positive acceptance, or manifest approval. D8 owns those.
- Writes, dry-run inventory, rollback, formatter handoff, or apply safety. D9 owns those.
- Hook orchestration and local-feedback language. D11 owns hooks and consumes staged diagnostic behavior.
- Broad execution provenance substrate migration. D15 is trigger-only and activates only when D6 proves local DTOs cannot represent command provenance without contradictory states.

## Competency Questions D6 Must Answer

1. Given a D2 rule projection, does this rule have a valid Grit diagnostic facet, and what diagnostic catalog entry does it create?
2. What is the canonical identity relationship among `ruleId`, `gritPattern`, native `local_name`, native `check_id`, and projected Habitat diagnostic `ruleId`?
3. Which scan roots are requested, how were they derived, and are they accepted, refused, or rewritten into exact test files?
4. What are the refused scan-root families: empty, outside repo, missing, generated output, protected path, unapproved root, injected-probe root without probe mode, and unsupported file/test expansion?
5. What native Grit command request is sent, including command id, executable, argv, cwd, environment subset, scan roots, cache directory, cache/freshness stance, and prohibited inferences?
6. Did the native command run, fail, or not run? Which adapter failure family owns that outcome?
7. If command output exists, was it exact JSON, no JSON, malformed JSON, schema drift, unexpected result shape, or parsed report?
8. If a parsed report exists, did it produce a clean result, findings result, projection miss, or unexpected pattern identity?
9. What is a normalized Habitat diagnostic from D6, and which fields are D7/D5-owned rather than D6-owned?
10. What limitations/prohibited inferences travel with a D6 result, especially fixture vs current-tree, diagnostic vs baseline, diagnostic vs apply, and local command vs CI/product?
11. What injected probe input is valid, what is refused before writing a probe file, and what result proves the specific probe scenario?
12. What cleanup/final-status states can an injected probe report, and which are diagnostic failures vs transaction/write-safety concerns outside D6?
13. When does cache/freshness become locally representable in D6 DTOs, and when does it trigger D15 minimization review?
14. Which public command/JSON/package surfaces are touched and therefore require D0 compatibility rows before implementation?
15. What exact D6 result projection do D7, D8, D9, D11, and D15 consume without reading D6 internals?

If any question is answered only by "diagnostic acquisition/projection contracts" or "failure states", the packet remains underspecified.

## Target Domain Model

### Entities

- `RuleGritFacts`: D2-owned projection consumed by D6. Required fields must include `ruleId`, `ownerTool`, `gritPattern`, scan-root/scope facts, hook-scope facts if relevant, and malformed-facet refusal if the rule cannot be diagnosed.
- `DiagnosticCatalogEntry`: D6-owned entry describing one diagnostic capability for one Habitat rule. It is not a governed pattern and not an apply pattern.
- `PatternIdentity`: native Grit identity accepted for matching. It may come from `local_name` or parsed `check_id`, but D6 must define precedence and mismatch handling.
- `ScanRootDecision`: D6 decision over requested scan roots: accepted roots, expanded exact test files, or refusal.
- `NativeGritCheckRequest`: native command request for diagnostics. It is an adapter command request, not a proof artifact.
- `GritAdapterOutcome`: result of trying to obtain a native Grit report. Accepted states include parsed report; refusal/failure states include tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected result shape, cache/freshness unobservable, and internal adapter contract violation.
- `NativeGritReport`: parsed native report with paths and native results. It is raw adapter output, not Habitat check truth.
- `DiagnosticProjection`: mapping from native Grit results to Habitat diagnostics for selected D2 rule identities.
- `DiagnosticRunOutcome`: D6-published outcome for a selected diagnostic entry: clean, findings, scan-root refusal, adapter failure, projection miss, unexpected pattern identity, or freshness refusal.
- `InjectedProbeInput`: temporary diagnostic probe request with rule id, pattern identity, probe path, body, control path, control body, expected diagnostic, scope, and clean-final-status requirement.
- `InjectedProbeOutcome`: D6 result for one injected probe: success, validation refusal, adapter failure, projection miss, unexpected control finding, cleanup/final-status failure.
- `DiagnosticConsumerProjection`: narrow D6 DTO consumed by D7/D8/D9/D11/D15. It must not expose whole rule rows or raw adapter internals unless a consumer-specific operation requires them.

### Relationships

- `rule_declares_grit_diagnostic`: `RuleGritFacts -> DiagnosticCatalogEntry`.
- `diagnostic_entry_matches_pattern`: `DiagnosticCatalogEntry -> PatternIdentity`.
- `diagnostic_entry_requests_scan_roots`: `DiagnosticCatalogEntry -> ScanRootDecision`.
- `scan_root_decision_builds_request`: `ScanRootDecision -> NativeGritCheckRequest`.
- `native_request_returns_adapter_outcome`: `NativeGritCheckRequest -> GritAdapterOutcome`.
- `adapter_report_projects_to_diagnostics`: `NativeGritReport -> DiagnosticProjection`.
- `projection_targets_rule`: `DiagnosticProjection -> ruleId`.
- `projection_matches_pattern`: `DiagnosticProjection -> PatternIdentity`.
- `probe_exercises_diagnostic_entry`: `InjectedProbeInput -> DiagnosticCatalogEntry`.
- `probe_result_has_consumer_projection`: `InjectedProbeOutcome -> DiagnosticConsumerProjection`.
- `d7_consumes_diagnostic_outcome`: D7 consumes `DiagnosticRunOutcome`; D7 assembles reports.
- `d8_consumes_diagnostic_capability`: D8 consumes diagnostic availability/result references; D8 decides pattern lifecycle.
- `d9_consumes_apply_approval_not_diagnostics`: D9 may consume findings as preconditions but cannot infer apply safety from D6.
- `d11_consumes_staged_diagnostics`: D11 consumes D6 staged diagnostic outcomes as local feedback only.

### Accepted Outcome Families

- `diagnostic-clean`: native command parsed; selected diagnostic had no projected findings.
- `diagnostic-findings`: native command parsed; selected diagnostic projected one or more Habitat diagnostics.
- `scan-root-accepted`: requested roots are approved and exist.
- `scan-root-expanded-to-test-files`: ignored test directory root is expanded to exact candidate files for test-scoped rules.
- `native-report-parsed`: adapter parsed a valid native report before projection.
- `injected-probe-detected`: probe path produced expected unbaselined diagnostic, control path did not, cleanup state recorded.
- `cache-freshness-observed`: command provenance states fresh/cache status when required.

### Refusal/Failure Outcome Families

- `invalid-grit-facet`: D2 projection missing required Grit facts for a Grit diagnostic.
- `scan-root-empty`
- `scan-root-outside-repo`
- `scan-root-missing`
- `scan-root-generated-output`
- `scan-root-protected`
- `scan-root-unapproved`
- `scan-root-injected-probe-root-without-probe-mode`
- `grit-tool-unavailable`
- `grit-command-failed`
- `grit-output-empty`
- `grit-output-malformed`
- `grit-output-schema-drift`
- `grit-output-unexpected-result-shape`
- `grit-output-truncated`
- `grit-pattern-projection-miss`
- `grit-unexpected-pattern-identity`
- `grit-cache-freshness-unobservable`
- `injected-probe-metadata-missing`
- `injected-probe-pattern-identity-mismatch`
- `injected-probe-path-outside-scope`
- `injected-probe-path-already-exists`
- `injected-probe-path-ignored`
- `injected-probe-control-produced-diagnostic`
- `injected-probe-cleanup-dirty`
- `diagnostic-adapter-internal-contract-violation`

Apply-specific failures currently in `grit-failures.ts` such as dirty worktree, dry-run mismatch, unexpected file, missing target export, and rollback failure must move to or be modeled by D9. D6 may note current compatibility, but it must not encode apply transaction failures as diagnostic catalog states.

## Naming Recommendations

### Accepted Target Terms

- `diagnostic`
- `diagnostic catalog`
- `diagnostic catalog entry`
- `pattern identity`
- `rule id`
- `scan root`
- `scan root decision`
- `native Grit check request`
- `adapter outcome`
- `adapter failure`
- `native report`
- `diagnostic projection`
- `diagnostic run outcome`
- `injected probe`
- `probe result`
- `command outcome`
- `refusal`
- `prohibited inference`
- `fresh command result` or `freshness-observed result`

### Terms To Reject Or Narrow

- `proof`: use only in historical/source packet references or D1 compatibility language. In D6 target language, use `diagnostic outcome`, `probe result`, `adapter outcome`, or `command outcome`.
- `evidence`: in D6 product/types, prefer `result`, `outcome`, `command output`, `source citation`, or `prohibited inference`.
- `diagnostic pattern`: ambiguous because it can mean a native Grit pattern, a Habitat rule, or a governed pattern. Use `diagnostic catalog entry` or `Grit pattern identity`.
- `pattern catalog entry`: too close to D8 Pattern Authority. Use `diagnostic catalog entry`.
- `rule admission`: D8 owns admission. D6 may say "diagnostic availability" or "diagnostic capability".
- `apply candidate`: D8/D9 term, not D6.
- `current-tree proof`: use `current-tree diagnostic run outcome`.
- `native sample proof`: use `native Grit fixture result`.
- `injected-violation proof`: use `injected probe result` or `injected diagnostic probe result`.
- `cache provenance`: acceptable only when naming command provenance fields; otherwise use `cache/freshness observation` or `freshness decision`.
- `ok: boolean`: not target language for D6 outcomes. Use closed outcome states.

### Challenge To Packet Title

`Diagnostic Pattern Catalog` is barely acceptable, but it is dangerous. "Pattern Catalog" sounds like D8 owns it. If the title remains, the spec must define that "catalog" means "diagnostic capability catalog", not governance catalog or apply catalog. Stronger title: `Grit Diagnostic Catalog` or `Diagnostic Capability Catalog`. If the change slug cannot move, the packet should still normalize internal language to `diagnostic catalog entry`.

## P1 Findings

### P1-1: D6 OpenSpec scaffold drops the source packet's core state model

The source D6 packet explicitly requires Grit diagnostic states for unavailable tool, parse failure, scan-root refusal, clean result, findings result, cache/freshness unobservable, and injected-probe failure. The current spec delta has only two scenarios: successful findings and diagnostic cannot run.

That is not a full domain contract. It cannot tell implementation how to distinguish scan-root refusal from adapter failure, parse failure from schema drift, clean result from projection miss, or cache/freshness unobservable from D15 trigger. The execution agent would have to invent the central state model while coding.

Required repair: add normative requirements and scenarios for every D6 outcome family listed in this investigation. At minimum: valid diagnostic facet, malformed/missing Grit facet, scan-root accepted/refused, native request built, tool unavailable, command failed, no JSON, malformed JSON, schema drift, unexpected shape, clean result, findings result, projection miss, unexpected pattern identity, freshness unobservable, valid injected probe, probe metadata refusal, probe detection success, probe control failure, and probe cleanup/final-status failure.

### P1-2: D6 does not define diagnostic identity and therefore cannot protect D8/D9 boundaries

Current code maps selected rules to `rule.gritPattern ?? rule.id`, matches native `local_name` or `check_id`, and projects findings back to `ruleId`. That fallback is a compatibility fact, not a target ontology. D2's downstream ledger states D6 may design against `ruleGritFacts`, diagnostic identifiers, and execution adapter ids only after D2 provides Grit projections and removes pattern-id fallback.

The current D6 packet says "pattern catalog entries" and "detector identity" but does not define whether identity is `ruleId`, `gritPattern`, native `local_name`, native `check_id`, or a D6 catalog entry id. That leaves a direct ambiguity where a diagnostic can be confused with a governed pattern or apply-approved pattern.

Required repair: define identity rules:

- `ruleId` is D2-owned Habitat rule identity.
- `patternIdentity` is the Grit-native diagnostic pattern identity.
- `diagnosticCatalogEntryId` is D6-owned and must bind one `ruleId` to one accepted `patternIdentity`.
- Native result identity resolution must define precedence and mismatch refusal.
- D6 must not fall back from missing `gritPattern` to `ruleId` unless D2 explicitly models that as a valid `ruleGritFacts` state.

### P1-3: D6 has no published consumer projection for D7/D8/D9/D11/D15

D7 must consume Grit projections without reading Grit internals. D8 must consume diagnostic availability/proof references without letting D6 admit patterns. D9 must not treat diagnostics as apply safety. D11 must consume staged diagnostics as local feedback. D15 must receive only a trigger condition when local D6 DTOs cannot encode provenance.

The current packet names consumers but does not define a D6-published result shape. That invites each downstream packet to import raw `grit.ts` concerns or to re-derive D6 semantics.

Required repair: define `DiagnosticConsumerProjection` with fields such as `ruleId`, `diagnosticCatalogEntryId`, `patternIdentity`, `scanRootDecision`, `adapterOutcomeKind`, `diagnosticOutcomeKind`, `diagnostics`, `limitations`/`prohibitedInferences`, `freshnessDecision`, and optional `probeOutcome`. Also define which fields are hidden from each consumer.

### P1-4: Adapter failures are not separated from apply transaction failures

`grit-failures.ts` currently contains both diagnostic adapter failures and apply transaction failures. D6 may use this as present-behavior evidence, but the D6 packet must not bless this mixed taxonomy as target language.

D6 owns diagnostic adapter failures such as unavailable tool, command failed, no JSON, malformed JSON, schema drift, unexpected shape, empty scan roots, projection miss, unexpected pattern identity, cache/freshness missing, and internal adapter contract violation. D9 owns dirty worktree, dry-run mismatch, unexpected file, missing target export, and rollback failure.

Required repair: D6 spec must split failure taxonomy by owner and state that apply-specific current tags are compatibility facts until D9 remodels them. D6 cannot define "Grit failure states" as one shared family.

### P1-5: Injected probe language still models proof instead of probe outcome

Current code names `InjectedGritProbeResult.proofClass: "injected-violation"` and messages such as "Injected proof requires a registered Grit check rule." D1 and the remediation frame explicitly challenge proof/evidence terminology. D6's target packet currently repeats "injected-violation proof" without deciding whether that is target-retained or compatibility.

This is a domain problem, not a naming nit. "Proof" encourages downstream packets to treat the probe result as governance admission, current-tree cleanliness, or apply safety. D6 owns an injected diagnostic probe result: a scoped temporary case that exercises one diagnostic pattern and reports what happened.

Required repair: target language must be `InjectedProbeInput`, `InjectedProbeOutcome`, and `injected diagnostic probe result`. If `proofClass` must remain public, D0/D1 must classify it as compatibility and D6 must map it to target probe-result language.

## P2 Findings

### P2-1: Scan-root derivation is under-modeled

The source D6 packet requires scan-root validation. Current code has meaningful domain decisions: standard roots, ignored test roots, exact test-file expansion, generated/protected root refusal, approved-root checks, and injected-probe root allowance. The OpenSpec scaffold only says "scan-root validation".

Required repair: add a scan-root ontology with accepted/refused states and explicit scenarios. The packet must say whether scan roots come from D2 `ruleGritFacts`, D6 default diagnostic roots, command input, or injected-probe input. It must also say which consumer sees the decision and which failure is reported.

### P2-2: Native Grit command request is not modeled as a command outcome

The source packet requires a native Grit command request and cache/freshness policy. Current `gritCheckRequest` includes command id, executable, argv, cwd, env, scan roots, cache policy, and prohibited inferences. The scaffold does not encode this command shape, so D15 trigger evaluation is impossible to reason about.

Required repair: define `NativeGritCheckRequest` and `GritCommandOutcome` in OpenSpec language. Include fields needed by D6 locally. Then state D15 triggers only if D6 cannot represent required command provenance locally without contradictory states.

### P2-3: Public surface impact is hand-waved through D0

The proposal says diagnostic output may gain clearer labels within D0 compatibility rules. That is insufficient for implementation readiness. D6 touches likely public or durable surfaces: `habitat check --tool grit-check --json`, `CheckReport` diagnostics, adapter failure human messages, exported Grit adapter functions/types, injected probe test helpers if exported, and docs/examples that cite proof names.

Required repair: enumerate D6-touched surfaces and mark each as D0-blocked until concrete rows exist. D6 should not ask implementation to discover this list.

### P2-4: Validation gates are incomplete and partially stale

The source D6 packet names `test/lib/grit-injected-probe.test.ts` and `test/grit/grit-patterns.test.ts`. The scaffold uses `test/lib/grit-adapter.test.ts test/lib/diagnostics.test.ts`, dropping injected-probe and native fixture validation from the gate. It also uses broad `bun run habitat check --json`, while D6's product scenario is specifically `habitat check --tool grit-check --json`.

Required repair: validation gates must include focused D6 tests: adapter parsing/failure states, scan-root refusals, projection identity tests, injected probe tests, native Grit fixture result, and command behavior for selected Grit diagnostics. Broad check output belongs as a D7 consumer or compatibility smoke only.

### P2-5: "Catalog" relationship to D2 registry and D8 Pattern Governance is generic

D2 says consumers should use projections, not whole rule rows. D8 says Pattern Authority owns candidate/registered lifecycle. D6 currently says "separate pattern catalog entries from Pattern Authority admission" but does not define the relationship.

Required repair: state:

> D6 consumes D2 `ruleGritFacts` and publishes diagnostic catalog entries. D8 consumes D6 diagnostic outcomes when evaluating Pattern Authority lifecycle. D8 owns whether a pattern is candidate, registered diagnostic, hook-scoped, apply-approved, refused, or retired. D6 owns only diagnostic capability and diagnostic run outcome.

### P2-6: D6 does not define limitations/prohibited inferences as part of the result

The source packet lists non-claims and stop conditions. Current code includes non-claims in `gritCheckRequest` and injected probe results. The OpenSpec scaffold does not require D6 outcomes to carry prohibited inferences.

Required repair: every D6 result family must state prohibited inferences, especially:

- native fixture result is not Habitat wrapper result;
- current-tree diagnostic run is not injected probe result;
- diagnostic finding is not baseline authority;
- diagnostic success is not pattern governance admission;
- diagnostic success is not apply safety;
- hook-staged diagnostic result is local feedback only;
- Grit command output is not CI or runtime/product behavior.

## P3 Findings

### P3-1: `Grit*` type names are acceptable only at adapter boundary

Use `Grit` in adapter-facing names: `NativeGritCheckRequest`, `GritAdapterOutcome`, `GritPatternIdentity`. Do not use `Grit` as a generic prefix for Habitat domain outcomes consumed by D7/D8/D11; use `DiagnosticRunOutcome`, `ScanRootDecision`, and `InjectedProbeOutcome`.

### P3-2: `detector identity` is vague

The proposal says Habitat records detector identity. Use one of the exact identities: `ruleId`, `patternIdentity`, or `diagnosticCatalogEntryId`. If "detector" remains, define it as display-only copy, not identity.

### P3-3: Closure checklist can pass while ontology is absent

The current closure checklist checks that design "resolves naming, domain owner, forbidden owners, and non-goals." It does not check that every source D6 state has a scenario, that identity relationships are defined, or that downstream consumer projections exist.

Required repair: add checklist items for competency questions, closed outcome families, identity mapping, scan-root state model, adapter failure ownership split, injected probe outcome model, D0 public-surface enumeration, and downstream consumer projection.

## Required Packet Repairs

1. Expand `specs/habitat-harness/spec.md` from two scenarios into a full D6 contract with separate requirements for diagnostic catalog entry identity, D2 `ruleGritFacts` consumption, scan-root decisions, native Grit command request, adapter outcomes, diagnostic projection, injected probe outcomes, freshness decisions, prohibited inferences, and downstream consumer projections.
2. Rewrite `proposal.md` to name the product scenario as diagnostic capability and diagnostic run outcome, not pattern admission, proof, or apply safety.
3. Rewrite `design.md` with the target domain model in this report: entities, identities, relationships, accepted states, refusal states, forbidden owners, and D15 trigger posture.
4. Rewrite `tasks.md` so implementation tasks are not placeholders. Each task should map to a D6 semantic slice: inventory D0 surfaces, consume D2 `ruleGritFacts`, define diagnostic catalog entry DTOs, define scan-root decisions, define adapter outcomes, define projection outcomes, define injected probe outcomes, define D7/D8/D9/D11/D15 consumer projections, and add required validation.
5. Update `workstream/phase-record.md` with exact D6 validation commands and expected outcomes, including `test/lib/grit-injected-probe.test.ts`, `test/grit/grit-patterns.test.ts`, and `bun run habitat check --tool grit-check --json`.
6. Update `workstream/review-disposition-ledger.md` with this investigation's accepted/rejected findings and keep D6 blocking until all P1/P2 repairs are complete.
7. Update `workstream/downstream-realignment-ledger.md` with owner-specific actions for D7, D8, D9, D11, and D15 instead of generic "later domino packets".
8. Update `workstream/closure-checklist.md` so design readiness requires closed competency questions and no unresolved P1/P2 issues, not just OpenSpec shape.
9. Challenge the title/term `Diagnostic Pattern Catalog`. If retained, define it as `diagnostic catalog`, not Pattern Authority catalog.

## Acceptance Blockers

D6 is blocked until:

- The packet defines the full D6 competency questions and answers them through normative scenarios.
- The packet defines diagnostic identities and forbids fallback identity semantics unless D2 explicitly supplies them.
- The packet defines D6-owned entities, relationships, accepted states, and refusal/outcome families.
- The packet separates diagnostic adapter failures from D9 apply transaction failures.
- The packet renames target "proof/evidence" language to diagnostic/probe/result/outcome language or records D0/D1 compatibility handling for retained proof-shaped surfaces.
- The packet defines the downstream `DiagnosticConsumerProjection`.
- The packet enumerates D0 public-surface compatibility prerequisites.
- The packet's validation gates test D6 semantics directly.
- The D6 review ledger records no accepted unresolved P1/P2 findings.

Until those repairs land, D6 must remain "not acceptable for design/specification" and must not authorize TypeScript implementation.
