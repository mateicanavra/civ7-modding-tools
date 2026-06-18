# D8 Domain/Ontology Investigation

Status: BLOCKING.

Current disk does not satisfy the complete D8 domain contract. The Phase 2 D8 source packet is strong controlling input, but the current OpenSpec packet still leaves lifecycle states, decision inputs, refusal reasons, owner boundaries, naming, and consumer projections for a later execution agent to invent.

## Sources Read

- `git status --short --branch --untracked-files=all`; worktree was clean on `codex/d8-pattern-governance-packet` before authoring.
- `gt status`; Graphite delegates to Git in this checkout and reported a clean worktree.
- Root `AGENTS.md`.
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`.
- All directly referenced Ontology Design reference files: `axes.md`, `principles.md`, `where-defaults-hide.md`, `representation-choices.md`, `operationalization.md`, `maintenance.md`, `examples.md`, and `source-map.md`.
- Relevant context from `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`.
- Relevant context from `.agents/skills/civ7-open-spec-workstream/SKILL.md`, including `references/source-map.md` and `references/phase-loop.md`.
- `docs/projects/habitat-harness/openspec-remediation-frame.md`.
- `docs/projects/habitat-harness/openspec-remediation/context.md`.
- `docs/projects/habitat-harness/phase2-workstream-packets/README.md`.
- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`.
- Current D8 OpenSpec packet files under `openspec/changes/deep-habitat-d8-pattern-governance/`: `proposal.md`, `design.md`, `tasks.md`, `specs/habitat-harness/spec.md`, and workstream ledger/checklist files.
- D0, D1, D2, D5, D6, and D7 OpenSpec spec deltas where they define consumed contracts.
- Accepted review records for D0, D2, D5, D6, and D7 domain/ontology acceptance, plus D1 domain/ontology status as non-accepted input.
- Boundary packets for D9 apply transactions, D11 local feedback, and D13 generator/refusal behavior, including Phase 2 source packets and current OpenSpec spec/design files.

## Frame

D8 is the Pattern Governance domain. It owns admission and lifecycle decisions for structural patterns. It does not own rule registry metadata, diagnostic acquisition, baseline truth, enforcement report construction, apply transaction safety, hook behavior, or generator file creation.

The standard engineering ontology is admission control plus lifecycle governance:

- Pattern Governance is the bounded context and policy model.
- Pattern Authority is the decision authority and durable decision record inside that context.
- A Pattern Authority decision admits, refuses, retires, or changes the capability admission of one pattern.
- A pattern candidate is source evidence or a proposed work item until Pattern Authority admits it.
- Registry rows, baseline files, Grit diagnostics, fixture runs, hook eligibility, and apply requests are inputs or consumers. None of them are admission authority by existence.

The remediation frame requires complete OpenSpec implementation-control packets. The D8 OpenSpec packet therefore must do more than restate the Phase 2 packet. It must define enough domain language, state, input contracts, projections, refusals, and validation gates that implementation cannot create new lifecycle semantics while editing TypeScript.

## Domain/Ontology Findings

The Phase 2 D8 source packet correctly identifies the state-space defect: pattern candidate generation, manifest validation, rule registration, Grit rows, baseline files, and hook scope currently combine to imply admission. That is the right problem.

The current disk packet has not yet converted that problem into a complete ontology. `design.md` names the owner and scenario, then repeats three target bullets: define lifecycle states, separate generated candidates from registered enforcement, and connect governance to D2/D5. `spec.md` has one requirement with two scenarios. That is not enough to define identity, state transitions, input evidence, refusal states, decision records, maintenance behavior, or consumer projections.

The current packet also omits D6 from the target contract even though D6 is a listed prerequisite and is essential to D8. D8 cannot admit a diagnostic pattern without consuming D6 diagnostic capability, fixture result, injected probe outcome, observed diagnostic identity limitations, and diagnostic non-claims. D2 can tell D8 which rule and pattern identity relation exists; D6 tells D8 whether there is an accepted diagnostic capability and what validation evidence exists.

