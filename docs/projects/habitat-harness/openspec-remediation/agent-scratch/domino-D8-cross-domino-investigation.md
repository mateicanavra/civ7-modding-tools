# D8 Cross-Domino Investigation

Status: BLOCKING

## Finding

D8 is not complete cross-domino input yet. The source packet correctly assigns
Pattern Governance as the exclusive owner of pattern lifecycle and admission,
but the current OpenSpec packet does not publish enough state, sequencing,
source-blocker, or downstream handoff detail for D9, D11, D13, and G-HOST to
consume D8 without inventing governance semantics later.

The blocking risk is not that D8 lacks any present implementation evidence.
Current code already has useful Pattern Authority manifest and generator
behavior. The risk is that current source names and tests are narrower than the
complete-standard D8 source packet: source code currently centers
`candidate`, `registered-advisory`, and `registered-enforced`, while the D8
source packet requires candidate draft, manifest-invalid candidate, registered
diagnostic pattern, registered hook-scoped pattern, registered apply-approved
pattern, refused pattern, and retired pattern states with explicit manifest,
fixture, baseline, hook-scope, false-positive, proof, and apply-safety
decisions.

D8 must become the complete published-language boundary for lifecycle and
admission before downstream packets proceed. D9 must not decide what
apply-approved means. D13 must not decide what generated candidate or registered
means. D11 must not infer hook-scoped pattern admission from rule-pack fields or
manifest strings. G-HOST must not receive host-specific pattern gates through
generic Pattern Governance prose.

## Sources Read

Skills and workflow authorities:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `AGENTS.md`

D8 packet and starter packet:

- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/proposal.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/design.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/tasks.md`

Accepted upstream design/spec packets and control records:

- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `openspec/changes/deep-habitat-d5-baseline-authority/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/design.md`

Downstream and adjacent source packets:

- `docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D13-starter packeting-and-refusal-contracts.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`

Downstream OpenSpec starter packets:

- `openspec/changes/deep-habitat-d9-transformation-transaction/{proposal.md,design.md,tasks.md}`
- `openspec/changes/deep-habitat-d10-protected-zone-authority/{proposal.md,design.md,tasks.md}`
- `openspec/changes/deep-habitat-d11-local-feedback/{proposal.md,design.md,tasks.md}`
- `openspec/changes/deep-habitat-d13-starter packeting-refusal-contracts/{proposal.md,design.md,tasks.md}`
- `openspec/changes/deep-habitat-host-policy-boundary-gate/{proposal.md,design.md,tasks.md}`

Present-behavior evidence only:

- `tools/habitat/src/rules/pattern-authority/manifest.ts`
- `tools/habitat/src/generators/pattern/generator.cjs`
- `tools/habitat/src/generators/pattern/registration.cjs`
- `tools/habitat/test/rules/pattern-authority-manifest.test.ts`
- `tools/habitat/test/generators/pattern-generator.test.ts`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`

## Dependency Map

