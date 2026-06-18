# Domino D2 Cross-Domino Sequencing Investigation

## Objective

Review D2 Rule Registry Metadata Contract as a fresh cross-domino sequencing reviewer. This is design/specification review only. It does not implement source code and does not edit the D2 packet.

The review asks whether D2 leaves later implementation agents with one unambiguous metadata contract for downstream packets, or whether D3-D15/G-HOST can still interpret rule state differently.

## Verdict

Not acceptable. D2 remains blocking.

The current D2 OpenSpec scaffold names the right owner and the right problem, but it still leaves the core handoff undecided: which typed metadata facets exist, which consumer projections are allowed, which downstream packets consume each projection, and which malformed metadata states refuse before execution. That triggers the user's stop condition: downstream packets can interpret D2 state differently.

D2 must not be used for implementation until its packet defines the projection matrix and downstream ledger rows. D2 may continue through repair work as a design/specification packet only.

## Sources Read

Skills and workflow authorities:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`
- `.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `.agents/skills/civ7-systematic-workstream/SKILL.md`
- `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`

Repo and packet authorities:

- `AGENTS.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/README.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/global-cross-domino-sequencer.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`

D0/D1 accepted control status:

- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/downstream-realignment-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-cross-domino-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-cross-domino.md`

D2 OpenSpec scaffold:

- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/closure-checklist.md`

Downstream lookahead, limited to D2 dependency and contradiction checks:

- D3-D15/G-HOST source packets under `docs/projects/habitat-harness/phase2-workstream-packets/`
- D3-D15/G-HOST OpenSpec proposals under `openspec/changes/`

## Dependency Graph

Current accepted control state:

- D0 is accepted for design/specification only. It is not implementation-complete. Any D2 source implementation that touches public command, JSON, package export, root script, Nx target, generator, hook, or docs-example surfaces needs concrete D0 compatibility rows.
- D1 is accepted for design/specification only. It is not implementation-complete. D1 source work remains blocked until concrete D0 matrix rows exist. D2 may cite D1's accepted command/refusal/non-claim design, but D2 must not invent alternate malformed-metadata receipt language.

D2 prerequisites:

- D0 design/spec acceptance is available.
- D1 design/spec acceptance is available.
- D2 implementation remains blocked until D2 records exact D0 row dependencies and exact D1 malformed-metadata command/refusal semantics.

D2 direct consumers in the intended DAG:

| Consumer | D2 dependency | Allowed after repaired D2 design | Still blocked until D2 implementation |
| --- | --- | --- | --- |
| D3 Workspace Graph Boundary | graph intent facts: owner project/root relation, target alias policy input, dependency target input | D3 packet design can consume the D2 graph projection contract | Source that removes hard-coded roots/alias parsing or consumes live registry graph projections |
| D4 Orientation And Routing | routing facts and D3 graph facts | D4 design can name D2 routing projection plus D3 graph projection | Classify/orientation source behavior that depends on actual D2 projections |
| D5 Baseline Authority | baseline relation facts: rule identity, baseline state relation, introduction manifest relation | D5 design can define baseline states against D2 identity/baseline projection | Baseline source migration away from independent registry parsing |
| D6 Diagnostic Pattern Catalog | Grit/pattern facts and diagnostic handoff identifiers | D6 design can separate diagnostic catalog from governance using D2 Grit projection | Diagnostic implementation that assumes registry facet shape or malformed-row handling |
| D7 Structural Enforcement Pipeline | selector, routing, baseline, Grit, generated-zone, graph inputs through upstream projections | D7 design can name consumed upstream contracts | Check pipeline implementation or closure claims using D2 data |
| D8 Pattern Governance | governance relation facts and Pattern Authority manifest linkage | D8 design can consume D2 registry relation while owning lifecycle/admission meaning | Pattern admission implementation based on registry metadata |
| D10 Protected Zone Authority | generated-zone reference facts plus G-HOST host declarations and D1 refusals | D10 design can consume D2 generated-zone projection and G-HOST host-policy contract | Guard implementation that reads registry generated-zone facts |
| D13 Scaffolding And Refusal Contracts | supported rule/pattern/scaffold relation facts and governance relation | D13 design can consume D2/D8/G-HOST contracts | Generator/scaffold implementation that uses registry state to authorize support |

