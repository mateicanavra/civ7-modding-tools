# D12 Domain/Ontology Investigation

## Verdict

D12 Verify Handoff Receipt is not accepted for domain/ontology. Source implementation remains blocked.

The current D12 disk state uses the right broad direction, but it does not yet make the semantic commitments that D12 must own: a closed verify receipt ontology, exact consumed D3/D7 projection endpoints, affected-target state semantics, canonical non-claims, compatibility handling for legacy proof-named surfaces, and falsifying scenarios for blocked, skipped, failed, and executed states.

## Skill Read Register

Mandatory full reads completed:

| Skill | Files read |
| --- | --- |
| Domain Design | `domain-design/SKILL.md`; all files under `domain-design/references/`: `axes.md`, `leaflet-governance.md`, `leaflet-organizations.md`, `leaflet-software-data.md`, `leaflet-software-services.md`, `principles.md`, `where-defaults-hide.md` |
| Information Design | `information-design/SKILL.md`; all files under `information-design/references/`: `axes.md`, `examples.md`, `multi-artifact.md`, `principles.md`, `where-defaults-hide.md` |
| Ontology Design | `ontology-design/SKILL.md`; all files under `ontology-design/references/`: `axes.md`, `examples.md`, `maintenance.md`, `operationalization.md`, `principles.md`, `representation-choices.md`, `source-map.md`, `where-defaults-hide.md` |
| Solution Design | `solution-design/SKILL.md`; high-commitment/rugged references: `references/axes/axes.md`, `problem-character.md`, `solution-space-topology.md`, `stakeholder-complexity.md`, `intervention-type.md`, `commitment-reversibility.md`, `knowledge-state.md`, `references/defaults/critical-and-high.md`, `medium-severity.md`, `where-defaults-hide.md`, `references/principles/principles.md`, `universal.md`, axis principle summaries, `heuristics.md`, and `sources.md` |

Applied mandate checks:

- Domain: single authority, language boundary, seam, ambiguity, and owner tests.
- Ontology: competency, identity, relationship, evidence/truth separation, drift, and maintenance tests.
- Information: scope, scent, hierarchy, standalone/coherent, and multi-artifact consistency tests.
- Solution: reframing, reversibility, landscape, escape, and satisfice-threshold tests.

## Source Register

Primary D12 sources read:

