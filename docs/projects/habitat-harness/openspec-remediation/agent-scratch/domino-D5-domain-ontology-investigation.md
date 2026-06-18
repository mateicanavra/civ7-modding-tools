# D5 Baseline Authority Domain/Ontology Investigation

## Grounding

Skills read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`

Primary sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/baseline.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`

## Verdict

Not accepted as current D5 design input.

D5 still has no accepted operational ontology. The OpenSpec packet names Baseline Authority but does not commit the identity model, accepted/refused state model, relationship semantics, or D7/D8 consumer contract strongly enough for implementation. The current design repeats broad phrases from the source packet while leaving the execution agent to invent the real model. Under ontology-design terms, this is noun harvesting plus generic edge inflation: `baseline`, `structural-debt record`, `manifest`, `external exception`, `projection`, `governance relation`, and `command outcome` are present as terms, but not as operational semantic commitments.

D5 must not advance while those concepts remain ambiguous. D5 owns baseline debt authority, shrink-only integrity, rule-introduction manifest acceptance/refusal, external exception projection, and the D5-published baseline authority projection/refusal result. D7 consumes D5 application/integrity results during enforcement/report construction. D8 consumes the D5 baseline authority projection/refusal and owns Pattern Governance lifecycle/admission. The current packet does not hold that boundary.

## Competency Questions D5 Must Answer

D5 acceptance requires the packet to answer these questions directly, with normative scenarios and named result shapes:

1. For a registered rule, which baseline source is authoritative: explicit baseline file, external exception source projection, or refusal?
2. For an explicit baseline file, is it an explicit empty baseline, explicit debt baseline, malformed source, missing required source, or orphan source?
3. For an external exception source, what projection is accepted, which owner/migration owner is accountable, and how is projection equality validaten against parser-owned baselined diagnostics?
4. For current-tree integrity, did the baseline shrink or stay stable, did an existing rule grow, did comparison input fail, or did a new rule seed debt under an accepted rule-introduction manifest?
5. For `--expand-baseline`, is the write accepted for an introduced rule or refused before any file write?
6. What exact `BaselineAuthorityResult` or `BaselineAuthorityRefusal` does D5 publish for D7 and D8?
7. Which D5 surfaces are public, internal, command-only, JSON-stable, test-only, or D0-blocked compatibility surfaces?

If any question is answered only by prose such as "baseline state lifecycle", "owning remediation path", "governance relation", or "baseline decision", the packet is not accepted.

## P1 Findings

### P1-1: The packet does not define D5's accepted/refused ontology

The source D5 packet requires explicit empty, explicit debt, external exception, malformed, missing, orphan, introduced-rule expansion, and shrink-only failure states at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:31`. It also calls out contradictory guard states and incomplete external exception projection/validation as the core state-space problem at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:52`.

The OpenSpec delta collapses that into one requirement and two scenarios at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:3`. "Existing debt is checked" and "New debt appears" do not encode the source state model, refusal states, external projection states, or rule-introduction states.

Target repair: D5 must model accepted baseline authority separately from refusals:

- `AcceptedBaselineAuthority`: explicit empty, explicit debt, or external exception projection.
- `BaselineAuthorityRefusal`: malformed baseline, missing baseline, orphan baseline, unmodeled external exception, external source unreadable/malformed, external projection mismatch, parser-owned explicit-baseline mismatch, comparison base unavailable, base registry missing/malformed, base baseline unreadable, existing-rule baseline growth, rule-introduction manifest missing, or rule-introduction manifest mismatch.

No implementation should start until those accepted/refused cases exist as normative OpenSpec scenarios.

### P1-2: "Debt row" is the wrong ontology root and conflates four identities

The proposal says the product needs to "connect each structural-debt record to owning rules and governance" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:23`, and the spec says a violation matches an "matched baseline entry" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:7`.

That language is not acceptable. It conflates:

- a `DiagnosticKey`: stable identity for a diagnostic, currently path plus message in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:148`;
- a `BaselineEntry`: a sorted unique JSON string entry in a Habitat baseline file;
- an `ExternalExceptionProjectionEntry`: a projected diagnostic key from a non-baseline source;
- a `BaselineApplicationMatch`: the result of applying an accepted projection to live diagnostics.

A "structural-debt record" might mean any of these. It might also imply a governance lifecycle record, which D5 must not own. This ambiguity is a stop-condition class issue because D5 cannot publish a stable D7/D8 projection if its primary identity is unclear.

Target repair: replace "structural-debt record" and "matched baseline entry" with `diagnostic key`, `baseline entry`, `external exception projection entry`, and `baseline application match`, depending on the operation.