Indirect consumers:

- D9 consumes D2 only through D6/D8/D10.
- D11 consumes D2 only through D7/D9/D10, with pre-push graph behavior still tied to D3.
- D12 consumes D2 only through D3/D7.
- D14 consumes D2 only through D4/D12/D13.
- D15 is not a D2 consumer. It remains trigger-only through D6/D7/D9/D11.

## Allowed Metadata Handoffs

D2 should own registry declarations and consumer projections, not downstream decisions. The repaired D2 packet should make these handoffs explicit:

| D2 projection | D2-owned facts | Consumers | Facts D2 must not decide |
| --- | --- | --- | --- |
| `ruleIdentityFacts` | stable rule id, owner project, owner tool, lane, schema version | all rule consumers | public compatibility action; command receipt semantics |
| `ruleSelectorFacts` | selector vocabulary and selector-to-rule identity mapping | D7, D4, D6, D8 | execution status, diagnostic result, enforcement outcome |
| `ruleRoutingFacts` | structured path/surface routing facts replacing prose `scope` authority | D4, D7 | resolved Nx graph truth; user-facing orientation wording beyond routing state |
| `ruleGraphIntentFacts` | owner/root and target-alias inputs declared by registry metadata | D3, D4, D7, D12 indirectly | current Nx metadata, target availability, graph error classification |
| `ruleBaselineFacts` | baseline relation declared by a rule: required/empty/debt/external relation and introduction-manifest link | D5, D7, D8 | baseline load state, shrink-only behavior, expansion authorization, debt lifecycle |
| `ruleGritFacts` | `gritPattern`, scan root, adapter/tool relation, hook-scope declaration | D6, D7, D8, D11 indirectly | native Grit diagnostic normalization, pattern admission, apply behavior |
| `ruleGeneratedZoneFacts` | generated-zone reference and host declaration link | G-HOST, D10, D7, D9, D11 | host policy ownership, guard decision, regeneration authority, protected-zone refusal wording |
| `ruleGovernanceFacts` | registry link to Pattern Authority manifest/admission input | D8, D13, D9 indirectly | Pattern Authority lifecycle state, admission approval, fixture sufficiency, false-positive model |
| `ruleScaffoldFacts` | rule/pattern relation needed to decide whether generator output is a candidate or unsupported | D13, D14 indirectly | generator support policy, unsupported authoring refusal, host-specific scaffolding |

Forbidden cross-boundary handoffs:

- Whole rule records must not cross from D2 into D3/D5/D6/D7/D8/D10/D13 when a projection suffices.
- Human prose fields such as `why`, `message`, `remediate`, or legacy `scope` must not be routing, graph, baseline, hook, generated-zone, or governance authority.
- D2 must not use "metadata facet" to absorb D3 graph truth, D5 baseline authority, D6 diagnostic catalog, D8 Pattern Governance, G-HOST host policy, D10 guard decisions, D13 scaffold/refusal behavior, or D15 provenance substrate choices.

## Downstream Blocked And Allowed Decisions

Allowed now:

- D0 and D1 remain accepted as design/spec prerequisites.
- D2 review and packet repair can continue.
- G-HOST design should be allowed to proceed after D0/D1 as host-policy jurisdiction work if the packet index/proposal are repaired to match the source packet and global sequencing record. G-HOST must not wait on D2 for host-policy ownership, but D10 still needs both G-HOST and D2.

Allowed only after D2 design/spec repair, not source implementation:

- D3/D5/D6/D8/D10/D13 packet design may consume named D2 projection contracts.
- D7/D4/D12/D11/D14 packet design may cite D2 only through their upstream contracts.
- Downstream packet reviews may verify that they consume D2 projections without deciding D2 facts.

