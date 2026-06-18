# Cross-Domino Sequencing Review

Reviewer role: Cross-Domino Sequencing Reviewer.

Scope: Phase 2 packet suite under `docs/projects/habitat-harness/phase2-workstream-packets/`.
This is a sequencing, dependency, compatibility, and packetization review only.
It does not authorize TypeScript implementation.

## Anchoring And Evidence

Skill anchoring completed before task work:

- Domain Design: used for authority seams, ownership, and anti-overlap checks.
- Information Design: used for packet split/merge and matrix structure.
- Solution Design and System Design: used for dependency/trade-off and second-order sequencing checks.
- Civ7 OpenSpec/Systematic Workstream: used for OpenSpec phase control, proof-class separation, and accepted P1/P2 handling.
- Testing Design and TypeScript: used for proof gate and state-space reduction checks.

Files read:

- All Phase 2 packet files `D0` through `D15`, `G-HOST`, `README.md`, `review-disposition-ledger.md`, and `validation-results.md`.
- Current Habitat source surfaces named by the packets, including `src/index.ts`, `src/plugin.js`, `src/rules/rules.json`, `src/lib/command-engine.ts`, `baseline.ts`, `grit.ts`, `generated-zones.ts`, `grit-apply.ts`, `hooks.ts`, `habitat-process.ts`, generators, and Pattern Authority manifest code.

Do not treat this scratch as implementation authority. It is an input to remediation disposition.

## Executive Verdict

The repaired critical sequence is directionally sound and substantially better than the earlier contradictory order recorded in the review ledger. The most important repaired edge is valid:

```text
G-HOST -> D10 -> D7/D9 -> D11
```

That edge is justified from all three perspectives:

- Product: generic Habitat cannot claim generated/protected-zone or apply-safety behavior while Civ7/MapGen policy is still embedded as generic behavior.
- Domain: Host Policy owns host declarations; Generated/Protected Zone Authority consumes them; Structural Enforcement and Apply Transaction consume generated-zone decisions.
- Code: `generated-zones.ts` embeds Swooper/Civ7 paths, while `grit-apply.ts` still contains MapGen-specific public-ops validation inside a generic transaction path.

The sequence should still be repaired in two places before Phase 3 execution:

- P1: split or move the early D14 fence so D13 does not implement Authoring Topology refusals before the unsupported-action inventory and future acceptance criteria exist.
- P2: add a D3 gate to D11 for pre-push affected-target truth, or explicitly carve D11's graph-owned pre-push target changes out until D3/D12 have stabilized.

## Cross-Domino Dependency Matrix