| Source | Review use |
| --- | --- |
| `docs/projects/habitat-harness/phase2-workstream-packets/D12-proof-handoff-verify-command.md` | Source domino; shows original handoff assembler intent and current state-space problem. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/proposal.md` | Current D12 authority, scenario, scope, verification gates, and stop conditions. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/design.md` | Current D12 domain boundary, target contract, naming decisions, and review lanes. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/specs/habitat-harness/spec.md` | Current normative delta; presently too broad for D12 closure. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/tasks.md` | Current implementation task list and validation commands. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream/*.md` | Current phase state, review status, downstream ledger, closure checklist. |
| `docs/projects/habitat-harness/openspec-remediation/packet-index.md` | Sequencing status; D12 still blocking. |
| `docs/projects/habitat-harness/openspec-remediation/context.md` | Path fixture; currently stale for active branch. |

Accepted upstream sources read for D12 contract dependencies:

| Source | D12 dependency extracted |
| --- | --- |
| `deep-habitat-d1-receipt-contract-boundary` proposal/design/spec/tasks/workstream | Target meaning is `VerifyReceipt`; `VerifyProof` is a legacy public name unless D0 allows preserve/version/facade; D1 owns canonical non-claim identifiers and typed relationships. |
| `deep-habitat-d3-workspace-graph-boundary` proposal/design/spec/workstream | D12 consumes `VerifyTargetPlan`, graph-read/refusal facts, and target availability; D12 must not own graph construction or dependency truth. |
| `deep-habitat-d7-structural-enforcement-pipeline` proposal/design/spec/workstream | D12 consumes `VerifyCheckSummaryProjection`, including requested selectors, check mode, selected ids, status counts, `allowsAffectedExecution`, and skipped-affected reason. |
| `deep-habitat-d0-command-surface-inventory` sampled proposal/workstream references | Public surface compatibility rows are prerequisites before command JSON/human/export behavior changes. |

Current implementation evidence read:

| Source | Current-state fact |
| --- | --- |
| `tools/habitat-harness/src/commands/verify.ts` | Current CLI summary and JSON flag still call the output a structured `VerifyProof` artifact. |
| `tools/habitat-harness/src/lib/command-engine.ts` | Current exported type is `VerifyProof`; `requestedSelectors` is `{}`; non-claims are prose strings and omit required canonical identifiers; affected target states are executed/skipped only. |
| `tools/habitat-harness/test/lib/verify-proof.test.ts` | Current tests cover stream bounds, task-local cache state, and check-failed skip. |
| `tools/habitat-harness/test/commands/habitat-commands.test.ts` | Current mocked command test preserves proof-shaped JSON expectations and does not test D3/D7 projection semantics. |

## D12 Solution-Design Frame

D12 is a rugged, high-commitment design problem. The issue is not a local rename; it is the public contract for how Habitat hands a repo-maintenance result to a reviewer without implying CI, apply safety, PR readiness, product behavior, OpenSpec acceptance, graph truth, or rule correctness.

Axis positions:

| Axis | Position | Consequence |
| --- | --- | --- |
| Problem character | Mostly tame once D1/D3/D7 are accepted, with wicked pressure from public compatibility. | D12 can specify closed states, but must preserve D0 compatibility handling where public surfaces already exist. |
| Solution space topology | Rugged. | A superficial `proof` to `receipt` rename is a local optimum; D12 must choose exact ontology, states, and relationships. |
| Stakeholder complexity | Multi-layer. | DRA owners, reviewers, D14, D1, D3, D7, D0 compatibility, and future implementation agents all consume different parts of the receipt. |
| Intervention type | Reshape constraints. | D12 must reject inherited proof/evidence framing except where D0 compatibility explicitly preserves it. |
| Commitment reversibility | High commitment. | Once JSON, tests, docs, and handoff templates consume D12 names, undoing lazy terminology is expensive. |
| Knowledge state | Rich prior with fixation risk. | Accepted D1/D3/D7 provide strong prior; current TypeScript can still anchor the design to `VerifyProof`, `{}`, and broad output-bag fields. |

Acceptance threshold: D12 is acceptable only when an implementation agent can implement or preserve each verify surface by following D12, D1, D3, D7, and D0 rows without inventing state names, non-claims, skip reasons, graph/check ownership, or compatibility policy.

## Target Domain And Ontology

Domain owner: Verify Handoff.

D12 owns:

- `VerifyReceipt` as the verify-specific command handoff record.
- `VerifyInvocation` or D1-compatible `CommandInvocation` for the requested `habitat verify` command.
- `VerifyBaseSelection` for requested base, resolved base, and source.
- `VerifyCheckSummary` as D12's receipt-facing consumption of D7 `VerifyCheckSummaryProjection`.
- `VerifyTargetPlanReceipt` as D12's receipt-facing consumption of D3 `VerifyTargetPlan`.
- `AffectedTargetExecution` with closed states: `executed`, `skipped`, `failed`.
- `AffectedTargetSkipReason` sourced from D7 check-summary projection and D3 graph-refusal states, not recomputed by verify.
- `CommandOutputObservation` for bounded stdout/stderr, truncation flags, and task-local cache observation.
- `PostStateObservation` for git/resources/Graphite base provenance as observed state only.
- `VerifyNonClaim` using D1 canonical identifiers plus any D12-specific identifiers approved with owner/scenario/consumer.
- Typed relationships: `summarizes-check-report`, `uses-verify-target-plan`, `observes-post-state`, `bounded-by-non-claim`, `hands-off-to`, and `references-d0-surface`.

D12 must not own:

- Check report construction, rule execution, selector semantics, diagnostic taxonomy, baseline policy, or check exit derivation.
- Nx graph construction, dependency resolution, target availability truth, or graph refusal policy.
- Graphite submit/PR readiness, worktree cleanliness proof, OpenSpec acceptance, CI result, apply safety, product/runtime proof, or downstream D14 closure.

Closed D12 state model required:

| State family | Required states |
| --- | --- |
| Check consumption | `allows-affected-execution`, `blocks-affected-execution`, `check-summary-unavailable` |
| Target plan consumption | `target-plan-ready`, `target-plan-refused`, `target-plan-unavailable` |
| Affected target execution | `executed`, `skipped`, `failed` |
| Receipt outcome | `succeeded`, `failed`, `blocked`, `refused` |
| Post-state observation | `observed`, `unavailable`, `not-claimed` |
| Legacy compatibility | `legacy-public-name`, `versioned-public-name`, `facade-public-name`, `internal-target-name` |

The receipt outcome is not a duplicate of check status or Nx exit status. It is the command handoff state derived from consumed check summary, consumed target plan, affected execution outcome, and post-state observation availability.

## Accepted And Rejected Terms

Accepted target terms:

- `VerifyReceipt`
- `Verify Handoff`
- `VerifyInvocation`
- `VerifyBaseSelection`
- `VerifyCheckSummary`
- `VerifyTargetPlan`
- `AffectedTargetExecution`
- `AffectedTargetSkipReason`
- `CommandOutputObservation`
- `PostStateObservation`
- `NonClaim`
- `HandoffLink`
- `LegacyCompatibilitySurface`

Conditionally accepted terms:

- `VerifyProof`: legacy public compatibility name only where D0 handling is `preserve`, `version`, or `facade`; never the target domain meaning.
- `proof` in filenames/tests: compatibility citation only until D0/D12 decide whether to preserve, version, facade, deprecate, or move.
- `evidence`: only for raw source evidence or explicitly owned observation/provenance; not a product-level success claim.

Rejected target terms:

- `proof class`
- `proof artifact`
- `CI execution proof`
- `Graphite readiness proof`
- `{}` selector placeholder
- `skip` without owner-sourced reason and receipt consequences
- `Graphite state` as a verification claim
- `affected proof`
- `output bag`

## Owner And Consumer Boundary

| Boundary | Authority | D12 obligation |
| --- | --- | --- |
| Public compatibility | D0 | Do not change JSON, help, human output, package exports, scripts, docs examples, or generated artifacts without concrete D0 rows. |
| Receipt/non-claim ontology | D1 | Use `VerifyReceipt`, D1 canonical non-claims, and typed relationships; classify `VerifyProof` as legacy compatibility. |
| Graph target plan | D3 | Consume `VerifyTargetPlan`; record graph refusal/availability without constructing graph truth. |
| Check summary | D7 | Consume `VerifyCheckSummaryProjection`; derive allow/skip affected execution only from D7 signal. |
| Verify handoff composition | D12 | Own command receipt schema, affected execution outcome, post-state observation, and downstream handoff links. |
| D14 authoring topology fence | D14 | Consume D12 examples and receipt semantics; do not infer D12 acceptance from broad current design prose. |

## Findings Against Current D12 Disk State

### P1: D12 does not define its closed receipt ontology

Current state:

- `proposal.md` and `design.md` say verify is a handoff assembler and target language should be receipt/handoff.
- `specs/habitat-harness/spec.md` has only two broad scenarios: upstream checks pass and upstream check is blocked.
- `design.md` does not define `VerifyReceipt`, `VerifyCheckSummary`, `VerifyTargetPlan`, `AffectedTargetExecution`, `PostStateObservation`, `VerifyNonClaim`, or typed receipt relationships as D12-owned semantic objects.

Why this blocks acceptance:

D1 already established the target meaning as `VerifyReceipt` and the relationship/non-claim model. D3 and D7 already provide exact consumer projections. D12 must turn those into its own receipt ontology. Without that, implementation agents must invent which fields and states exist.

Repair demand:

- Add a D12 target ontology section to `design.md` naming every D12-owned object, relationship, owner, and forbidden local claim.
- Add a closed D12 state model for check consumption, target-plan consumption, affected execution, receipt outcome, post-state observation, and legacy compatibility.
- Update `spec.md` with normative scenarios for check pass, check fail, selector refusal, dependency refusal, diagnostic/baseline/protected-zone refusal, graph target-plan refusal, affected execution fail, post-state unavailable, and non-claims.

### P1: Legacy proof naming is not dispositioned strongly enough for D12

Current state:

- D12 says to replace proof language with receipt/handoff terminology.
- Current code still exposes `VerifyProof`, `createVerifyProof`, `--json` text saying structured `VerifyProof` artifact, `verify-proof.test.ts`, and prose non-claims.
- D12 does not record a D12-specific compatibility table for `VerifyProof`, `createVerifyProof`, test names, JSON help text, human wording, docs examples, or schemaVersion stance.

Why this blocks acceptance:

D1 treats `VerifyProof` as a legacy public surface unless D0 allows preserve/version/facade. D12 is the owner of verify workflow composition, so D12 must state exactly which proof-shaped names remain compatibility names and which target names implementation uses internally. Otherwise inherited terminology will reach source as target language.

Repair demand:

- Add a D12 term-disposition table with current surface, current path, D0 plane, target term, compatibility stance, owner, bad case, and required test/gate.
- State that `VerifyProof` is never target-domain language; it may remain only as a legacy public DTO/facade/versioned shape backed by D0.
- Replace current non-claim prose examples with D1 canonical identifiers in D12 target design.

### P1: D12 does not bind itself to D3/D7 projection endpoints

Current state:

- D12 says it consumes D1/D3/D7 outputs.
- D3 names `VerifyTargetPlan`; D7 names `VerifyCheckSummaryProjection`.
- D12 does not specify the D3/D7 fields it consumes, the owner of each consumed fact, or what happens when either projection is unavailable or refused.

Why this blocks acceptance:

Without explicit projection endpoints, verify can reconstruct check semantics from `CheckReport.ok`, use hard-coded target arrays, or treat graph target facts as local verify truth. That violates D3/D7 authority and recreates the current state-space problem.

Repair demand:

- In `design.md`, add a consumed-projection matrix for D3 `VerifyTargetPlan` and D7 `VerifyCheckSummaryProjection`.
- For each consumed field, state source owner, D12 receipt field, allowed unavailable/refused states, and forbidden recomputation.
- In `spec.md`, add scenarios proving D12 records D7 skipped-affected reasons and D3 graph refusals without running affected targets as if allowed.

### P2: Affected target states are under-modeled

Current state:

- D1 requires affected target execution states `executed`, `skipped`, and `failed`.
- D12 proposal/design mention skipped/failed states but the D12 spec only describes pass and blocked.
- Current implementation type has `executed` and `skipped`; an executed Nx nonzero exit is represented as `status: "executed"` with nonzero `exitCode`, not as an explicit failed affected-target state.

Why this matters:

The receipt consumer needs to know whether affected targets did not run, ran and passed, or ran and failed. A nonzero exit code hidden inside `executed` requires consumers to infer command outcome from a nested field.

Repair demand:

- Specify `AffectedTargetExecution` as `executed`, `skipped`, or `failed`, with state-specific fields.
- `failed` must carry argv, targets, projects if observable, bounded streams, cache observations if observable, and exit code.
- `skipped` must carry owner-sourced reason and must not carry command output, projects, task cache states, or numeric Nx exit code.

### P2: Non-claims are not canonical or complete

Current state:

- D12 proposal/design require non-claims.
- Current code emits prose strings: `CI execution proof`, `Grit apply safety`, `baseline key migration`, `Grit row semantics`, `product/runtime behavior`.
- D1 requires canonical identifiers including `does-not-prove-ci`, `does-not-prove-runtime`, `does-not-prove-product-completion`, `does-not-prove-graphite-readiness`, `does-not-prove-openspec-acceptance`, `does-not-prove-apply-safety`, `does-not-prove-current-tree-cleanliness`, `does-not-prove-rule-correctness`, and `command-output-only` where relevant.

Why this matters:

Free-form non-claim phrases are not stable contract values. They do not give downstream docs, tests, D14, or agents a reliable way to reason about what the receipt does not assert.

Repair demand:

- D12 must require canonical non-claim identifiers in the target receipt.
- Any D12-specific non-claim must name owner, scenario, public compatibility impact, and consumer.
- Add spec scenarios for non-claims in passing, blocked, skipped, and failed receipts.

### P2: Validation gates are named but not falsifying

Current state:

- `proposal.md`, `tasks.md`, and `phase-record.md` list commands.
- They do not record expected status, oracle, bad case, cache/freshness stance, and non-claims with D12-specific precision.
- The gates do not include D3 target-plan refusal, D7 selector/refusal projection, affected-target failed state, or post-state observation unavailable cases.

Why this matters:

A green command list can pass while D12 still lacks the semantic contract needed by implementation. D1 explicitly requires gates to include exact status, oracle, bad case, cache stance, and non-claims.

Repair demand:

- Replace validation command bullets with a D12 validation matrix.
- Include focused tests or future test requirements for: check-failed skip, selector-refused skip, D3 graph-refused target plan, affected-target failed after run, bounded streams, task-local cache observation, post-state observation unavailable, canonical non-claims, and JSON compatibility facade/version.
- Every gate must state what it proves and what it does not prove.

### P2: Workstream/router state is stale for active D12 execution context

Current state:

- Current worktree branch is `codex/d12-verify-handoff-packet`.
- `docs/projects/habitat-harness/openspec-remediation/context.md` still records `$ACTIVE_REMEDIATION_BRANCH` as `codex/d11-local-feedback-packet`.
- D12 `workstream/phase-record.md` records branch `codex/deep-habitat-openspec-remediation`.

Why this matters:

Path and branch fixtures are part of the remediation control plane. Stale branch identity weakens traceability for acceptance evidence and can route later agents to the wrong context.

Repair demand:

- Update the active remediation branch in `context.md` when the packet repair owner updates router fixtures.
- Update D12 `phase-record.md` to use the current branch or the context variable, not stale literal branch names.
- If D12 adds path variables, define them once in context and reference them from durable packet artifacts.

### P3: The D12 source packet still contributes useful distinctions not carried forward

Current state:

- Source packet explicitly calls out requested selector state variants: none, inherited, unsupported, or requested.
- Current D12 packet only says to specify command streams, post-state, skipped states, and non-claims.
- Current code still emits `requestedSelectors: {}`.

Why this matters:

Selector-request semantics are a real D12 invariant because D7's projection includes requested selectors and check mode. `{}` hides whether verify has no selector flags, inherited check selectors, unsupported selector input, or requested selectors after future expansion.

Repair demand:

- D12 must choose a closed selector request projection: `none`, `requested`, `unsupported`, and only `inherited` if D7 actually exposes inherited request semantics.
- D12 must reject `{}` as target receipt state.

## Exact Repair Demands

Before D12 can be accepted for domain/ontology:

1. Rewrite `design.md` from broad frame to D12-specific semantic contract:
   - D12 target ontology.
   - Closed state model.
   - D3/D7 consumed projection matrix.
   - D1 compatibility/non-claim inheritance.
   - D0 public-surface compatibility table for verify surfaces.
   - Owner/forbidden-owner matrix.
2. Expand `specs/habitat-harness/spec.md` into normative requirements with scenarios for:
   - Check allows affected execution.
   - Check failure/refusal blocks affected execution.
   - Selector refusal and empty selector selection.
   - D3 target-plan refusal/unavailability.
   - Affected execution succeeds.
   - Affected execution fails.
   - Bounded streams and task-local cache state.
   - Post-state observations are observations, not readiness claims.
   - Canonical non-claims in every receipt outcome.
   - Legacy `VerifyProof` compatibility handling.
3. Replace `tasks.md` implementation bullets with sequenced, executable steps:
   - Grounding and D0 row prerequisite.
   - D12 surface inventory.
   - Receipt state model and compatibility facade/version.
   - D3/D7 projection consumption.
   - Tests and validation gates.
   - Downstream realignment.
4. Update workstream records:
   - Phase record branch/path fixture.
   - Validation matrix with expected status, oracle, bad case, cache/freshness stance, and non-claims.
   - Review ledger dispositions after repairs.
   - Downstream ledger with exact D14 and docs/test handoff assumptions.

## Acceptance Bar For This Lane

Domain/ontology accepts D12 only when all of these are true:

- One owner is named for every D12 semantic object, and adjacent D1/D3/D7/D0 owners are not overridden.
- Target language uses `VerifyReceipt` and receipt/handoff terms. Any proof/evidence wording is classified as legacy compatibility or raw source evidence.
- The receipt has closed states for check consumption, target plan, affected execution, post-state observation, and final receipt outcome.
- D3 `VerifyTargetPlan` and D7 `VerifyCheckSummaryProjection` are consumed as typed upstream commitments, not recomputed.
- A failed or refused check cannot produce affected-target execution.
- A failed affected-target command is not hidden as a passing or merely executed receipt.
- `{}` selector state is eliminated from target semantics.
- Non-claims are canonical identifiers and include CI, runtime/product behavior, product completion, Graphite readiness, OpenSpec acceptance, apply safety, current-tree cleanliness, and rule correctness where relevant.
- Validation gates include D12-specific bad cases and non-claims.
- Workstream context and phase records identify the active D12 branch/worktree accurately.

Until then, D12 remains not accepted and source implementation remains blocked.