Blocked until D2 implementation:

- Any source edit that removes prose `scope` parsing as authority.
- Any source edit that removes duplicated owner-root or target-alias truth from plugin/graph paths.
- Any baseline, diagnostic, governance, protected-zone, hook, check, classify, verify, or generator implementation that depends on actual registry projection functions.
- Any downstream closure claim saying a consumer no longer interprets registry metadata locally.

Blocked until downstream owners implement their own packets:

- D3 resolved graph metadata and target availability.
- D5 baseline shrink-only/growth/refusal behavior.
- D6 diagnostic normalization and native/Grit failure taxonomy.
- D8 Pattern Authority lifecycle/admission.
- G-HOST host-policy declarations.
- D10 protected-zone guard decisions.
- D13 scaffold/refusal support.
- D15 substrate migration or shared provenance layer.

## Required Packet-Index Updates

D2-specific updates:

- Keep D2 status as blocking until this review's P1/P2 findings are repaired.
- After repair and rereview only, update D2 to "accepted for design/specification; not implementation-complete" and explicitly state source implementation remains gated by concrete D0 public-surface rows and D1 malformed-metadata/refusal semantics.
- D2's `Enables` cell should stay limited to packets that directly consume D2 projections. If G-HOST remains a D2 consumer, add G-HOST to D2 `Enables`; otherwise remove D2 from G-HOST `Requires`.

Cross-index consistency updates that affect D2 sequencing:

- Repair the current G-HOST contradiction. The source G-HOST packet says it is blocked by D0 and D1 and can proceed while D2-D6 proceed. The packet index and G-HOST proposal currently say G-HOST requires D0 and D2. Choose one authority. The cleaner repair is: G-HOST requires D0 and D1; D10 requires D2 and G-HOST.
- Ensure D10 remains `Requires: D0, D1, D2, G-HOST`.
- Ensure D13 remains `Requires: D0, D2, D8, G-HOST`, with D14 fence-language handling governed by the accepted global D14/D13 repair.
- Ensure D11's D3 pre-push graph condition is visible in the packet index or a split row before D11 implementation claims affected-target behavior.

## Cross-Domino P1 Blockers

### P1-D2-XD-01: D2-owned projection handoffs are not specified

D2's source packet lists typed facets and says consumers receive projections. The OpenSpec scaffold reduces this to broad language: "Define typed rule metadata facets and consumer projections." That leaves every direct consumer to decide what D2 facts mean.

Examples of divergent interpretations still possible:

- D3 can treat D2 graph metadata as alias/root truth, while D2 can later treat it as only an intent declaration.
- D5 can infer baseline authority from registry/file presence, while D2 can later define a baseline facet with different required states.
- D8 can treat Pattern Authority manifest status as registry-owned, while D2 can later treat it as a reference consumed by D8.
- D10 can define generated-zone metadata locally, while D2 can later expose a generated-zone facet that disagrees with G-HOST host declarations.

Required repair:

- Add a D2-owned projection matrix to `design.md`, `spec.md`, `tasks.md`, and `downstream-realignment-ledger.md`.
- Each row must name projection, fields, required/optional states, malformed metadata refusal, allowed consumers, forbidden fields, public-surface impact, and downstream packet.

### P1-D2-XD-02: D2 can still claim closure for downstream-owned authority

D2 currently names "graph facet", "baseline facet", "Grit facet", "generated-zone facet", and "governance facet" without drawing a hard line between registry declarations and downstream decisions. That lets D2 accidentally solve D3, D5, D6, D8, D10, or D13 locally.

Required repair:

- Add an explicit "D2 does not own" boundary table.
- For each facet, state whether D2 owns a declaration, a reference, an intent, or a projection only.
- Require downstream packets to consume D2 projections and refuse to reinterpret registry prose, while preserving downstream ownership of graph truth, baseline state, diagnostics, governance admission, protected-zone guards, and scaffolding/refusals.

