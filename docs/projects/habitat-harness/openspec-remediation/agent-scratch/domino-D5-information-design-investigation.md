# D5 Baseline Authority Information-Design Investigation

## Review Scope

Fresh D5 information-design review for `deep-habitat-d5-baseline-authority`.

Sources read:

- `$PHASE2_PACKET_DIR/D5-baseline-authority.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/proposal.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/design.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/tasks.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/workstream/phase-record.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md`
- `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md`
- `$AGENT_SCRATCH/domino-D5-review.md`
- `$REMEDIATION_DIR/context.md`
- `$REMEDIATION_DIR/packet-index.md`
- D2/D7/D8 source/spec references where needed to check handoff boundaries.

Command run:

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`: passed. This validates OpenSpec shape validity only; it does not validate D5 execution readiness.

## Verdict

D5 does not advance. The artifact set is still organized as a scaffold about what a future packet must contain, not as the complete Baseline Authority execution contract. An executor can see that D5 is important, but cannot recover the full scenario/state/public-surface/write-set/validation/downstream handoff path without rereading the source packet, current code, D2, D7, D8, and prior reviews.

The core information-design defect is that the current packet places required decisions in later execution positions even though the framed objective says D5 must settle them in the design/specification packet. That makes the implementation agent choose product/domain tradeoffs that D5 is supposed to settle.

## P1 Blockers

### P1-1: The packet has no executor-facing D5 contract map

The requested executor view is: scenario, owner, state model, public surfaces, write/protected sets, validation gates, downstream handoff, status, and stop conditions. D5 does not present that map in one recoverable place.

Evidence:

- `proposal.md:21-29` has scenario and broad change bullets, but no state table or execution map.
- `design.md:15-27` repeats the same broad contract language rather than expanding it into states, surfaces, and handoffs.
- `design.md:46-54` says the executor must have D0 disposition, a concrete write set, tests, and repaired findings before implementation, but the artifact does not provide those details.
- `tasks.md:14-16` turns the central design work into three generic implementation tasks.
- `spec.md:3-13` has only two scenarios: existing debt and new debt.

Why this blocks: the D5 source packet requires explicit empty, explicit debt, external exception, malformed, missing, orphan, introduced-rule expansion, and shrink-only failure states. Current code evidence has even more precise refusal states: `BaselineContractFailureReason` spans missing, malformed, unsorted, duplicate, non-string, orphan, external-exception, comparison-source, parser-owned, and rule-introduction failures in `tools/habitat/src/lib/baseline.ts:24-43`. The test suite already names many of those states in `tools/habitat/test/lib/baseline.test.ts:27-310`. None of that is shaped into the OpenSpec contract.

Required repair: add an executor-facing "D5 Execution Contract" section to `design.md` with one table per required reader question:

- Scenario and owner: Baseline Authority owns debt-state authority; D2, D7, and D8 are consumers only.
- State model: each D5 state/refusal, trigger, owned fields, public projection, allowed next action, and validation validation.
- Public surfaces: D0 `surface_id` rows or explicit "D0 row required before implementation" blockers for baseline JSON, command JSON/human output, exported baseline APIs, `--expand-baseline`, Pattern Governance consumer messages, docs/examples.
- Write set: source modules/tests/fixtures/baseline JSON/doc artifacts allowed for D5 implementation.
- Protected set: D7 pipeline implementation, D8 lifecycle/admission implementation, generated artifacts, unrelated rule execution redesign, non-D5 baselines, and broad command-schema changes without D0 rows.
- Gates: separate design-time gates from later implementation gates.
- Downstream handoff: exact D7 and D8 consumer contracts.
- Status/stop conditions: packet status plus complete stop matrix.

### P1-2: The normative spec delta does not encode the state model

The OpenSpec spec is the highest-scent artifact for implementers and validators, but it reduces D5 to one requirement and two scenarios. This fails the skim test: reading only `spec.md` does not tell an executor which baseline states must exist or which states block closure.

Evidence:

- `spec.md:5` says baselines are shrink-only authority, but does not define the authority states.
- `spec.md:7-13` covers a matched row and a new unbaselined violation only.
- The source packet's "Contract" section enumerates explicit empty baseline, explicit debt baseline, external exception baseline, malformed baseline, missing baseline, orphan baseline, introduced-rule baseline expansion, and shrink-only failure.

Required repair: split `spec.md` into separate requirements with scenarios for each state family:

- `Requirement: Baseline Files Declare Explicit Debt State`
- `Requirement: Malformed, Missing, And Orphan Baselines Refuse`
- `Requirement: External Exception Sources Have Modeled Projection Contracts`
- `Requirement: Baseline Integrity Is Shrink-Only`
- `Requirement: Rule Introduction Manifests Authorize Seeded Debt Only For New Rules`
- `Requirement: Baseline Authority Projection Is The Only D7/D8 Consumer Contract`

Each scenario must name the trigger, the D5-owned result, the public/refusal projection, and the stop condition. "Existing debt is checked" and "new debt appears" are not enough.

### P1-3: D5 still delegates product/domain decisions to implementation

The packet says the later executor must record the concrete write set and protected paths in the phase record (`tasks.md:9`) and must have D0 public-surface disposition and a concrete write set before implementation (`design.md:48-53`). That is backwards for this remediation pass. D5 is supposed to specify those decisions now.

Evidence:

- `proposal.md:51-52` says the expected Habitat implementation write set is named in `design.md`, but `design.md` only says a write set must exist.
- `tasks.md:9` asks the implementation agent to record the write/protected sets.
- No artifact lists concrete files such as `tools/habitat/src/lib/baseline.ts`, `tools/habitat/src/lib/command-engine.ts`, baseline tests/fixtures, baseline JSON paths, D2 projection touchpoints, or D8 consumer tests as allowed or protected.

Why this blocks: an executor can either under-edit and leave D5 incomplete, or over-edit into D7/D8 because the packet has not constrained where D5 stops. That violates the OpenSpec artifact contract requiring owners, write set, protected paths, gates, and stop conditions before implementation.

Required repair: add a write/protected-set matrix to `design.md` and mirror it in `phase-record.md`. Do not phrase it as "record later." The packet must say exactly which paths are authorized for D5 implementation and which are out of scope unless another packet is explicitly opened.

### P1-4: D5/D8 handoff language leaks authority

The packet repeatedly says D5 will "D5 publishes baseline authority projection/refusal results for D7 and D8" (`proposal.md:28`, `design.md:25`, `tasks.md:15`). That wording leaves two unsafe readings: D5 defines D8 lifecycle/admission behavior, or D5 cannot finish until D8 lifecycle/admission is designed. Both contradict the source packet and D8's owner boundary.

Grounding:

- D2 says `ruleBaselineFacts` are consumed by D5, and D5 owns baseline load state, shrink-only behavior, stale/structural-debt records, and expansion refusal.
- D8 source says Pattern Authority owns lifecycle/admission, and Baseline Authority does not decide pattern lifecycle.
- D7 source says Structural Enforcement consumes baseline projections and must not read baseline internals.

Required repair: replace "publish D5 baseline authority projection/refusal results for D7 and D8" everywhere with a one-way contract:

"D5 consumes D2 `ruleBaselineFacts` and publishes Baseline Authority decisions/refusals for D7 and D8. D7 consumes the projection for enforcement report construction. D8 consumes the projection as one admission prerequisite, but D8 owns Pattern Authority lifecycle and admission."

The downstream ledger must split D7 and D8 into separate rows with exact handoff fields and non-claims.

## P2 Blockers

### P2-1: Durable packet artifacts use brittle absolute paths instead of remediation variables

`proposal.md:14-19` and `phase-record.md:7-10` repeat the active local worktree path. `$REMEDIATION_DIR/context.md` explicitly defines `$ACTIVE_REMEDIATION_WORKTREE`, `$ACTIVE_REMEDIATION_BRANCH`, `$PHASE2_PACKET_DIR`, `$OPENSPEC_CHANGES`, and path templates to avoid this.

Required repair: in durable D5 artifacts, replace repeated absolute paths with context variables:

- source packet as `$PHASE2_PACKET_DIR/D5-baseline-authority.md`
- change root as `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority`
- current checkout facts as `$ACTIVE_REMEDIATION_WORKTREE` and `$ACTIVE_REMEDIATION_BRANCH`

Tool calls and one-off investigation notes can use absolute paths. Durable packet docs should route through the context fixture.

### P2-2: Validation gates mix design-time and implementation-time validation

`phase-record.md:17-20` correctly identifies a design/preparation gate, but `phase-record.md:22-28`, `proposal.md:72-78`, and `tasks.md:18-24` list implementation validation commands as if they are all current exact gates. The current remediation work has only validated OpenSpec shape validity. It has not implemented source changes or validated runtime behavior.

Required repair: split validation into two tables:

- Design-time gates: `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`, `bun run openspec:validate`, `git diff --check`, review-ledger P1/P2 disposition, and spec completeness checks.
- Later implementation gates: `bun run --cwd tools/habitat test -- test/lib/baseline.test.ts`, `bun run habitat check --rule baseline-integrity --json`, injected bad-case matrix, D0 compatibility checks, and downstream consumer tests.

Also replace the broad `bun run habitat check --json` gate with the source packet's targeted `bun run habitat check --rule baseline-integrity --json` for D5 baseline validation. Broad check output can be an additional D7/D7-adjacent validation, but it is not the D5 state-machine gate.

### P2-3: The downstream realignment ledger is too generic to guide D7/D8

`downstream-realignment-ledger.md:5-9` names "Later domino packets" instead of D7 and D8. D5 directly unblocks those packets, and both need different handoffs.

Required repair: replace generic rows with at least:

- D7 Structural Enforcement Pipeline: consumes Baseline Authority decision/refusal projection; does not load/validate baselines directly; must preserve report construction boundary.
- D8 Pattern Governance: consumes Baseline Authority projection as an admission prerequisite; does not define baseline shrink-only behavior or infer admission from baseline file presence.
- D0 Public Surface Matrix: must enumerate baseline JSON, command JSON/human output, package exports, `--expand-baseline`, and docs/examples before source implementation.
- D2 Rule Registry Metadata: provides `ruleBaselineFacts`; D5 does not parse whole registry rows.

### P2-4: The tasks are not implementation steps

Tasks `2.1` through `2.3` are high-level design slogans, not executable work. They ask the implementer to "Define", "Connect", and "Specify" the core D5 domain. That violates the artifact contract: tasks must be implementation steps, not unresolved design questions.

Required repair: rewrite tasks so each one maps to a named state/spec scenario and file target. Example task shapes:

- Implement/repair the `BaselineAuthorityState` union for explicit empty, explicit debt, external exception, and contract refusals in the apvalidated source file.
- Implement/repair rule-introduction manifest matching with fields named in `design.md`.
- Add/repair tests for missing, malformed, orphan, parser-owned, external projection mismatch, comparison-source failure, introduced-rule manifest missing/mismatch, and shrink-only expansion refusal.
- Project baseline authority decisions into the apvalidated D7/D8 consumer surface without exposing baseline internals.

### P2-5: Public-surface compatibility remains a pointer, not a usable inventory

`proposal.md:64` says check output may report baseline decisions more precisely within D0 compatibility rules. `design.md:50-51` says D0 disposition is required for every touched public surface. Neither artifact enumerates the D5 surfaces or cites D0 row ids.

Required repair: add a D5 public-surface table. If D0 row ids do not exist yet, each row should explicitly block implementation until D0 is repaired. The table should include baseline JSON files, baseline-related command JSON fields/messages, package exports from the baseline module, `--expand-baseline` behavior, Pattern Governance baseline prerequisite messages, and docs/examples that display baseline failures.

## Wording-Audit Hits

These phrases require repair before acceptance because they imply incomplete scope, unclear ownership, or implementation-time decision-making:

- "OpenSpec packet scaffold" in `proposal.md:7`, `phase-record.md:14`, and review ledger rows. For D5 acceptance, use "complete D5 Baseline Authority design/specification packet" or keep status explicitly "draft; not accepted."
- "It resolves scope..." in `proposal.md:7-9`. This is currently false; scope/write set/public surfaces/state model are not resolved.
- "D5 publishes baseline authority projection/refusal results for D7 and D8" in `proposal.md:28`, `design.md:25`, and `tasks.md:15`. Replace with the one-way D2 -> D5 -> D7/D8 projection wording above.
- "orphan and removed-entry handling", "baseline state lifecycle", "matched baseline entry", and "owning remediation path" in `proposal.md:27-29` and `spec.md:8-13`. Replace with closed states: matched explicit debt key, explicit empty, external exception projection match/mismatch, unmatched new violation, orphan key, malformed file, missing file, parser-owned mismatch, introduced-rule manifest accepted/refused, and shrink-only growth refusal.
- "Before implementation starts, the executor must have..." in `design.md:48`. For this pass, D5 must provide these artifacts, not tell the executor to obtain them later.
- "Record the concrete write set and protected paths in the phase record" in `tasks.md:9`. Replace with a completed write/protected-set table in the design and phase record.
- "Later domino packets" in `downstream-realignment-ledger.md:9`. Name D7 and D8 separately.
- `bun run habitat check --json` in `proposal.md:75`, `tasks.md:21`, and `phase-record.md:25`. Use the D5-targeted `bun run habitat check --rule baseline-integrity --json` gate for baseline authority validation.

## Required Restructuring

The packet should be reorganized around the executor's path through the decision, not around generic OpenSpec headings.

Required structure for `design.md`:

1. Frame and status: D5 is design/specification only; current state is not accepted until P1/P2 review disposition is clean.
2. Boundary map: Baseline Authority owns debt-state authority; D2/D7/D8 handoffs are named and one-way.
3. State model table: every state/refusal with trigger, fields, public projection, validation, stop condition.
4. Public-surface table: D0 row id or blocking "D0 row missing" for each affected surface.
5. Write/protected-set table: concrete paths and prohibited adjacent edits.
6. Consumer projection table: D2 input, D7 output, D8 output, non-claims.
7. Validation matrix: design-time gates separated from implementation-time gates.
8. Downstream realignment: D7 and D8 split, with exact next actions.

Required structure for `spec.md`:

- Multiple requirements, each with scenarios for one state family.
- Scenarios must use D5-owned target terms, not vague row/lifecycle language.
- Each scenario should make clear whether the outcome is pass, baselined, unbaselined failure, contract refusal, or stop condition.

Required structure for `tasks.md`:

- Each implementation task maps to a spec scenario and an allowed path.
- No task asks the implementer to choose target language, public compatibility, write sets, protected sets, D8 lifecycle/admission semantics, or validation strategy.

## Acceptance Conditions

D5 can advance only after:

- The D5 state model is normative in the spec delta and summarized in design.
- D5 public surfaces and D0 compatibility dependencies are enumerated.
- Write/protected sets are concrete and present before implementation.
- Design-time and implementation-time gates are separated.
- The D2/D5/D7/D8 handoff is a one-way projection contract with owner boundaries intact.
- The downstream ledger names D7 and D8 separately.
- Reduced-standard wording is removed or explicitly marks the packet as draft/not accepted.
- The review ledger dispositions accepted P1/P2 findings and no longer relies on "global constraints applied" as acceptance evidence.

## Non-Claims

- This investigation does not accept D5.
- This investigation does not edit OpenSpec packet files or Habitat source.
- Passing `openspec validate` validates only packet shape validity.
- Current Habitat code/tests are evidence for missing contract shape, not authority to preserve existing names or implementations.

Skills used: domain-design, information-design, solution-design, civ7-open-spec-workstream.