### P1-3: D5/D8 ownership is still ambiguous and can steal Pattern Governance admission

The current proposal and design say D5 will "D5 publishes baseline authority projection/refusal results for D7 and D8" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:28` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:25`.

That phrase fails the authority test. D8 explicitly owns Pattern Authority lifecycle/admission, and says Baseline Authority does not decide pattern lifecycle at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md:15`. D5 should publish the baseline authority projection/refusal that D8 consumes. It should not "connect to Pattern Governance lifecycle/admission" as if D5 is a co-owner of admission.

Target repair: replace all D5/D8 wording with a one-way consumer contract:

> D5 consumes D2 baseline facets and publishes a `BaselineAuthorityResult` for each rule. D8 consumes that result when evaluating Pattern Authority lifecycle/admission. D8 owns admission decisions; D5 owns only baseline authority acceptance/refusal.

### P1-4: External exception language does not distinguish source, projection, and baseline authority

The source packet asks D5 to define external exception source variants so incomplete projection/validation combinations cannot exist at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:64`. Current code shows why: `ExternalExceptionSourceModel` allows optional `projectedKeys`, optional `projectKeys`, and optional `validate` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:109`. The packet does not repair this ontology.

"External exception baseline" should be rejected. The external artifact is not a Habitat baseline file. It is an external exception source. D5's accepted authority is the projection from that source into diagnostic keys, plus validation/validatenance. The authoritative object for consumers is the projection result, not the source file.

Target repair: define variants such as:

- `FixedExternalExceptionProjection`: source path, owner, migration owner, fixed sorted diagnostic keys, validation rule.
- `DerivedExternalExceptionProjection`: source path, owner, migration owner, projection function identity, validation rule, produced sorted diagnostic keys.
- `ExternalExceptionProjectionRefusal`: unreadable source, malformed source, unsorted produced keys, or projection mismatch against parser-owned baselined diagnostics.

The accepted projection must include validatenance and owner/migration owner. D7 may consume the projection to construct reports; D8 may consume the projection/refusal as a baseline requirement input. Neither consumes the raw optional source model.

### P1-5: Rule-introduction manifest acceptance/refusal is not specified as authority

The source D5 packet says baseline expansion must stay behind a typed introduction guard at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:71`. Current code has the relevant manifest fields at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:90` and still has boolean guard output at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:223`.

The OpenSpec packet only says "introduction manifest relation" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:14`. That is not an authority model. The manifest either authorizes exactly one seeded baseline projection for a rule that is new relative to the comparison base, or it refuses.

Target repair: define `RuleIntroductionBaselineManifest` as a D5 authority input with required fields: `changeId`, `ruleId`, `ownerProject`, `ownerTool`, `baselinePath`, `initialDiagnosticKeys`, and `comparisonBase`. Define acceptance as exact match against requested rule, requested path, requested sorted keys, and requested comparison base. Define refusals for missing manifest, mismatch, and existing-rule growth.

## P2 Findings

### P2-1: D5 has no published consumer result for D7/D8

D7 says it consumes baseline application/integrity results and must not leak baseline internals into enforcement stages at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:31`. D8 says registration consumes the D5 baseline contract at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md:48`.

D5 currently names "baseline authority projection/refusal result" in `design.md` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:42`, but does not define it. Without that result, D7 and D8 either re-derive D5 semantics or import internal baseline state.

Target repair: define `BaselineAuthorityResult`:

- `kind`: `accepted-baseline-authority` or `baseline-authority-refusal`;
- `ruleId`;
- for accepted: `sourceKind` (`explicit-empty`, `explicit-debt`, `external-exception-projection`), `diagnosticKeys`, `locked`, `baselinePath` or `sourcePath`, `ownerProject`, `ownerTool`, optional `migrationOwner`;
- for refusal: `reason`, `path`, `message`, `remediationOwner` if known, and whether the refusal blocks D7 reporting, D8 registration, or both;
- `integrityResult`: clean, shrink-only clean, introduced-rule accepted, or refusal.

D7 may construct check reports from this result. D8 may gate Pattern Governance from this result. Neither may define a second baseline contract.

### P2-2: The current packet uses generic relationship words instead of typed relationships

