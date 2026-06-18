# D7 Cross-Domino Investigation

Status: BLOCKING

## Finding

D7 is not acceptable input yet. The source packet has the right intent, but the
OpenSpec packet lacks executable cross-domino contracts: it says D7 consumes
D2/D3/D5/D6/D10 and unblocks D11/D12, yet it does not define the exact consumed
projections, state families, false-green refusal states, public-surface
blockers, or downstream consumer contracts.

The blocking failure is not that D7 explicitly takes ownership of every adjacent
domain. The failure is that it leaves implementation agents and downstream D11
and D12 packets to infer report semantics from `command-engine.ts` and from
adjacent packets. That violates the stop condition for this review. D7 must make
the enforcement pipeline a published-language boundary: adjacent domains publish
facts/results; D7 composes them into check outcomes; D11/D12 consume those
check outcomes without reinterpreting internals.

## Dependency Ledger

| Consumed contract | Source packet/change | D7 use | Source implementation blocker | Downstream effect |
| --- | --- | --- | --- | --- |
| D0 public-surface rows for `habitat check`, `CheckReport`, `RuleReport`, diagnostics, package exports, Nx target outputs, hooks/docs examples touched by check behavior | D0 `deep-habitat-d0-command-surface-inventory` | Gate any JSON, human output, package export, script/Nx target output, field order, exit behavior, selector behavior, or docs/example change | D0 is accepted for design/specification only; concrete matrix rows must exist before source implementation can change public/durable surfaces | Without explicit rows, D11/D12 cannot know whether check JSON/human semantics are preserved, versioned, facaded, or refused |
| D1 check outcome, rule status, diagnostic, refusal, non-claim, and check-report consistency rules | D1 `deep-habitat-d1-receipt-contract-boundary` | Construct/validate `CheckReport` so `ok`, rule statuses, selector failures, refusals, command failures, advisory-only, no-rules-selected, and non-claims cannot contradict | D1 implementation is blocked until D0 rows exist; D7 must cite the D1 output family for every new failure/refusal shape | D12 needs a stable check summary and non-claims; D11 needs local-only hook output that does not claim CI/verify authority |
| `ruleSelectorFacts`, `ruleReportFacts`, and `ruleExecutionFacts` | D2 `deep-habitat-d2-rule-registry-metadata-contract` | Select rules, render rule report facts, execute through adapter facts, and distinguish selector failure from zero selected rules | Live D2 projection implementation is required; D7 must not consume whole `RuleRegistryRecord`, legacy `HarnessRule`, prose `scope`, or local substitute metadata | D11 hook selection and D12 verify check summary cannot infer selector semantics from whole registry rows |
| `ruleBaselineFacts` and D5 baseline application/integrity results | D2 plus D5 `deep-habitat-d5-baseline-authority` | Apply baseline coverage to executed diagnostics; consume baseline-integrity result for built-in rule; surface D5 refusals as check diagnostics | D5 source implementation requires D0 rows and live D2 baseline projections; D7 must not load baseline internals or decide shrink/growth/manifest/external exception policy | D11 must report baseline-related local feedback as check output only; D12 must skip/execute affected targets based on D7 check result without re-deciding baseline status |
| `ruleGritFacts` and D6 `DiagnosticRunOutcome` / diagnostic consumer projection | D2 plus D6 `deep-habitat-d6-diagnostic-pattern-catalog` | Run/acquire diagnostics, normalize findings/advisory/failure outcomes, and prevent adapter failures from becoming structural pass | D6 implementation requires D0 rows, D1 output-family citations, and live D2 Grit projections; D7 must not parse raw `GritReport`, whole `HabitatCommandResult`, or derive pattern identity from `gritPattern ?? ruleId` | D11 staged/local Grit feedback must consume D7/D6 published outcomes; D12 check summary must distinguish findings from diagnostic acquisition failure |
| D3 graph target facts for Nx-inferred `habitat:check` / `habitat:rule:*` invocation surfaces, not direct check evaluation | D3 `deep-habitat-d3-workspace-graph-boundary` | Respect graph-backed invocation availability and false-green alias prevention for check-related Nx targets | D3 source implementation is blocked until D0 rows and live D2 graph projections exist | D12 consumes D3 target plan facts separately; D7 must not make verify infer graph truth from check internals |
| D10 generated/protected-zone guard/refusal result | D10 `deep-habitat-d10-protected-zone-authority` packet | Treat protected-zone violations/refusals as structural check outcomes without defining host policy or staged guard authority | D10 remains draft/blocking; G-HOST and D2 inputs are unresolved for source implementation | D11 pre-commit generated-zone feedback depends on stable D10 + D7 semantics; D9 apply must not infer generated-zone permission from check pass |
| D7 check outcome state model and report projection | D7 packet itself | Publish the composed enforcement outcome consumed by D11/D12 | Missing today: no closed outcome union, no selector-failure/no-rules/refused/command-failed/advisory-only model, no exact JSON/human compatibility map, no exit semantics | D11/D12 are currently forced to infer report semantics, which is blocking |