Pattern Governance and Pattern Authority are not yet separated. The design says the owner is Pattern Governance and the product scenario uses Pattern Authority, but it does not define whether Pattern Authority is a ledger, manifest authority, approval board, command contract, package module, or decision record. That ambiguity matters because D2 publishes `ruleGovernanceFacts`, D5 publishes baseline authority projections, D6 publishes diagnostic capabilities, D9 consumes apply admission, and D13 writes candidates. These consumers need stable endpoints.

The packet also carries inherited terms that have not earned their place. The source packet's states `registered diagnostic pattern`, `registered hook-scoped pattern`, and `registered apply-approved pattern` combine registry membership, diagnostic capability, hook eligibility, and apply admission into state names. The better model is a lifecycle state plus separate capability admission decisions. Registration is a registry concept owned by D2; diagnostic capability is D6; local feedback consumption is D11; apply transaction execution is D9. D8 owns admission, not those adjacent operations.

## Required D8 State Model

D8 should define a closed `PatternAuthorityDecision` model with stable pattern identity, decision identity, decision author/owner, source evidence, accepted inputs, lifecycle state, capability admissions, refusals, supersession, and consumer projections.

Lifecycle states:

- `candidate-draft`: a proposed pattern exists. It is non-enforcing, not admitted, not apply-approved, and not local-feedback-approved.
- `candidate-under-review`: Pattern Authority has accepted the candidate for review and is evaluating required decision inputs. This state still has no enforcement or apply authority.
- `admitted`: Pattern Authority accepts the pattern identity and at least one capability admission. The admitted lifecycle state must point to each accepted capability decision.
- `refused`: Pattern Authority rejects admission for a closed refusal reason. A refused pattern may retain source evidence and recovery guidance, but it is not enforcement authority.
- `retired`: Pattern Authority withdraws current admission. Retired records preserve historical identity, replacement/supersession where present, and consumer migration guidance.

Capability admission states:

- `diagnostic-admitted`: D8 accepts a pattern for diagnostic use after D2 identity/governance facts, D6 diagnostic capability, fixture/probe evidence, false-positive assessment, and D5 baseline projection/refusal disposition are all resolved.
- `local-feedback-admitted`: D8 accepts that the diagnostic pattern may be surfaced to local feedback consumers. D11 still owns hook orchestration, output, and non-claims.
- `apply-admitted`: D8 accepts that this pattern may be offered to D9 as an apply-capable pattern. D9 still owns dry-run, live mutation, path approval, rollback, formatter handoff, gate outcomes, and recovery instructions.

Refusal states:

- `manifest-missing`.
- `manifest-invalid`.
- `pattern-identity-missing`.
- `pattern-identity-conflicted`.
- `d2-governance-reference-missing`.
- `d2-governance-reference-contradicted`.
- `d6-diagnostic-capability-missing`.
- `diagnostic-fixture-missing`.
- `diagnostic-fixture-insufficient`.
- `injected-probe-missing`.
- `injected-probe-rejected`.
- `false-positive-assessment-missing`.
- `false-positive-assessment-rejected`.
- `baseline-authority-missing`.
- `baseline-authority-refused`.
- `local-feedback-admission-rejected`.
- `apply-admission-rejected`.
- `retirement-target-missing`.
- `public-surface-compatibility-missing`.

Decision inputs:

- D0 public surface rows for every command, JSON, package export, generator, hook, docs example, and durable schema touched by D8.
- D1 command/report/refusal family where D8 reports malformed admission input or public command output.
- D2 `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`; D8 must not read whole registry rows as authority.
- D5 baseline authority projection or baseline refusal result; D8 must not decide baseline truth, shrink-only policy, external exception projection, or rule-introduction baseline acceptance.
- D6 diagnostic capability, accepted diagnostic identity, fixture outcome, injected probe outcome, limitations, and diagnostic non-claims; D8 must not parse raw Grit output or turn diagnostic success into admission by itself.
- D13 candidate handoff when the input came from generation. D13 writes candidate files; D8 decides admission.
- Human or maintainer decision input: owner, reason, reviewer, decision time, accepted sources, recovery guidance, supersession, and non-claims.