| Domino | Current declared dependencies | Sequencing verdict | Sequential vs parallel guidance |
| --- | --- | --- | --- |
| D0 Scenario/Public Contract Inventory | Fresh checkout, source-authority register, current command evidence | Valid suite entrance. Broad exports in `src/index.ts` and command/root-script ambiguity make this a true root gate. | Sequential first. No implementation movement before D0 classifies public vs internal surfaces. |
| D1 Proof Contract Boundary | D0 | Valid. Proof labels/non-claims are consumed by check, verify, hooks, Grit, apply, and handoffs. | Sequential after D0. Can run before D2 implementation, but D2 must consume D1 proof vocabulary rather than inventing local proof labels. |
| D2 Rule Registry Metadata Contract | D0, D1 | Valid. `rules.json` currently mixes owner/tool/lane/prose/scope/Grit/hook/generated-zone facts and `plugin.js` has separate owner-root truth. | Sequential schema/projection contract. After contract freeze, D3/D5/D6 implementation can split in parallel if one owner controls registry fixture/schema edits. |
| G-HOST Host Policy Boundary Gate | D0, D1 | Valid as a parallel gate with D2. It should not wait for D2 because it defines host-policy jurisdiction, not rule metadata projection. | Parallel with D2-D6 after D0/D1. Must close before D10, D13, or D9 host-policy closure claims. |
| D3 Workspace Graph Integration Boundary | D2 | Valid. Code confirms `plugin.js` owns hard-coded roots and target alias parsing while classify reads Nx metadata separately. | Safe parallel lane with D5/D6 after D2, provided shared rule metadata changes are already in the D2 contract. |
| D4 Orientation And Routing | D2, D3 | Valid. `Classification` is optional-heavy and consumes both graph facts and rule-scope projections. | Can proceed after D3 while D5/D6/D8 continue, but public DTO changes must remain under D0 and proof/non-claim wording under D1. |
| D5 Baseline Authority | D2 | Valid. Baseline state already has some unions, but guard outputs and external exception models still leave authority drift. | Parallel with D3/D6 after D2. Must close before D7 and D8. |
| D6 Diagnostic Pattern Catalog | D1, D2 | Valid. Grit diagnostics must be separate from governance and apply safety. Current `grit.ts` already carries process/provenance complexity, so D15 may be evaluated locally. | Parallel with D5 after D2. Do not let D6 admit patterns or apply patterns. D15 trigger is local only. |
| D8 Pattern Governance | D1, D2, D5, D6 | Valid. Pattern lifecycle requires baseline and diagnostic proof, but does not need D7 execution pipeline completion. | Can proceed after D5/D6 contracts stabilize, before D7 closes, if it avoids enforcement implementation. |
| D10 Generated/Protected Zone Authority | D1, D2, G-HOST | Valid and necessary. D10 is the consumer that joins D2 generated-zone facets with G-HOST declarations. | Sequential after G-HOST and D2. Must close before D7, D9, and D11 can claim generated-zone behavior. |
| D7 Structural Enforcement Pipeline | D1, D2, D5, D6, D10 | Valid. `createCheckReport` currently mixes selection, execution, Grit, baseline, generated/file-layer behavior, report construction, and rendering. | Sequential after D5/D6/D10. Design may start earlier against stable contracts, but implementation should not close early. |
| D9 Transformation Transaction | D1, D6, D8, D10 | Valid, with G-HOST consumed through D10 and direct host-specific gate declarations. `grit-apply.ts` proves D9 is separate from D6 and D8. | Sequential after D8 and D10. D15-triggered shared substrate edits must not run in parallel with another packet's D15 activation. |
| D11 Local Feedback | D1, D6, D7, D9, D10 | Mostly valid, but missing D3 for pre-push affected-target truth. Hooks own local orchestration only, while Workspace Graph owns target truth. | Design can proceed against D7/D9/D10 contracts. Implementation that changes pre-push affected target selection/base/graph behavior should wait for D3 or D12. |
| D12 Proof/Handoff Verify Command | D1, D3, D7 | Valid. `VerifyProof` currently contains `{}` selector placeholder and delegated affected proof, so it needs D1 proof semantics, D3 graph facts, and D7 check output. | Sequential after D3 and D7. Can design earlier only if `CheckReport` and graph contracts are stable. |
| D13 Scaffolding And Refusal Contracts | D0, D2, D8, G-HOST | Partially valid. Supported generic project/pattern scaffolding dependencies are right, but Authoring Topology refusal content needs an early D14 fence input. | Split internally: project-generator refusal design can proceed after D0/D2; pattern candidate semantics wait for D8; host-specific refusals wait for G-HOST; Authoring Topology refusal content should wait for D14a or consume a pre-D13 D14 design stub. |
| D14 Authoring Topology Fence | D4, D12, D13 | Needs split. Late fence closure after classify/verify/scaffolding is reasonable, but scope-control inventory is needed before D13 implements refusal variants. | Split into D14a early scope/unsupported-action inventory and D14b late command-facing fence closure, or move D14 design before D13 while keeping implementation tests after D13. |
| D15 Execution Provenance Substrate Trigger | D1 and packet-specific need | Valid as trigger-only, not as a standalone domino. Current code already exports `HabitatCommandResult` and uses Effect in Grit/apply/proof paths, so the overengineering risk is real. | No standalone parallel work. If triggered by D6/D7/D9/D11, local DTO alternatives must be rejected first. Shared `habitat-process.ts`/Effect substrate edits require one sequential owner. |

## Dependency Edge Checks