| Dependency | D8 use | Current status | Source blocker | Downstream effect if missing |
| --- | --- | --- | --- | --- |
| D0 Command Surface Inventory | Public compatibility rows for generator options/output, manifest durable schema, rule-pack fields, command JSON/human messages, package exports, docs examples, and any generated/help surfaces touched by Pattern Governance | Accepted for design/specification only; not implementation-complete | D8 source implementation cannot change any public/durable surface until concrete D0 rows say preserve, version, facade, deprecate, refuse, document-only, or generated-only | D13 cannot know whether candidate generator output/schema is compatible; D9 cannot know whether apply-admission fields are public-compatible |
| D1 Receipt Contract Boundary | Refusal, command outcome, diagnostic, non-claim, and protected downstream-owned terminology families for missing manifest, manifest-invalid, baseline-refused, diagnostic-refused, hook-scope-refused, apply-safety-refused, and registration-refused states | Accepted for design/specification only; not implementation-complete | D8 starter packet currently omits D1 from `Requires`; source implementation must cite D1 output families and D0 rows before adding or changing refusals/messages | Downstream packets are forced to invent "proof" or error language for Pattern Governance failures |
| D2 Rule Registry Metadata Contract | `ruleGovernanceFacts`, `ruleGritFacts`, `ruleBaselineFacts`, and rule-pack references tying rule id, pattern identity, manifest path, lifecycle expectation, hook eligibility, and governance relation to D8 | Accepted for design/specification only; source implementation still waits for live projections | D8 may design against D2 projection contracts, but source implementation cannot parse whole `RuleRegistryRecord`, legacy `HarnessRule`, `lane`, `gritPattern`, `hookScope`, `manifestPath`, or prose `scope` as target authority after D2 projections exist | D13 and D9 can otherwise infer registration/apply approval from broad rule rows instead of D8 lifecycle |
| D5 Baseline Authority | `BaselineAuthorityProjection` and baseline refusal state consumed by D8 admission; D8 decides what lifecycle does with D5 result, not whether baseline debt/source/growth is valid | Accepted for design/specification only; not implementation-complete | D8 source implementation for registered states waits for D5 projection/refusal where baseline authority is required; D8 must not validate baseline files, expansion, external projections, or seeded debt locally | D9/D13 can otherwise treat baseline files or manifest strings as enough for apply/registration |
| D6 Diagnostic Pattern Catalog | Diagnostic capability, diagnostic identity, fixture/native sample result, injected probe outcome, current-tree diagnostic limitations, and non-claims | Accepted for design/specification only; not implementation-complete | D8 source implementation for registered diagnostic states waits for D6 diagnostic projections where diagnostic proof is required; D8 must not infer diagnostic identity from `gritPattern ?? ruleId` or Grit prose | D9 can otherwise mistake diagnostics for write safety; D11 can mistake staged Grit findings for hook admission |
| D7 Structural Enforcement Pipeline | Current-tree check outcome and structural report semantics for admission evidence when D8 requires Habitat wrapper current-tree proof or hook-scoped enforcement readiness | Accepted for design/specification only; not implementation-complete | D8 can define lifecycle state requirements now, but source acceptance of current-tree check evidence that depends on D7 must wait for D7's check outcome projection and non-claims | D11/D9 can otherwise reinterpret check pass/fail as hook or apply approval |
| D10 Generated/Protected Zone Authority | Protected/generated-zone guard decisions for pattern scan roots, candidate/probe roots, apply paths, and protected-zone write refusals when lifecycle or apply admission touches host-owned generated/protected areas | Draft/blocking; not accepted | D8 must not accept apply-approved or hook-scoped lifecycle claims for paths requiring generated/protected-zone authority until D10 has an accepted contract; D8 must consume D10, not define protected-zone policy | D9 can otherwise approve writes into protected zones; D11 can otherwise localize protected-zone failures without owner/recovery guidance |

The current D8 starter packet lists D0/D2/D5/D6 but not D1, D7, or D10. That is
insufficient. D1 is mandatory for complete refusal/output semantics. D7 is
mandatory wherever D8 treats Habitat check/current-tree results as admission
evidence. D10 is mandatory wherever lifecycle, probes, scan roots, or apply
approval touch generated/protected zones.

## Downstream Handoff Model

D8 must publish a closed Pattern Governance state model. Downstream packets may
consume D8 projections; they may not inspect current manifest code, rule-pack
rows, Grit markdown, baseline files, hook fields, or generator options to
recreate lifecycle semantics.

Required D8 state families:

- `candidate-draft`: generated draft only; not an active rule, not a Grit
  diagnostic catalog entry, not hook-scoped, not baselined, not apply-approved.
- `manifest-invalid-candidate`: candidate with malformed, placeholder,
  contradicted, orphan, Grit-only, Nx-options-only, missing-source, or
  missing-proof state; cannot be promoted.
- `registered-diagnostic-pattern`: registered as diagnostic/check only with
  accepted manifest, D2 governance/Grit relation, D5 baseline projection, D6
  diagnostic capability/proof, fixture strategy, false-positive model,
  current-tree disposition, and `not-apply` apply-safety decision.
- `registered-hook-scoped-pattern`: registered enforced diagnostic pattern plus
  explicit hook-scope decision, D6 staged diagnostic capability as applicable,
  D7 check projection where hook-scoped enforcement depends on structural check
  outcome, and D11-owned local-feedback non-claims preserved.
- `registered-apply-approved-pattern`: registered apply pattern with explicit
  apply-safety decision and D9 handoff inputs; diagnostic registration never
  implies apply safety.