The design tells authors to use "metadata projections", "command outcomes", and "handoff records" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:34`, but D5 needs typed relationships:

- `rule_has_baseline_authority`: Rule -> AcceptedBaselineAuthority or BaselineAuthorityRefusal.
- `baseline_file_contains_entry`: BaselineFile -> BaselineEntry.
- `external_source_projects_key`: ExternalExceptionSource -> DiagnosticKey.
- `baseline_entry_matches_diagnostic`: BaselineEntry -> HabitatDiagnostic.
- `manifest_authorizes_seeded_entry`: RuleIntroductionManifest -> BaselineEntry.
- `integrity_check_compares_against`: BaselineIntegrityCheck -> ComparisonBase.
- `baseline_result_consumed_by`: BaselineAuthorityResult -> D7 or D8 consumer.

These are not RDF requirements. They are semantic commitments that TypeScript unions and OpenSpec scenarios can encode. Without them, broad phrases like "owner/rule/governance relation" remain generic edges.

### P2-3: Public compatibility surfaces are delegated to D0 but not enumerated

The proposal says check output may change within D0 compatibility rules at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:62`, and the source packet says D0 must classify baseline error JSON stability at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:82`.

That is not enough. D5 cannot ask D0 to classify "everything" after the fact. The packet must enumerate the D5 compatibility surface before implementation:

- baseline JSON files under `tools/habitat-harness/baselines/*.json`;
- rule registry baseline facet/projection from D2;
- `--expand-baseline` behavior and refusal messages;
- `habitat check --rule baseline-integrity --json` output;
- baseline-related `habitat check --json` diagnostics consumed by D7;
- exported TypeScript baseline types/functions;
- Pattern Governance baseline requirement/projection consumed by D8;
- docs/examples showing baseline failures.

### P2-4: Verification gates do not validate the D5 authority claim

The source packet requires `bun run habitat check --rule baseline-integrity --json` as the current-tree baseline integrity validation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:126`. The OpenSpec proposal and phase record use broad `bun run habitat check --json` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:74` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md:20`.

For D5, broad check output is not the authority validation. It can be a D7 consumer validation later. D5 must require focused validation for baseline state, expansion guard, external projection, and integrity refusal cases.

Target repair: validation gates must include design-time OpenSpec validation separately from later implementation validation, and later validation must include `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts`, `bun run habitat check --rule baseline-integrity --json`, injected missing/malformed/orphan/growth/manifest mismatch cases, `git diff --check`, and `git status --short --branch`.

## P3 Findings

### P3-1: "Locked" is currently a code fact, not an accepted domain term

Current code marks explicit empty baselines as `locked: true` and debt/external states as `locked: false` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:53`. The packet does not decide whether "locked" is target language or a compatibility fact.

Recommendation: if accepted, define `locked` only as a compatibility projection for "this rule has an explicit empty baseline and any diagnostic is unbaselined current debt." Otherwise reject it and use `explicit-empty` plus shrink-only semantics. Do not let `locked` become a second authority model.

### P3-2: "Stale-row handling" should be split or removed

"Stale-row handling" appears in the proposal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:27`, but can mean orphan baseline file, removed diagnostic key, shrink-only deletion, retired rule, governance-retired pattern, or malformed comparison input.

Recommendation: delete the phrase unless the packet defines exact states. Use `orphan baseline file`, `removed baseline entry`, `shrink-only baseline deletion`, `retired rule baseline disposition`, or `comparison input refusal`.

### P3-3: Closure checklist can pass shape while semantics are absent

The closure checklist treats normative SHALL language and OpenSpec validation as design readiness at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md:5`. The current spec has SHALL language but not the D5 ontology.

Recommendation: add closure checks that every source D5 state has an OpenSpec scenario, every accepted/refused state maps to the target ontology, and D7/D8 consumer result shape is defined.

## Proposed Target Ontology

Use the smallest reviewed ontology that supports validation, classification, and consumer handoff. This can be encoded as OpenSpec scenarios and TypeScript unions; it does not require RDF/OWL.

### Core Entities

- `Rule`: D2-owned identity for a Habitat rule. D5 consumes only the baseline facet/projection.
- `DiagnosticKey`: stable identity for a diagnostic that may be baselined. Current evidence uses `path::message`.
- `BaselineFile`: Habitat-owned JSON file at `tools/habitat-harness/baselines/<rule-id>.json`.
- `BaselineEntry`: one sorted unique diagnostic key entry in a `BaselineFile`.
- `ExternalExceptionSource`: non-baseline source that may project diagnostic keys.
- `ExternalExceptionProjection`: D5-accepted projection from an external source to sorted diagnostic keys, with owner and migration owner.
- `RuleIntroductionBaselineManifest`: explicit authority input permitting seeded baseline entries for a new rule only.
- `ComparisonBase`: trusted git base used to decide whether a rule is existing or introduced.
- `BaselineIntegrityCheck`: shrink-only comparison of current baseline entries against the comparison base.
- `BaselineAuthorityResult`: D5-published accepted projection or refusal consumed by D7/D8.
- `BaselineApplicationResult`: D5-owned application/integrity result consumed by D7 report construction.
- `BaselineContractDiagnostic`: command/report diagnostic created from a D5 refusal.

### Accepted States

- `explicit-empty-baseline`: rule has an explicit baseline file with zero entries; diagnostics are new unbaselined debt.
- `explicit-debt-baseline`: rule has an explicit baseline file with sorted unique entries.
- `external-exception-projection`: rule has no Habitat baseline file but has a modeled external source whose projection is validated and sorted.
- `introduced-rule-baseline-accepted`: seeded entries for a rule absent from comparison base match an accepted manifest exactly.
- `shrink-only-clean`: no added entries relative to comparison base, or only deletions.

### Refusal States

- `missing-baseline`
- `malformed-baseline`
- `unsorted-baseline`
- `duplicate-baseline-key`
- `non-string-baseline-key`
- `orphan-baseline`
- `unmodeled-external-exception`
- `external-exception-source-unreadable`
- `external-exception-source-malformed`
- `external-exception-projection-mismatch`
- `parser-owned-baseline-without-contract`
- `comparison-base-unavailable`
- `base-rule-registry-missing`
- `base-rule-registry-malformed`
- `base-baseline-unreadable`
- `baseline-growth-existing-rule`
- `rule-introduction-manifest-missing`
- `rule-introduction-manifest-mismatch`

### Consumer Boundary

- D5 publishes `BaselineAuthorityResult` and `BaselineApplicationResult`.
- D7 consumes those results to build `CheckReport`; D7 does not load baseline files, inspect manifests, or define shrink-only policy.
- D8 consumes `BaselineAuthorityResult` as one Pattern Governance input; D8 decides lifecycle/admission.
- D2 owns rule metadata facets; D5 consumes the baseline facet and does not parse whole-rule prose.

## Rejected Terms

Reject or replace these before D5 acceptance:

- `structural-debt record`: use `diagnostic key`, `baseline entry`, `external exception projection entry`, or `baseline application match`.
- `matched baseline entry`: use `matched baseline entry` or `accepted baseline entry`.
- `external exception baseline`: use `external exception source` for the source and `external exception projection` for the accepted D5 authority.
- `baseline decision`: use `BaselineAuthorityResult`, `BaselineIntegrityResult`, `BaselineExpansionAccepted`, or `BaselineExpansionRefusal`.
- `governance relation`: use `D8 consumes BaselineAuthorityResult`; do not imply D5 admission authority.
- `owning remediation path`: use `ownerProject`, `ownerTool`, `ruleId`, `baselinePath`, `sourcePath`, `manifestPath`, and `remediationHint`.
- `orphan and removed-entry handling`: split into orphan baseline, removed baseline entry, shrink-only deletion, retired-rule disposition, or comparison-input refusal.
- `introduction manifest relation`: use `RuleIntroductionBaselineManifest acceptance/refusal`.
- `command outcome`: use `baseline contract diagnostic`, `baseline integrity finding`, or `baseline expansion refusal`.
- `metadata projection`: use the concrete projection name: `ruleBaselineFacts`, `ExternalExceptionProjection`, or `BaselineAuthorityResult`.

## Exact Language Repairs Required

### Proposal repairs

Replace the Product Scenario with:

> A registered Habitat rule emits diagnostics. Baseline Authority resolves the rule's baseline authority from D2 baseline facts and current baseline sources, then publishes either an accepted baseline projection or a refusal. Accepted projections may come from an explicit empty baseline, explicit debt baseline, or modeled external exception projection. Any accidental debt growth is refused unless an exact rule-introduction baseline manifest authorizes seeded entries for a rule that is new relative to the comparison base.

Replace "What Changes" with:

> - Define the accepted/refused baseline authority state model.
> - Define shrink-only integrity and rule-introduction manifest acceptance/refusal.
> - Define external exception source variants and their accepted projection contract.
> - Publish `BaselineAuthorityResult` and `BaselineApplicationResult` for D7/D8 consumers.
> - Enumerate D0 compatibility surfaces for baseline JSON, command JSON/messages, exported types/functions, and `--expand-baseline`.

Replace "D5 publishes baseline authority projection/refusal results for D7 and D8" with:

> Consume D2 baseline facets and publish D5 baseline authority results. D8 consumes those results and owns Pattern Governance lifecycle/admission.

### Design repairs

Add a "Target Ontology" section with the entities, accepted states, refusal states, and consumer boundary listed above.

Add "Competency Questions" using the seven questions in this document.

Replace generic language at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:34` with concrete accepted target terms:

> D5 target terms are `diagnostic key`, `baseline entry`, `external exception source`, `external exception projection`, `rule-introduction baseline manifest`, `baseline authority result`, `baseline authority refusal`, `baseline integrity result`, `baseline application result`, and `baseline contract diagnostic`.

Add public-surface inventory before implementation starts:

> D5 must classify baseline JSON files, D2 rule baseline facets, exported baseline types/functions, `--expand-baseline`, `habitat check --rule baseline-integrity --json`, baseline-related `habitat check --json` diagnostics, Pattern Governance baseline requirement inputs, and docs/examples through D0 before source implementation.

### Spec repairs

Replace the single requirement with at least these requirements:

1. `Requirement: Baseline Source Resolves To Accepted Authority Or Refusal`
   - Scenario: explicit empty baseline file resolves to accepted authority.
   - Scenario: explicit debt baseline file resolves to accepted authority.
   - Scenario: missing required baseline file refuses.
   - Scenario: malformed/non-array/non-string/duplicate/unsorted baseline refuses.
   - Scenario: orphan baseline file refuses.

2. `Requirement: External Exception Sources Project Diagnostic Keys`
   - Scenario: modeled fixed projection is accepted.
   - Scenario: modeled derived projection is accepted.
   - Scenario: declared but unmodeled external source refuses.
   - Scenario: unreadable or malformed external source refuses.
   - Scenario: external projection mismatch refuses.
   - Scenario: parser-owned baselining under explicit Habitat baseline refuses.

3. `Requirement: Baseline Integrity Is Shrink-Only`
   - Scenario: no added entries passes.
   - Scenario: deleted entries pass as shrink-only.
   - Scenario: existing rule adds entries and refuses.
   - Scenario: comparison base unavailable refuses.
   - Scenario: base rule registry missing/malformed refuses.
   - Scenario: base baseline unreadable refuses.

4. `Requirement: Rule Introduction Manifest Authorizes Seeded Baselines`
   - Scenario: new rule with exact manifest is accepted.
   - Scenario: new rule without manifest refuses.
   - Scenario: manifest with mismatched rule/path/keys/base refuses.
   - Scenario: existing rule cannot use introduction manifest to grow debt.

5. `Requirement: D5 Publishes Consumer Results Without Owning D7 Or D8`
   - Scenario: D7 consumes baseline application/integrity result to build reports.
   - Scenario: D8 consumes baseline authority result for Pattern Governance admission.
   - Scenario: D5 refusal is projected as a baseline contract diagnostic without D7/D8 redefining baseline authority.

### Task repairs

Replace implementation tasks 2.1-2.3 with:

> - Define accepted/refused baseline authority unions and OpenSpec scenarios.
> - Define explicit baseline file parsing states and refusal reasons.
> - Define external exception source variants and projection equality requirements.
> - Define shrink-only integrity result and rule-introduction manifest acceptance/refusal.
> - Define `BaselineAuthorityResult`, `BaselineApplicationResult`, and `BaselineContractDiagnostic` consumer surfaces.
> - Enumerate D0 compatibility surfaces and protected paths.
> - Add focused validation gates and injected bad cases.

Replace validation task 3.2 with:

> Run `bun run habitat check --rule baseline-integrity --json` and record exact output after implementation.

Keep broad `bun run habitat check --json` only as D7 consumer validation, not as D5 authority validation.

## Stop Conditions

D5 remains blocked if any of these remain true:

- The packet cannot distinguish `DiagnosticKey`, `BaselineEntry`, `ExternalExceptionProjectionEntry`, and `BaselineApplicationMatch`.
- The packet still says D5 "connects to D8 Pattern Governance lifecycle/admission" instead of publishing a result consumed by D8.
- External exception handling still has optional projection/validation paths instead of explicit source variants and projection/refusal states.
- Rule-introduction baseline growth can be described without exact manifest acceptance/refusal.
- D7 or D8 would need to inspect baseline files, manifests, or raw external source models to perform their work.
- D0 compatibility surfaces are not enumerated before source implementation.
- The OpenSpec spec delta lacks normative scenarios for every accepted/refused D5 state.

## Non-Claims

- This investigation does not accept D5 for implementation.
- This investigation does not edit D5 OpenSpec packet files or Habitat source.
- Current code/tests are semantic evidence only; they are not accepted target implementation.
- This investigation does not accept D7 or D8. It only defines the D5 boundary they must consume.
- This investigation does not validate command behavior or current-tree integrity.