## D7 Contracts That Must Be Published

D7 must publish a closed pipeline model before acceptance:

- `CheckRequest` / selector request state: none, requested rule, requested owner,
  requested tool, staged mode, invalid/unknown selector, and unsupported
  selector combination. Invalid selector must be a report/refusal state, not
  zero executed rules.
- `SelectedRuleSet`: selected rule facts from D2, empty-by-valid-selection,
  refused-by-metadata-failure, and blocked-by-unavailable dependency facts.
- `RuleExecutionOutcome`: not-run/refused, command-failed, diagnostic-failed,
  findings, advisory-findings, clean, and protected-zone/baseline refusal
  outcomes. It must carry source owner references without exposing adjacent
  internals.
- `BaselineAppliedRuleOutcome`: result of D5 application, with covered debt,
  new diagnostics, and baseline contract diagnostics distinguishable.
- `CheckOutcome`: pass, fail, advisory-only, no-rules-selected, refused,
  command-failed, blocked-input-authority, and selector-failed. `CheckReport.ok`
  must be derived from this state and rule statuses.
- `CheckReport` construction contract: field inventory, D0/D1 compatibility
  handling, human/JSON truth equivalence, non-claims, exit-code mapping, and
  renderer/stringifier boundaries.
- `D15 trigger decision`: dormant unless D7 can name a command-provenance
  contradictory state that local D7 DTOs cannot encode.

## D11 Consumer Contract Required From D7

D11 must not infer hook semantics from `command-engine.ts` or current check JSON.
D7 must publish:

- the local-feedback-safe check projection D11 may consume;
- which check outcomes stop later hook stages;
- how staged mode maps to D7 without D7 owning D10 staged guard policy;
- selector failure and diagnostic acquisition failure rendering rules for hooks;
- non-claims D11 must preserve: local feedback only, not CI, not verify, not
  product/runtime proof, not apply safety;
- cache/freshness stance for hook-invoked check segments, or a D15 trigger if
  D7 cannot represent it locally.

## D12 Consumer Contract Required From D7

D12 needs a stable check summary, not raw rule reports. D7 must publish:

- `VerifyCheckSummary` or equivalent projection from `CheckReport`;
- exact check outcomes that allow affected Nx execution versus require skipped
  affected state;
- selector-request state, including the replacement for current `{}` placeholder
  behavior;
- bounded diagnostic/count/status summary sufficient for handoff without
  reinterpreting D2/D5/D6/D10 internals;
- non-claims to carry into verify: check does not prove CI, runtime/product
  behavior, apply safety, Graphite readiness, or OpenSpec acceptance;
- exit-code and command-failure mapping so D12 can distinguish failed check from
  failed verify assembly.

## Other Downstream Effects

- D8 may cite D7 check behavior as enforcement/report output. Pattern
  lifecycle and baseline/diagnostic admission remain D8/D5/D6.
- D9 must not use a D7 pass as write approval. Apply approval remains D8/D10/G-HOST
  plus D9 transaction authority.
- D13/D14 should consume D7 through command examples or refusal/handoff
  docs after D7 output compatibility is settled.
- D15 remains dormant unless D7 records a concrete local-state contradiction
  around delegated command provenance, cache freshness, cwd/env, or bounded
  output that cannot be represented inside D7.

## Packet Index And Control Record Updates Needed

Before D7 can be accepted, update the control records as follows:

- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/design.md`:
  replace the incomplete target contract with the dependency ledger, closed state
  model, pipeline stages, D0/D1 compatibility blockers, D11/D12 published
  contracts, D15 trigger decision, write set, protected paths, and falsifying
  validation gates.
- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/tasks.md`:
  split implementation into prerequisites, characterization, model/projection,
  consumer migration, deletion, validation, and downstream realignment tasks.
  Add explicit blockers for concrete D0 rows, live D2/D3/D5/D6 projections, and
  accepted D10 contract state.
- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/specs/habitat-harness/spec.md`:
  add normative requirements for check outcome states, selector failure
  distinction, baseline/diagnostic/protected-zone refusal propagation, false
  green prevention, report validation, and downstream projections.
- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/workstream/downstream-realignment-ledger.md`:
  replace the generic "later domino packets" row with exact D11, D12, D8, D9,
  D13/D14, and D15 rows.
- `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/workstream/review-disposition-ledger.md`:
  record this cross-domino finding as accepted P1/blocking unless a later
  reviewer rejects it with source evidence.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`:
  keep D7 as BLOCKING until the above repairs land and the per-domino review
  ledger records no unresolved accepted P1/P2 findings. Do not mark D7 accepted
  merely because the packet exists.

## Acceptance Bar

D7 becomes acceptable input when a downstream agent can implement D11 or
D12 by reading D7's published projections and non-claims, without opening
`command-engine.ts` to infer check semantics and without re-deciding D2, D3,
D5, D6, or D10 authority.