- `refused-pattern`: refusal with owner, reason, failed dependency result, next
  safe action, public-surface handling, and non-claims.
- `retired-pattern`: no longer admitted for new enforcement/apply/hook use,
  with replacement or removal guidance and downstream cleanup owner.

Required downstream ledger rows:

| Downstream surface | Disposition | Required D8 handoff row |
| --- | --- | --- |
| D9 Transformation Transaction | Blocked until D8 publishes apply-admission projection | Add a D9 row stating: D9 consumes only `registered-apply-approved-pattern` or explicit apply-refusal from D8, plus pattern id, manifest path, approved apply pattern identity, D8 apply-safety proof fields, D10/G-HOST path/gate references when applicable, and non-claims. D9 may not promote diagnostics to writes, approve apply roots, decide fixture sufficiency, or accept a `grit-check` manifest as apply-safe. |
| D11 Local Feedback | Indirect consumer through D7/D9/D10, with a direct hook-scope admission guard where D8 marks a pattern hook-scoped | Add a D11 row stating: D11 consumes D8 hook-scope admission only as a published eligibility projection and still owns hook sequencing, staged-file policy, local output, and local-feedback non-claims. D11 may not infer hook eligibility from `hookScope`, rule lane, manifest strings, or current generator options. |
| D13 Generator And Refusal Contracts | Blocked for pattern candidate semantics and registration handoff until D8 publishes candidate/registration contract | Add a D13 row stating: D13 may create `candidate-draft` artifacts only through the D8 candidate contract and must hand registration requests to D8. D13 must preserve candidate-only output, refuse registered-without-manifest or candidate-with-active-rule collisions before writes, and must not write active `.grit`, `rules.json`, baseline, hook, or apply states by implication. |
| G-HOST Host Policy Boundary Gate | Adjacent authority, not governed by D8; D8 consumes host declarations for host-specific apply gates and protected/generated-zone references | Add a G-HOST row stating: G-HOST owns host declarations, generated/protected-zone ownership, host-specific apply gates, unsupported host starter packet kinds, and host-policy missing refusals. D8 may reference host-policy declarations in lifecycle/apply decisions but may not encode Civ/MapGen host semantics inside Pattern Governance. Missing host policy yields a D8 refusal only after naming G-HOST as the owner. |
| D7 Structural Enforcement Pipeline | Upstream evidence source and downstream enforcement consumer, depending on state | Add a D7 row stating: D8 consumes D7 check outcomes only as current-tree evidence/non-claims for admission; D7 may consume only D8's registered/hook-scoped eligibility projection when selecting active pattern-related rules. D7 may not decide lifecycle, fixture sufficiency, false-positive model, hook scope, or apply approval. |
| D2/D5/D6 upstream packets | Source-blocking prerequisites, not downstream design owners | Add rows stating that D8 consumes D2/D5/D6 projections and never reimplements registry, baseline, or diagnostic authority locally. |
| Packet index | Pending D8 final rereviews | Keep D8 BLOCKING until D8 repairs proposal/design/tasks/spec/downstream ledger and final per-domino reviews find no unresolved accepted P1/P2 blockers. |

## Source Blockers

D8 source implementation must not start until these blockers are represented in
the packet and satisfied by the later implementation phase:

