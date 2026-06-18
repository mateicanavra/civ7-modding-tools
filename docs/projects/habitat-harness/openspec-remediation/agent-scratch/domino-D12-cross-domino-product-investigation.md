# D12 Cross-Domino Product Investigation

## Status And Verdict

Verdict: D12 is not accepted for this lane.

D12 is moving in the correct product direction by changing `habitat verify` from a broad proof claim into a bounded handoff receipt. The current disk state is still blocking because it does not yet close the product and dependency contract. It can still overclaim readiness, hide upstream unavailable states behind generic receipt language, and leave D14 to reinterpret verify handoff semantics.

The repair must keep D12 as a production-quality OpenSpec packet only. It must not authorize TypeScript source implementation yet.

## Skill And Source Read Register

Mandatory skill anchoring read before this review:

- `domain-design`: `SKILL.md` plus all reference files under `references/`. Applied to domain boundary, authority ownership, dependency direction, and hidden default checks.
- `information-design`: `SKILL.md` plus all reference files under `references/`. Applied to receipt shape, state visibility, read-path clarity, and multi-artifact consistency.
- `solution-design`: `SKILL.md` plus relevant references. Applied to stakeholder fit, constraints, acceptance thresholds, risk framing, and repair sequencing.
- `testing-design`: `SKILL.md` plus relevant references. Applied to falsifying scenarios, oracle definition, boundary tests, and validation gates.
- `civ7-open-spec-workstream`: `SKILL.md` plus relevant references. Applied to source mapping, phase-loop discipline, review lanes, artifact contracts, failure patterns, and validation checks.

Primary D12 and context sources read:

- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D12-proof-handoff-verify-command.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/proposal.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/design.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/tasks.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream-artifacts/phase-record.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream-artifacts/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream-artifacts/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream-artifacts/closure-checklist.md`
- `tools/habitat-harness/docs/CAPABILITIES.md`
- `tools/habitat-harness/docs/SCENARIOS.md`

Cross-domino sources read:

- D0 accepted packet/change artifacts for public surface compatibility.
- D1 accepted packet/change artifacts for proof/receipt taxonomy and non-claim families.
- D3 accepted packet/change artifacts for workspace graph and target planning authority.
- D7 accepted packet/change artifacts for structural check and verify summary projection authority.
- D14 source and current change artifacts for future unsupported authoring boundaries.

Repo/process state checked:

- Active worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
- Active branch: `codex/d12-verify-handoff-packet`
- Initial worktree state: clean.
- Root `AGENTS.md` applies; no closer `AGENTS.md` governs this scratch path.
- Graphite is the documented workflow for reviewable work in this repo.

## Product Scenario Critique

The intended D12 user is a DRA owner who has run local repo-maintenance checks and needs to hand off the current maintenance state to another reviewer or agent. That user needs a bounded local receipt: what command was invoked, which check result was consumed, which graph plan was available, whether affected tasks executed or were skipped, what happened to those tasks, what post-state was merely observed, and which readiness claims are explicitly not made.

The current D12 product scenario points in the correct high-level direction, but it compresses too much authority into "assemble a review handoff after check/graph work." That phrase hides the key product risk: D12 is useful only if it preserves upstream state without upgrading it into readiness. A DRA owner must be able to distinguish at a glance:

- D7 check passed and therefore allowed affected execution.
- D7 check failed or refused and therefore affected execution did not run.
- D3 graph facts were available and target planning was valid.
- D3 graph facts were unavailable or refused and therefore target execution was not a valid proof point.
- Affected targets ran and passed.
- Affected targets ran and failed.
- Post-state was observed as clean or dirty, without claiming Graphite submit readiness.
- The receipt is local command output, not CI, product approval, runtime behavior, apply safety, OpenSpec acceptance, authoring readiness, or rule correctness.

The current packet also has to preserve the existing product distinction in `CAPABILITIES.md` and `SCENARIOS.md`: root `bun run verify` is an Nx aggregate repo proof path, while `bun run habitat verify` is a diagnostic Habitat receipt path. D12 cannot blur those surfaces. If `habitat verify` reads as the command that proves the repo is ready, the packet has already overclaimed.

The right product shape is vendor-native composition: Habitat invokes or records standard repo-local check and Nx affected results, then packages them into a D1-compatible receipt. D12 should not create a second harness-specific proof world with its own graph authority, check semantics, or broad readiness vocabulary.

## Dependency Matrix

| Domino | Dependency role for D12 | D12 must consume | D12 must not do | Current D12 gap |
| --- | --- | --- | --- | --- |
| D0 Public Surface Compatibility | Direct blocker before source implementation | Concrete rows for `habitat verify` CLI/help, JSON DTO names, human output claims, package exports, root/docs examples, and any compatibility handling for `VerifyProof` | Change public command behavior or JSON shape without row-backed compatibility disposition | Current packet mentions D0 disposition but does not name required rows or block implementation on their absence |
| D1 Proof Boundary And Taxonomy | Direct semantic authority | `VerifyReceipt` as target semantic object, `VerifyProof` as legacy compatibility surface where retained, canonical non-claims, typed relationships such as `summarizes-check-report`, `observes-post-state`, `bounded-by-non-claim`, `references-d0-surface` | Invent a receipt/proof taxonomy or omit D1 non-claims | Current packet says receipt language but does not pin D1 names, relationships, or canonical non-claim coverage |
| D3 Workspace Graph Integration | Direct planning authority | Workspace graph read status, target availability, dependency resolution, `VerifyTargetPlan`, and graph refusal states | Hard-code target truth locally or turn unavailable graph facts into a successful receipt | Current packet references graph output generally but does not specify D3 states or closed behavior for graph refusal/unavailability |
| D7 Structural Enforcement | Direct check authority | `VerifyCheckSummaryProjection` and the allow/skip affected execution signal | Recompute check semantics from raw fields or run affected targets after failed/refused checks | Current packet does not define the mapping from D7 outcomes to affected execution states |
| D14 Future Unsupported Authoring Boundaries | Downstream consumer | D12 non-claims and examples that verify receipts are not authoring/topology/product readiness | Leave D14 to invent verify semantics for unsupported authoring fences | Current D12 does not provide D14 a precise handoff contract |

## D0 And D1 Compatibility Blockers

D0 requires concrete public surface rows before changing command behavior, JSON DTOs, package exports, root scripts, Nx target behavior, hooks, or public examples. D12 currently names D0 as a dependency but does not specify the exact row set needed for `habitat verify`. That leaves an implementation path open where the command changes observable output first and explains compatibility later. That is backwards for this repo.

D12 must require row-backed compatibility disposition for at least:

- `habitat verify` CLI invocation, flags, help text, exit behavior, and human output.
- JSON result surface currently named `VerifyProof` and target semantic surface named `VerifyReceipt`.
- Any exported helpers or types such as `VerifyProof`, `createVerifyProof`, or their receipt replacements.
- Docs/examples that compare `bun run verify`, `bun run check`, and `bun run habitat verify`.
- Non-claim wording that affects how humans interpret the command result.

D1 requires D12 to consume the proof-boundary taxonomy instead of locally renaming proof concepts. The target object is `VerifyReceipt`; `VerifyProof` is a compatibility fact only if D0 says it is preserved, versioned, or wrapped. D12 must copy the D1 non-claim set by identifier and then add D12-specific wording where needed. At a minimum, D12 has to deny CI, runtime behavior, product completion or approval, Graphite readiness, OpenSpec acceptance, apply safety, current-tree cleanliness as a readiness guarantee, and rule correctness beyond the consumed upstream results.

The current D12 spec says the command must not claim product approval, runtime behavior, Graphite readiness, or implementation correctness. That is necessary but incomplete. It omits several D1-owned non-claim families and does not establish typed receipt relationships. Without those, downstream docs and D14 cannot tell whether a green receipt is a local command receipt, an OpenSpec gate, a Graphite handoff, or a product-readiness statement.

## D3 And D7 Consumption Constraints

D3 is the only authority D12 should consume for graph truth and target planning. D12 can record that graph facts were available, that a target plan was derived, or that graph integration refused. It cannot create target availability, infer dependency correctness, or hard-code a target list as if that were graph output.

D12 needs a closed graph state model. The receipt should distinguish:

- graph facts available and target plan ready;
- graph read refused;
- target availability unavailable;
- dependency resolution refused;
- selector or base state unavailable;
- no target execution authorized because graph inputs were not usable.

D7 is the only authority D12 should consume for check outcome and the permission to run affected targets. D12 can record a D7 check summary and follow the D7 allow/skip signal. It cannot reinterpret structural diagnostics from raw command output, decide that a failed check is close enough for affected execution, or treat refused diagnostics as success.

D12 needs a closed affected-execution model. The receipt should distinguish:

- affected execution ran because D7 allowed it and D3 target planning was available;
- affected execution was skipped because Habitat check failed;
- affected execution was skipped because D7 refused on selector, dependency, diagnostic, baseline, or protected-zone grounds;
- affected execution was skipped because D3 graph facts or target planning were unavailable;
- affected execution ran and failed;
- affected execution ran and passed;
- post-state was observed separately from readiness.

The current D12 packet does not state these transitions precisely. That is the largest technical product gap because it allows the command to hide unavailable upstream states as ordinary success.

## Downstream D14 Realignment Demands

D14 needs D12 to define what a verify handoff receipt means before D14 can fence unsupported future authoring. The important D14 dependency is not that D12 emits a nicer artifact. The important dependency is that D12 proves by specification that a successful `habitat verify` receipt is still not any of these:

- a MapGen authoring approval;
- a topology or recipe correctness statement;
- a runtime behavior claim;
- a product completion claim;
- a Graphite submit claim;
- an OpenSpec acceptance claim;
- a replacement for root `bun run verify`.

D12 must give D14 exact language and examples to cite. D14 should not have to reinterpret "verify" in order to say that Habitat refused or deferred unsupported authoring. D12 should add a downstream-facing section or row that says:

- D14 may consume D12 receipt non-claims when explaining why verify success does not unlock authoring.
- D14 may use D12 examples to distinguish local structural maintenance receipts from future authoring readiness.
- D14 may not treat `habitat verify` success as acceptance of generated topology, recipes, MapGen product behavior, or future authoring command contracts.

If D12 does not provide that handoff, D14 will either duplicate D12 semantics or invent new language. Both outcomes break the dependency chain.

## Findings Against Current D12 Disk State

### P1: D12 Does Not Close D0 Public Surface Compatibility

Current artifacts mention D0 compatibility but do not enumerate required D0 rows or make absent rows an implementation blocker. This is not enough for a command whose name, help, JSON DTO, human output, and public docs all carry readiness implications.

Repair demand:

- Add a D0 row checklist to `proposal.md` or `design.md`.
- Require each public surface change to cite a concrete `surface_id`.
- State that source implementation remains blocked until the D0 rows exist.
- Define how `VerifyProof` is preserved, versioned, wrapped, or retired through D0 and D1. Do not leave this to implementation judgment.

### P1: D12 Does Not Pin The D1 Receipt Taxonomy

Current artifacts use receipt wording but do not require `VerifyReceipt` as the target semantic object, do not define `VerifyProof` as a legacy compatibility surface, and do not require the D1 non-claim identifiers and typed relationships.

Repair demand:

- Add a D1 consumption section with target name, legacy name handling, relationship names, and non-claim identifiers.
- Require receipt fields to distinguish consumed facts from D12-owned assembly metadata.
- Add a spec scenario proving that a green receipt remains bounded local command output, not readiness.

### P1: D12 Can Hide D3 Unavailable Graph States

Current artifacts say D12 composes over graph output but do not name D3 graph facts, refusal states, target availability, or target plan readiness. That leaves space for local hard-coded target planning or a successful receipt when graph facts are absent.

Repair demand:

- Add a D3 consumed-input table naming workspace graph read status, target availability, dependency resolution, target plan, and graph refusals.
- Add receipt states for graph refusal and target-plan unavailable.
- Require affected execution to be blocked or skipped when D3 facts are unavailable.
- Add a spec scenario where graph refusal produces a non-success handoff state and no affected target execution.

### P1: D12 Can Run Or Claim Affected Proof After D7 Check Failure

Current artifacts do not define the D7 allow/skip mapping. The source packet explicitly warns that affected targets must not run after failed check, but the current OpenSpec packet has not turned that into a requirement set.

Repair demand:

- Add D7 `VerifyCheckSummaryProjection` as the consumed check object.
- Require affected execution only when D7 allows it and D3 target planning is ready.
- Define skipped reasons for failed/refused D7 outcomes.
- Add spec scenarios for failed check, selector refusal, baseline refusal, protected-zone refusal, and successful check.

### P1: D12 Leaves D14 To Reinterpret Verify Semantics

Current D12 does not provide D14 with a stable downstream contract. D14 still has to infer how verify receipts relate to unsupported authoring, topology, product readiness, and future command fences.

Repair demand:

- Add a D14 downstream handoff section to D12.
- Include exact non-claims D14 can cite.
- Include examples showing that verify success does not authorize future authoring.
- Update the D12 downstream realignment ledger with D14 obligations and expected consumer language.

### P2: Product Scenario Lacks Operator Decision Paths

The scenario identifies a DRA owner but does not show what the owner learns or does for each receipt state. A handoff receipt is only useful if the recipient can see why the handoff is blocked, failed, or bounded.

Repair demand:

- Add state-based scenarios: check pass, check fail, graph refusal, target unavailable, affected failure, affected pass, dirty post-state.
- For each scenario, state what the DRA owner can hand off and what they cannot claim.
- Keep post-state observations separate from readiness claims.

### P2: Root Verify And Habitat Verify Boundary Is Missing From D12

The current docs distinguish root `bun run verify` from diagnostic `bun run habitat verify`. D12 does not yet carry that distinction into the packet.

Repair demand:

- Add a requirement that D12 must preserve the command boundary from `CAPABILITIES.md` and `SCENARIOS.md`.
- State that `habitat verify` is not a replacement for root `bun run verify`.
- Add docs/tasks entries for checking the distinction in examples and help text.

### P2: Validation Gates Do Not Falsify The Dangerous Claims

The listed gates check broad command/test surfaces but do not name the negative cases D12 is trying to prevent.

Repair demand:

- Add validation scenarios for failed check producing skipped affected execution.
- Add validation scenarios for D3 graph refusal producing a blocked or skipped receipt state.
- Add validation scenarios for affected Nx failure producing a failed receipt.
- Add validation scenarios proving post-state observation does not imply Graphite readiness.
- Add validation scenarios proving non-claims are present in JSON and human output.

### P3: Workstream Metadata Is Stale Or Too Generic

`context.md` still names the previous D11 branch variable, and the D12 phase record names a branch that does not match the active worktree branch. The review ledger and downstream ledger are still generic review shells rather than D12-specific product records.

Repair demand:

- Correct D12 branch metadata in the phase record and any local remediation context once this is in scope for packet/control edits.
- Replace generic ledger rows with D12-specific rows for D0, D1, D3, D7, D14, docs, and validation.
- Keep packet-index status blocking until the P1 issues are resolved.

### P3: D12 Design Sections Are Not Yet Specific Enough For Implementation Review

The current `design.md` has good headings but does not yet contain the state model, consumed-input table, compatibility table, or downstream handoff contract needed to review an implementation plan.

Repair demand:

- Expand `design.md` before implementation tasks are considered ready.
- Convert implementation readiness from a generic checklist into a dependency-state checklist.
- Add rejected alternatives for broad proof artifacts, local graph truth, local check reinterpretation, and conflating root verify with Habitat verify.

## Exact Repair Demands By Artifact

### `proposal.md`

Add a stronger summary that D12 assembles a D1-compatible `VerifyReceipt` from D7 check projection, D3 target plan facts, affected Nx command outcomes, post-state observations, and D1 non-claims. Name `VerifyProof` only as a D0-governed compatibility surface.

Expand the product scenario to cover DRA owner handoff decisions and the root verify versus Habitat verify distinction.

Update `Requires` to say D0, D1, D3, and D7 are direct blockers for source implementation, not just contextual dependencies.

Update `Enables` to say D14 consumes D12 non-claims and examples to fence unsupported future authoring.

Update `Stop` so D12 stops if any upstream unavailable/refused state can be reported as success, if affected execution can run after D7 failure/refusal, if D3 graph facts can be bypassed, or if D14 must invent verify semantics.

### `design.md`

Add these concrete sections:

- `Consumed Inputs`: D0 rows, D1 receipt taxonomy, D3 graph facts and target plan, D7 check projection and allow/skip signal.
- `Receipt State Model`: closed states for check, graph, affected execution, post-state, and non-claims.
- `D0/D1 Compatibility`: public surface row requirements, `VerifyReceipt` target name, `VerifyProof` compatibility stance, schema/version handling.
- `D3/D7 Composition`: exact conditions under which affected Nx targets may run.
- `D14 Handoff`: exact downstream semantics and unsupported interpretations.
- `Rejected Alternatives`: broad readiness proof, local graph planning, local check reinterpretation, treating post-state observation as Graphite readiness, treating Habitat verify as root verify.

### `specs/habitat-harness/spec.md`

Replace the single broad requirement with scenario-bearing requirements:

- Habitat verify SHALL emit or assemble a D1-compatible `VerifyReceipt`; any `VerifyProof` public surface SHALL be D0-governed compatibility.
- Habitat verify SHALL cite D0 rows before changing public command, JSON, export, or docs behavior.
- Habitat verify SHALL consume D7 `VerifyCheckSummaryProjection` and SHALL run affected targets only when D7 allows affected execution.
- Habitat verify SHALL consume D3 graph facts and target plan readiness and SHALL not run affected targets when graph facts are refused or unavailable.
- Habitat verify SHALL report failed/refused check states as blocked or skipped affected execution with explicit reasons.
- Habitat verify SHALL report affected command failure as a failed receipt state.
- Habitat verify SHALL report post-state as observation only.
- Habitat verify SHALL include D1 non-claims in machine-readable and human-readable output.
- Habitat verify SHALL preserve the distinction from root `bun run verify`.
- Habitat verify SHALL provide D14-consumable non-claims showing that verify success does not authorize future authoring or product/topology readiness.

### `tasks.md`

Replace generic implementation tasks with dependency-ordered work:

- Read and cite required D0 surface rows.
- Copy D1 receipt taxonomy and non-claim identifiers into the design/spec.
- Map D3 graph read, target plan, and refusal states into receipt states.
- Map D7 check projection and allow/skip states into affected execution behavior.
- Add D14 downstream handoff language.
- Add validation scenarios for all negative states before authorizing source work.
- Only then prepare source implementation tasks, still blocked by D0 row availability.

### `workstream-artifacts/phase-record.md`

Correct branch metadata and add a D12-specific source/read register. Record that D12 is design/spec only and remains source-implementation blocked until D0/D1/D3/D7 contracts are concretely cited.

### `workstream-artifacts/review-disposition-ledger.md`

Add rows for this lane's P1/P2/P3 findings. Each P1 should have a repair owner, target artifact, and acceptance condition.

### `workstream-artifacts/downstream-realignment-ledger.md`

Add D14 rows that state exactly what D14 may consume from D12 and what it must not infer. Add docs rows for `CAPABILITIES.md` and `SCENARIOS.md` so root verify and Habitat verify stay distinct after D12 changes.

### Packet Index And Context

Keep D12 marked blocking until P1 issues are repaired. Do not mark implementation complete after packet acceptance; acceptance here would only mean the design/spec packet is ready to guide later source work.

## Acceptance Bar For This Lane

D12 can pass this lane only when all of the following are true:

- Every public surface D12 could change is tied to a concrete D0 row, or source implementation is explicitly blocked until the row exists.
- D12 uses D1 `VerifyReceipt` as the target semantic object and treats `VerifyProof` only through D0-governed compatibility.
- D12 includes the D1 non-claim identifiers and typed relationships needed to bound the receipt.
- D12 names the D3 graph facts and target plan states it consumes.
- D12 makes D3 graph refusal or unavailable target planning impossible to report as successful verification.
- D12 names the D7 check projection and allow/skip signal it consumes.
- D12 makes affected execution impossible after failed or refused D7 check states.
- D12 records affected command failure as failed handoff state, not success with warnings.
- D12 keeps post-state observation separate from Graphite readiness, cleanliness guarantees, and product approval.
- D12 preserves the documented boundary between root `bun run verify` and diagnostic `bun run habitat verify`.
- D12 gives D14 exact non-claims and examples so D14 does not reinterpret verify semantics.
- D12 validation gates include negative scenarios that falsify overclaiming, hidden upstream unavailability, and D14 ambiguity.

Until those conditions are met, D12 remains blocked by this review lane.

## Stop Condition Check

The user-provided stop condition is triggered.

D12 can still overclaim readiness because the current packet does not fully import D1 non-claims, does not preserve the root verify versus Habitat verify boundary in its requirements, and does not make post-state observation visibly separate from readiness.

D12 can still hide upstream unavailable states because D3 graph refusal and D7 failed/refused check states are not yet closed receipt states.

D12 still leaves D14 to reinterpret verify handoff semantics because it does not provide a downstream contract for unsupported authoring, topology, product readiness, or future command fences.

Therefore the lane verdict remains: D12 not accepted.

Skills used: domain-design, information-design, solution-design, testing-design, civ7-open-spec-workstream.