Consumer projections:

- `PatternAuthorityProjection`: durable D8 projection for D2/D13 that names pattern id, manifest path, lifecycle state, admitted capabilities, refusal reason where present, and supersession.
- `DiagnosticAdmissionProjection`: D8-to-D7 context that says whether a selected diagnostic pattern is admitted for enforcement consumption. D7 still builds check outcomes from D2/D5/D6 projections.
- `ApplyAdmissionProjection`: D8-to-D9 context that says whether a pattern is admitted for apply consideration. D9 still proves transaction safety.
- `LocalFeedbackAdmissionProjection`: D8-to-D11 context that says whether local feedback may present the pattern. D11 still owns hook-local behavior and non-claims.
- `CandidateHandoffProjection`: D8-to-D13 context that keeps generated pattern output candidate-only and states the exact next admission requirements.
- `PatternRecoveryProjection`: recovery guidance for refused or retired patterns, including owner, reason, next allowed action, and superseded decision if present.

## Boundary Decisions

D8 owns:

- Pattern identity admission as Pattern Authority decision.
- Lifecycle state and capability admission state.
- Refusal reason taxonomy for admission.
- Manifest acceptance as an admission input, not as D2 registry truth.
- Fixture sufficiency and false-positive assessment for pattern admission.
- Whether a diagnostic pattern may be admitted for local feedback or apply consideration.
- Consumer projections that prevent D2, D7, D9, D11, and D13 from inferring admission from nearby facts.

D8 does not own:

- D2 registry schema, row identity, ownerTool compatibility, execution adapter, path coverage, graph facts, baseline facts, Grit facts, local feedback facts, or whole-row public compatibility.
- D5 baseline acceptance, baseline integrity, external exception projection, shrink-only behavior, baseline application, or seeded baseline expansion.
- D6 diagnostic catalog identity, Grit command acquisition, observed diagnostic identity handling, adapter failures, scan root decisions, diagnostic projection, cache/freshness states, or injected probe cleanup semantics.
- D7 structural enforcement selection, execution disposition, diagnostic/baseline application, report rendering, `CheckReport.ok`, exit status, D11 projection, or D12 projection.
- D9 dry-run inventory, live write execution, rollback, path approval, formatter handoff, gate execution, or transaction recovery.
- D11 hook orchestration, hook trace schema, local output, Graphite base resolution, or hook non-claims.
- D13 project generation, candidate file writing, unsupported generator refusals, or host-specific generation refusal.

## Naming Repairs

Use `Pattern Governance` for the bounded context and `Pattern Authority` for the decision authority/decision record. Do not use them as interchangeable labels.

Replace `registered diagnostic pattern` with `diagnostic-admitted pattern` unless the text is explicitly discussing a D2 registry row. Registration is D2 vocabulary; admission is D8 vocabulary.

Replace `registered hook-scoped pattern` with `local-feedback-admitted pattern`. Hook execution and output belong to D11; D8 decides only admission for local feedback presentation.

Replace `registered apply-approved pattern` with `apply-admitted pattern`. Apply transaction safety belongs to D9; D8 decides only admission for apply consideration.

Replace `baseline policy` in D8 target language with `D5 baseline authority projection` or `D5 baseline refusal result`. D8 consumes D5; it does not define baseline policy.

Replace `reviewed` as a standalone lifecycle state unless the packet defines who reviewed what, which input set was reviewed, what decision was produced, and what consumers may infer. Use `candidate-under-review` for pre-decision work and `admitted` or `refused` for decisions.

Current disk uses the historical phrase "OpenSpec packet scaffold" in D8 proposal and phase record. That wording is superseded for this pass. D8 must be described as a complete OpenSpec packet or incomplete OpenSpec packet; the historical phrase must not become acceptance language.

## P1/P2 Blockers

### P1: Current D8 packet does not define the lifecycle ontology it requires