| Edge | Verdict | Rationale |
| --- | --- | --- |
| D0 -> D1 | Keep | Proof DTO changes can be public JSON/API changes. D0 must classify public surfaces first. |
| D0 -> D2 | Keep | Registry schema/projections may affect command output, package exports, and target generation. |
| D1 -> D2 | Keep | D2 consumers must not invent separate proof labels for metadata validation/refusals. |
| D0/D1 -> G-HOST | Keep | Host-policy declarations and refusals need public-surface and proof/non-claim vocabulary, not D2 metadata. |
| D2 -> D3 | Keep | Graph alias/root facts should be typed registry facets, not duplicated in `plugin.js`. |
| D2/D3 -> D4 | Keep | Classification consumes rule routing facts and Nx graph facts. |
| D2 -> D5 | Keep | Baseline authority needs registry identity and introduction manifest relation. |
| D1/D2 -> D6 | Keep | Grit diagnostics need proof labels plus typed rule/pattern metadata. |
| D5/D6 -> D8 | Keep | Pattern admission requires baseline and diagnostic proof. |
| G-HOST/D2 -> D10 | Keep | D10 is where host declarations meet generated-zone rule metadata. |
| D5/D6/D10 -> D7 | Keep | Enforcement consumes baseline, diagnostic, and generated-zone projections. |
| D8/D6/D10 -> D9 | Keep | Apply requires diagnostic inventory, apply admission, and generated/protected-zone policy. |
| D7/D9/D10 -> D11 | Keep | Hooks are orchestrators over check, apply guidance, and staged generated-zone protection. Add D3 condition for affected targets. |
| D1/D3/D7 -> D12 | Keep | Verify is proof assembly over check and graph/affected-target facts. |
| D0/D2/D8/G-HOST -> D13 | Keep for generic scaffolding and pattern candidate semantics. Add D14a for Authoring Topology refusal content. |
| D4/D12/D13 -> D14 | Split | These are right for final command-facing fence examples, but too late for initial scope-control authority. |
| D15 inside D6/D7/D9/D11 | Keep with serialization constraint | Trigger-only is correct. Shared substrate edits cannot be parallel unless one packet owns the substrate slice. |

## P1 Findings

### P1-SEQ-001: D14 is sequenced too late for the part of D14 that D13 needs

D14 is currently blocked by D4, D12, and D13, and D13 unblocks D14. That is valid only for final command-facing fence proof. It is not valid for D14's scope-control content.

D13 explicitly includes Authoring Topology refusal/future trigger behavior. D14 defines the unsupported authoring actions, future acceptance criteria, investigation/proof requirements, and deferral trigger. If D13 implements unsupported Authoring Topology refusal variants before those D14 decisions exist, D13 must either invent the unsupported-action boundary locally or keep it vague. Both violate the intended single authority for the Future Authoring Topology boundary.

Repair:

- Split D14:
  - D14a: early design-only fence after D0/D1/G-HOST, or at latest before D13 implementation. It owns unsupported action inventory, future acceptance criteria, and deferral trigger.
  - D14b: late closure after D4/D12/D13. It proves classify/verify/scaffolding examples and keeps Phase 3 from adding authoring generators.
- Alternative: keep one D14 packet but change sequencing so D14 design closure precedes D13 implementation, while D14 validation tests remain blocked by D13.

Do not allow D13 to implement Authoring Topology refusal text or variants from ad hoc local wording.

## P2 Findings

### P2-SEQ-001: D11 should depend on D3 for pre-push affected-target truth

D11 names Workspace Graph Integration as the owner of affected target truth, but its dependency order is only D1, D6, D7, D9, and D10. None of those force D3 to be closed.

Current code supports the risk: `hooks.ts` has a hard-coded `prePushTargets` list and runs `nx affected`, while D3 is the packet that centralizes Nx graph/project/target facts and resolves false-green alias risk. If D11 changes pre-push target selection, base behavior, or target proof before D3 stabilizes graph truth, Local Feedback can accidentally own graph policy.

Repair:

- Add D3 as a D11 dependency for pre-push affected-target behavior, or
- Split D11 into:
  - D11a pre-commit local feedback after D6/D7/D9/D10.
  - D11b pre-push affected-target feedback after D3 and preferably after D12's verify proof model.

This is not a blocker for hook UX design against stable contracts, but it should block D11 closure claims involving pre-push affected targets.

### P2-SEQ-002: D15-triggered shared substrate edits need a single sequential owner

D15 is correctly framed as trigger-only, but multiple consuming packets could plausibly trigger it: D6, D7, D9, and D11 all touch command provenance, cache/freshness, bounded output, or git state.

Current code already exposes and uses shared substrate files: `habitat-process.ts`, `effect-runtime.ts`, `effect-parity.ts`, and exported `HabitatCommandResult` types. If two packets independently activate D15 in parallel, they can create incompatible provenance fields or public proof DTO changes.

Repair:

- Keep D15 decision checks packet-local.
- If the decision requires edits to shared substrate files or exported types, create exactly one focused substrate slice with one owner.
- Other packets may consume that slice only after it closes, or they must keep their provenance modeling inside packet-local DTOs.

D15 should never become a broad Effect migration, and it should never be used as a hidden prerequisite for the whole suite.

### P2-SEQ-003: "Expected exit 0 after risks are fixed or explicitly non-claimed" needs a stricter receipt rule

Several packet proof templates correctly separate proof classes, but the phrase pattern "expected exit 0 after current-tree proof risks are fixed or explicitly non-claimed" can become a closure loophole if reused in implementation receipts.

The safe interpretation is:

- A packet may non-claim proof classes outside its objective.
- A packet may not non-claim a mandatory validation gate that its own closure depends on.
- If a command is listed as implementation proof for the packet objective, failure means blocked, repaired, or the command must be moved out of the closure claim with owner and trigger.

Repair:

- Add a shared receipt rule to the suite or remediation notes:
  - "Non-claims narrow what a passing receipt proves; they do not convert a failed required gate into closure evidence."
  - "Every command receipt must state exact command, expected status, actual status, proof class, freshness/cache stance, and excluded claims."

This matters most for D1, D7, D10, D11, and D12, where command proof can easily be mistaken for broader current-tree, CI, runtime, or product proof.

## Safe Parallelism Plan

The suite can safely run as a staged DAG with these constraints:

1. Sequential root:
   - D0, then D1, then D2 contract freeze.

2. First parallel wave after D0/D1:
   - G-HOST can run while D2 proceeds.
   - D2 schema/projection contract must freeze before consumer implementation.

3. Second parallel wave after D2:
   - D3, D5, and D6 can proceed in parallel if registry fixture/schema edits are coordinated by D2.
   - D4 may begin after D3.
   - D8 may begin after D5/D6 contracts stabilize.

4. Generated/protected-zone gate:
   - D10 after G-HOST and D2.
   - D7 and D9 must not claim closure before D10.

5. Enforcement/apply wave:
   - D7 after D5/D6/D10.
   - D9 after D8/D6/D10.
   - D12 after D3/D7.
   - D11 after D7/D9/D10, plus D3 for pre-push target truth.

6. Scaffolding/fence wave:
   - D13 generic project refusal design after D0/D2.
   - D13 pattern candidate semantics after D8.
   - D13 host-specific refusals after G-HOST.
   - D14a scope fence before D13 Authoring Topology refusal implementation.
   - D14b final fence proof after D4/D12/D13.

7. D15:
   - No default wave.
   - Trigger only inside a consuming packet after local DTO alternatives fail.
   - Shared substrate edits are sequential and single-owner.

## Packetization Recommendations

Keep separate:

- D0 and D1: public contract and proof vocabulary are different authorities.
- D2 and D3: registry metadata and Nx graph truth have different owners and proof classes.
- D5, D6, D8: baseline, diagnostics, and governance must not collapse into one Pattern Authority blob.
- G-HOST and D10: host declaration jurisdiction is separate from generated/protected-zone enforcement.
- D7, D9, D11, D12: check, apply, hooks, and verify produce different proof classes and non-claims.
- D15: keep as a trigger packet/decision record, not a standalone implementation default.

Split:

- D14 into early scope authority and late command-facing proof, unless D13 is changed to depend on D14 design closure.
- D11 into pre-commit and pre-push slices if D3/D12 timing would otherwise delay useful local-feedback work.

Do not merge:

- D9 into D6 or D8. Apply safety is neither diagnostic proof nor governance admission.
- D13 into D8. Candidate generation and registered lifecycle are related but have different public/refusal surfaces.
- D15 into D1. Proof labels and process substrate are different authority levels; merging them would pressure a broad substrate migration.

## Special Focus Notes

### G-HOST

The current G-HOST sequence is valid: after D0/D1, parallel with D2, before D10/D13/D9 closure. It is a jurisdiction gate, not a metadata projection. It should stay small: declarations, missing-policy refusals, and consumer matrix.

### D10

D10 is correctly positioned after G-HOST and D2 and before D7/D9/D11. Its proof language should keep generated-zone proof separate from regeneration freshness, hook feedback, and runtime/product behavior.

### D14

D14 is the only packet whose current order is materially suspect. The packet contains two different change rates:

- early scope authority: unsupported authoring actions and future acceptance criteria;
- late proof/examples: command-facing refusal behavior through D13 plus classify/verify examples through D4/D12.

Those should not be forced into one late sequential point.

### D15

D15's trigger-only framing is correct and important. Current code already contains Effect/process substrate, so D15 should function as a minimization test, not a technology-choice door. Shared substrate edits must be serialized.

### Proof/Evidence-To-Receipt Language

Proof receipts must preserve proof-class boundaries:

- OpenSpec validation proves artifact shape.
- Unit/integration tests prove local source contracts under test conditions.
- Command behavior proves the exact command path under recorded freshness/cache conditions.
- Hook pass proves local feedback only.
- Verify assembles handoff proof and does not replace CI, runtime, Graphite submit, or product proof.
- D15 provenance proves command execution facts only when triggered; it does not prove product behavior.

The suite should make the "non-claim does not close a failed required gate" rule explicit before implementation packets start producing receipts.