### P1-D2-XD-03: D2's downstream realignment ledger is too generic for a high-fanout packet

The downstream ledger currently has one generic "Later domino packets" row. D2 directly enables or gates at least eight packets. Generic realignment is not enough; it leaves no durable record of which D2 projection each downstream packet may consume.

Required repair:

- Replace the generic row with per-packet rows for D3, D4, D5, D6, D7, D8, D10, D13, plus notes for indirect D9/D11/D12/D14 and trigger-only D15.
- Each row must state "allowed to design", "blocked until D2 implementation", or "not a D2 consumer."

## Cross-Domino P2 Blockers

### P2-D2-XD-01: G-HOST dependency is inconsistent across control artifacts

The source G-HOST packet says G-HOST is blocked by D0 and D1 and can run in parallel while D2-D6 proceed. The current packet index and G-HOST proposal say G-HOST requires D0 and D2. D2's own `Enables` cell does not list G-HOST.

This contradiction matters because it changes whether host-policy jurisdiction waits for registry metadata. It also affects D10, which correctly needs both D2 generated-zone facts and G-HOST host declarations.

Required repair:

- Align the packet index and G-HOST proposal with the chosen dependency shape.
- Recommended shape: G-HOST requires D0 and D1; D10 requires D0, D1, D2, and G-HOST. D2 does not enable G-HOST.

### P2-D2-XD-02: D2 implementation prerequisites do not name D0 row or D1 outcome dependencies

D2 says it requires D0 and D1, but the D2 packet does not list exact D0 public-surface rows or exact D1 command/refusal/non-claim semantics for malformed metadata.

Required repair:

- In D2 `design.md` and `tasks.md`, require a D0 row list before source implementation.
- In D2 `spec.md`, require malformed registry metadata to map to D1 command outcome/refusal semantics instead of D2-local proof or error language.

### P2-D2-XD-03: Downstream packet design can proceed too far without D2 implementation state labels

The current packet index says D2 enables D3/D4/D5/D6/D7/D8/D10/D13, but it does not distinguish design/spec consumption from source implementation. That can let a later packet treat accepted D2 design as live registry behavior.

Required repair:

- Add a status phrase to D2 and direct consumers: "Design may consume D2 projection contract after acceptance; source implementation/closure that depends on live registry projections waits for D2 implementation."

## Repair Recommendations

1. Add a `Registry Field Inventory` section to D2 `design.md`: current field, target facet, owner, target/compatibility status, consumers, and migration disposition.
2. Add a `Projection Matrix` section to D2 `design.md`: projection name, fields, consumers, downstream packet, forbidden source fields, malformed/refusal state, and public impact.
3. Expand D2 `spec.md` into separate requirements for schema versioning, identity, selector, routing, graph intent, baseline relation, Grit/pattern relation, generated-zone reference, governance reference, scaffold relation, and no-whole-record leakage.
4. Replace D2 implementation tasks with ordered steps only after the projection matrix exists. Each step should name files/modules/tests and the consumer being migrated.
5. Replace D2 downstream ledger's generic downstream row with direct/indirect consumer rows.
6. Add explicit D0 and D1 prerequisite language for source implementation: D0 row IDs for touched surfaces, and D1 refusal/outcome semantics for malformed metadata.
7. Repair G-HOST dependency inconsistency in the packet index and G-HOST proposal.
8. Keep D15 out of D2. D2 malformed metadata does not trigger D15; D15 remains local to D6/D7/D9/D11 only when command provenance cannot be modeled locally.

## Non-Claims

- This review did not edit D2 source packet or OpenSpec files.
- This review did not implement code.
- This review did not run Habitat source tests.
- This review does not accept D2 for design/specification or implementation.
- This review does not reopen D0 or D1 acceptance; it treats both as accepted for design/specification only and not implementation-complete.

Skills used: domain-design, information-design, solution-design, system-design, civ7-open-spec-workstream, civ7-systematic-workstream, civ7-habitat-dra-workstream.