`design.md` only says D8 will define lifecycle states and admission gates. `spec.md` names candidate, reviewed, registered, refused, and retired states, but does not define closed states, transitions, required inputs, invariants, refusal reasons, or state-specific consumer meaning. This leaves the most important D8 design decision for implementation.

### P1: Pattern Governance and Pattern Authority boundary is undefined

The packet names Pattern Governance as owner and Pattern Authority as the promotion/rejection mechanism, but does not define Pattern Authority as a decision record, manifest authority, approval process, or projection source. Adjacent packets cannot consume a stable authority endpoint from the current text.

### P1: D8 consumed-contract matrix is missing

D8 must consume exact D2, D5, and D6 projections. The current packet says D8 connects to D2 facets and D5 baselines, but it does not name `ruleGovernanceFacts`, `ruleGritFacts`, `ruleBaselineFacts`, `BaselineAuthorityProjection`, baseline refusal result, D6 diagnostic capability, injected probe outcome, or D6 limitations. It also does not explicitly forbid whole registry row reads, raw baseline reads, or raw Grit parsing.

### P1: Refusal taxonomy is absent

The source packet requires refusal states for missing manifest, fixtures, baseline contract, hook-scope decision, and apply-safety absence. Current disk collapses refusal into one unnamed state and has no normative refusal scenarios. Without closed refusal reasons, generated candidates, contradicted registry references, missing diagnostic capability, refused baseline authority, and apply admission rejection remain implementation-time judgments.

### P1: Consumer projections are absent

D8 must publish bounded projections for D2/D13, D7, D9, D11, and recovery ledgers. Current disk does not define any D8 projection. That omission lets downstream domains infer admission from file presence, D2 registry state, D5 baseline state, D6 diagnostic success, D7 check behavior, or D13 generation output.

### P2: Current naming preserves domain conflation

The source packet state names combine registration, diagnostics, hook scope, and apply approval. The OpenSpec packet has not repaired that naming. D8 should use admission vocabulary and keep D2 registration, D6 diagnostics, D11 local feedback, and D9 transaction safety separate.

### P2: D6 prerequisite is underrepresented

The proposal lists D6 under `Requires`, but the `What Changes` and design target contract omit D6. D8 admission cannot be complete without D6 diagnostic capability, fixture/probe outcomes, and limitation inputs.

### P2: Validation gates do not prove the D8 state model

The current gates include manifest test, classify, OpenSpec validation, and whitespace checks. They do not require a negative admission fixture proving candidate output cannot become admitted, diagnostic admission cannot imply apply admission, D5 refusal blocks admission, D6 diagnostic capability absence blocks diagnostic admission, or consumer projections reject contradictory states.

### P2: Remediation context branch fixture is stale

`docs/projects/habitat-harness/openspec-remediation/context.md` records `$ACTIVE_REMEDIATION_BRANCH` as `codex/d7-structural-enforcement-packet`, while this checkout is on `codex/d8-pattern-governance-packet`. This does not change D8 ontology, but it is packet hygiene risk for durable path references in the current remediation pass.

## Acceptance Bar

D8 can move out of BLOCKING only when the disk packet defines, normatively and consistently:

- Pattern Governance versus Pattern Authority boundary.
- Closed lifecycle states, capability admission states, transitions, and non-claims.
- Closed refusal taxonomy with scenarios for every required missing or contradicted input.
- Exact D2, D5, and D6 consumed projections and forbidden adjacent-domain reads.
- Exact consumer projections for D2/D13, D7, D9, D11, and recovery records.
- Naming repairs that replace registration/hook/apply conflation with admission vocabulary.
- D0/D1 public-surface compatibility gates for every D8-touched command, JSON, package export, generator, hook, docs example, and durable manifest surface.
- Validation gates with injected bad cases for candidate-only output, contradicted D2 governance facts, D5 baseline refusal, D6 diagnostic capability absence, local-feedback admission rejection, apply admission rejection, and retired/superseded pattern consumption.

Until those conditions are met, the current D8 OpenSpec packet is not accepted for design/specification and must not authorize source refactor implementation.

Skills used: domain-design, information-design, ontology-design, solution-design, civ7-open-spec-workstream.