| Blocker | Required before D8 source edits |
| --- | --- |
| Public/durable compatibility | Concrete D0 rows for every touched generator option/output, manifest schema/location, rule-pack field, command message, command JSON, package export, docs example, and generated/help surface. |
| Refusal/output semantics | D1 output-family citations for missing manifest, malformed manifest, placeholder manifest, contradicted manifest, orphan manifest, baseline refusal, diagnostic refusal, hook-scope refusal, apply-safety refusal, retired pattern use, and registration refusal. |
| Registry projection availability | Live D2 `ruleGovernanceFacts` and `ruleGritFacts` where D8 reads rule-pack relation; D8 must not read whole registry rows or use legacy field presence as target lifecycle authority. |
| Baseline projection availability | Live D5 `BaselineAuthorityProjection` or baseline refusal where registration depends on baseline contract. D8 must not decide baseline load, shrink-only, external exception, or seeded-debt validity. |
| Diagnostic projection availability | Live D6 diagnostic capability, native fixture/sample, current-tree diagnostic, injected probe, limitation, and non-claim projections where diagnostic admission depends on them. D8 must not use native Grit or Grit markdown alone as admission proof. |
| Current-tree check evidence | Accepted D7 check outcome projection where D8 treats Habitat wrapper current-tree result as admission evidence. D8 must not infer structural pass/fail from `CheckReport.ok` or current command strings. |
| Protected/generated-zone authority | Accepted D10 guard/refusal contract, backed by G-HOST, where scan roots, probe paths, candidate paths, or apply paths touch generated/protected zones. |
| Lifecycle model mismatch | The D8 packet must either adopt current `candidate`, `registered-advisory`, and `registered-enforced` names as compatibility projections or supersede them with complete-standard state names before source changes. Current code does not by itself satisfy `registered diagnostic`, `registered hook-scoped`, `registered apply-approved`, `manifest-invalid`, `refused`, and `retired` state requirements. |
| Apply admission | D8 must publish `not-apply`, `apply-refused`, and `apply-approved` states separately from diagnostic registration. A `grit-check` diagnostic manifest cannot claim apply safety; a `grit-apply` manifest cannot rely on D6 diagnostic proof alone. |
| Hook admission | D8 must publish hook-scope admission/refusal separately from D11 local hook execution. A rule-pack `hookScope` field is not enough without D8 lifecycle acceptance and D11 consumer non-claims. |

Present source evidence:

- `manifest.ts` validates `candidate`, `registered-advisory`, and
  `registered-enforced`, rejects several invalid manifest shapes, and carries
  baseline, hook, and apply fields. This is useful evidence but not the complete
  OpenSpec contract.
- `generator.cjs` creates candidate-only artifacts and refuses registered
  generation without a manifest. This supports D13 handoff but does not replace
  D8 packet language.
- `registration.cjs` can promote a registered check pattern after manifest and
  baseline checks. This is present behavior; D8 still needs complete lifecycle,
  downstream handoff, D0/D1 compatibility, and D2/D5/D6/D7/D10 blocker language
  before implementation closure.

## Packet Index/Status Requirements

Current D8 packet-index status must remain:

`incomplete packet; global constraints applied; per-domino adversarial gate BLOCKING`

D8 may update the packet index only after final rereviews pass and all accepted
P1/P2 findings are repaired. The acceptable post-repair row language is:

`accepted for design/specification; final domain/ontology, OpenSpec/information, TypeScript/validation, code/topology, and cross-domino rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation requires concrete D0 rows, D1 output-family citations, live D2 ruleGovernanceFacts/ruleGritFacts, D5 BaselineAuthorityProjection, D6 diagnostic projections, accepted D7 check outcome projection where current-tree admission evidence is consumed, and accepted D10/G-HOST protected-zone/host-policy contracts where scan roots, probes, apply paths, or host gates are touched`

Required index effects:

- Keep D8 `Requires` expanded to D0, D1, D2, D5, D6, D7 where current-tree
  check admission is consumed, and D10 where generated/protected-zone or apply
  path authority is consumed. If D7/D10 are conditional for a specific lifecycle
  state, state the condition directly in the row or a note; do not omit them.
- Keep D8 `Enables` as D9 and D13, and add a note that D11 consumes D8 only
  through hook-scope eligibility and D7/D9/D10 projections.
- Do not mark D9 or D13 implementation-ready until their rows cite the accepted
  D8 handoff records.
- Do not use current source tests as packet-index acceptance evidence. They are
  implementation evidence only after packet review acceptance and current gates.

## P1/P2 Blockers

### P1-D8-XD-01: D8 lifecycle is not complete-standard

The source packet requires lifecycle states for candidate draft,
manifest-invalid candidate, registered diagnostic pattern, registered
hook-scoped pattern, registered apply-approved pattern, refused pattern, and
retired pattern. The current OpenSpec packet only says "define pattern
lifecycle states and admission gates" and current code only exposes a narrower
three-state lifecycle plus field-level validation.

Required repair: D8 design/spec/tasks/downstream ledger must define the full
state family, each state's required sources, D2/D5/D6/D7/D10 dependencies,
refusal reasons, public-surface blockers, tests, non-claims, and downstream
projection.

### P1-D8-XD-02: D1/D7/D10 dependencies are missing or under-specified

D8 cannot be a complete packet without D1 refusal/output semantics. D8 also
depends on D7 wherever current-tree check outcomes are admission evidence and
on D10 wherever lifecycle/apply admission touches generated/protected zones.
The current packet omits those dependencies.

Required repair: D8 proposal/design/tasks must add D1 as a required upstream
packet. D7 and D10 must be modeled as required source blockers for the specific
D8 state families they affect, or as explicit non-consumed dependencies if D8
chooses not to claim those evidence classes in the packet.

### P1-D8-XD-03: D9 is still forced to decide apply admission

D9 source says Pattern Governance owns apply admission decisions, but the D8
starter packet does not publish the exact `registered-apply-approved-pattern`
projection. D9 would have to decide whether an accepted diagnostic manifest,
`ownerTool`, `applySafety.kind`, or Grit apply row is enough for writes.

Required repair: D8 must define apply-admission states and the exact D9 handoff:
pattern identity, manifest path, accepted apply proof fields, D10/G-HOST path
or gate references when applicable, refusal reasons, and non-claims.

### P1-D8-XD-04: D13 is still forced to decide candidate and registration semantics

D13 source says Pattern Governance owns registration, not candidate file
writing. The D8 starter packet does not publish the candidate artifact contract,
manifest-invalid state, registration request/refusal shape, or promotion
handoff. D13 would have to decide when candidate output is only a draft and
when a generator request is trying to register enforcement.

Required repair: D8 must publish candidate-only output semantics and
registration handoff/refusal states. D13 may write candidate artifacts only
through that contract and must not create active Grit patterns, rule-pack rows,
baseline files, hook-scope decisions, or apply approval by implication.

### P1-D8-XD-05: D8 can still leak baseline and diagnostic ownership

Current D8 language says registration consumes D2 metadata, D5 baseline
contract, and D6 diagnostic proof, but does not name the exact projections or
forbidden local decisions. That leaves implementation room to validate
baseline files or diagnostic identity inside Pattern Governance.

Required repair: D8 must state that D5 owns baseline authority and D6 owns
diagnostic catalog/projection. D8 consumes their published accepted/refused
states and decides lifecycle/admission only.

### P2-D8-XD-01: Downstream ledger rows are not exact enough

D8 has no durable per-downstream ledger rows for D9, D11, D13, G-HOST, D7, and
packet-index status. Generic "downstream docs/examples/specs/tests" language is
not enough for a high-fanout governance packet.

Required repair: Add the ledger rows listed in this investigation with allowed
facts, forbidden decisions, source-blocking status, and non-claims.

### P2-D8-XD-02: Validation gates do not cover lifecycle-state false positives

The current D8 validation gates are useful but incomplete. They do not name
bad cases for manifest-invalid candidate, retired pattern use, diagnostic-only
pattern used as apply-safe, hook-scoped state without D11-compatible admission,
baseline-refused registration, D6 diagnostic-refused registration, D7
current-tree failure evidence, or D10 protected-zone apply refusal.

Required repair: D8 tasks must include focused manifest/generator/registration
tests for each lifecycle/refusal family plus D0/D1 public-surface
characterization where output/schema changes.

### P2-D8-XD-03: Current code names can become accidental target language

Current source names such as `registered-advisory`, `registered-enforced`,
`authorityAccepted`, `baselineContract`, `hookScope`, and `applySafety` are
useful evidence, but the packet must decide whether they are target terms,
compatibility projections, or superseded historical wording.

Required repair: Add a D8 term-disposition table that maps current code fields
to complete-standard target terms and forbidden interpretations.

## Acceptance Bar

D8 becomes acceptable design/specification input only when a downstream agent
can implement D9, D11, D13, or G-HOST consumption by reading D8's OpenSpec
packet and downstream ledger, without opening current Pattern Authority source
to infer lifecycle semantics and without re-deciding D0 public compatibility,
D1 refusal/output families, D2 registry projections, D5 baseline authority, D6
diagnostic authority, D7 check evidence, D10 generated/protected-zone authority,
or G-HOST host policy.

The repaired D8 packet must leave no product, domain, naming, sequencing,
public-surface, testing, or downstream handoff decision for source
implementation agents to invent.
