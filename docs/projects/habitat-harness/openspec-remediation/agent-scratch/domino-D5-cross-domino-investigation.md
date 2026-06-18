# D5 Cross-Domino Boundary Investigation

## Scope

Fresh D5 cross-domino review for the Deep Habitat OpenSpec remediation pass.

Reviewed D5 against:

- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`
- accepted-design D0-D4 OpenSpec packets under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/`
- D7 and D8 source packets and current OpenSpec scaffolds
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- prior negative-control review at `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`

Verdict: D5 does not advance. The current D5 packet is still a scaffold, not a complete Baseline Authority OpenSpec packet. The cross-domino boundary is not safe enough for D7 or D8 to consume without inventing D5 facts locally or letting D5 leak into their domains.

## Dependency And Sequencing Analysis

D5 requires D0 and D2. That requirement is correct at the design layer, but the current packet does not distinguish design-consumable authority from source-implementation gates.

D0 is accepted for design/specification only. Its design says later packets must cite concrete D0 matrix rows before changing command behavior, command JSON, package exports, scripts, targets, generator behavior, hook output, or public examples. D0 also states source behavior changes discovered by D0 are future packet decisions, not D0 implementation work. Packet index rows for D0-D4 confirm those packets are not implementation-complete.

D2 is accepted for design/specification only. D2 gives D5 the target projection vocabulary: `ruleBaselineFacts` includes rule id, baseline state, exception source, and introduction manifest relation, while excluding whole-row access and file-presence admission. D2 explicitly says D5 owns baseline load state, shrink-only behavior, stale/structural-debt records, and expansion refusal. D2 also says source implementation remains blocked until concrete D0 rows exist.

The current D5 proposal simply lists D0 and D2 as requirements at `proposal.md:37-40`, and `tasks.md:10` says to re-run or cite D0/D2 dependency gates. It does not say:

- D0/D2 accepted design can be consumed for D5 specification now;
- D5 source implementation remains blocked until concrete D0 surface rows exist for D5-touched public surfaces;
- D5 source implementation remains blocked wherever live D2 `ruleBaselineFacts` projections are required;
- D5 must not parse whole D2 registry rows or infer baseline admission from file presence while waiting for D2.

This is a sequencing blocker because D4 already models the required pattern: D4 consumes accepted D2/D3 designs, but source implementation waits for live D2/D3 facts. D5 needs the same source-blocking language for D0 rows and live D2 baseline projections.

Packet index row: the D5 row currently says `Requires: D0, D2`, `Enables: D7, D8`, and `draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING`. That is consistent with D5 being blocked today. If D5 is repaired and accepted for design/specification, the row must be updated to say D5 is accepted for design/specification only and not implementation-complete, with concrete D0 rows and live D2 `ruleBaselineFacts` required before source implementation.

## D5/D7/D8 Boundary Decision List

Required D5 ownership:

- D5 owns baseline file state and baseline authority states: explicit empty, explicit debt, external exception, malformed, missing, orphan, introduced-rule expansion, shrink-only refusal, and any source-packet variants such as parser-owned or comparison-source failures.
- D5 owns baseline integrity/refusal results: whether a baseline is loadable, valid, malformed, missing, orphaned, externally projected, parser-owned, contradicted by D2, or refusing growth.
- D5 owns baseline application result contracts consumed by enforcement: for a diagnostic/finding, whether it is matched explicit debt, matched external exception projection, uncovered new debt, stale/orphan baseline row, malformed baseline state, missing baseline state, or introduction-manifest-authorized seed debt.
- D5 owns the baseline authority projection/refusal result consumed by Pattern Governance: baseline path/source, baseline state, D2 `ruleBaselineFacts` relation, introduction manifest relation, external exception projection equality, shrink-only decision, and refusal reason.
- D5 owns the shrink-only expansion guard and rule-introduction guard. Pattern registration or enforcement execution cannot silently expand baselines.

Required D5 non-ownership:

- D5 does not own D7 enforcement report construction. D7 owns rule selection, execution-stage composition, `CheckReport` constructor semantics, `CheckReport.ok` derivation, rendering/stringifying, selector failure handling, and final structural enforcement status. D5 may only publish baseline integrity/application results that D7 consumes.
- D5 does not own D8 Pattern Governance lifecycle or admission. D8 owns candidate, registered, hook-scoped, apply-apvalidated, refused, and retired pattern states; manifest acceptance; fixture sufficiency; false-positive model; hook-scope decision; and apply-safety decision. D5 may only publish baseline authority projection/refusal results that D8 consumes.
- D5 does not own D2 registry metadata. D2 owns `ruleBaselineFacts`; D5 consumes those facts and must not inspect whole registry rows or treat baseline file presence as registry admission.
- D5 does not own D0 compatibility. D5 must cite D0 rows before source edits that affect baseline JSON, check command JSON/human output, package exports, generator/registration behavior, docs examples, hooks, scripts, or targets.

## Required Downstream Ledger Repairs

The D5 downstream ledger at `workstream/downstream-realignment-ledger.md:5-9` is too generic. It must replace `Later domino packets` with explicit rows, including:

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D0 compatibility matrix | source-blocking prerequisite | Before D5 source edits, cite concrete D0 rows for baseline JSON files, `habitat check` baseline-related command JSON/human output, exported baseline types/functions, `--expand-baseline` behavior, generator/registration baseline messages if touched, docs/examples, and generated/help surfaces if affected. |
| D2 `ruleBaselineFacts` | design-consumable; source-blocking until live | D5 may design against accepted D2 `ruleBaselineFacts`, but D5 source implementation waits wherever live projections are required. D5 must not parse whole registry rows, legacy `exceptionPath`, or file presence as authority. |
| D7 Structural Enforcement Pipeline | blocked until D5 accepted; source-blocking until D5 implementation publishes contracts | D7 may rely only on D5-published baseline integrity/application results: baseline load/validity state, matched explicit debt, matched external exception projection, uncovered new debt, stale/orphan row, missing/malformed state, introduction-manifest decision, and shrink-only refusal. D7 may not rely on D5 for rule selection, diagnostics, `CheckReport` construction, status aggregation, renderer behavior, or enforcement report non-claims. |
| D8 Pattern Governance | blocked until D5 accepted; source-blocking until D5 implementation publishes projection/refusal | D8 may rely only on D5-published baseline authority projection/refusal: baseline path/source, explicit empty/debt/external/malformed/missing/orphan state, D2 baseline relation, introduction manifest relation, external exception projection equality, and shrink-only refusal. D8 may not rely on D5 for lifecycle admission, fixture sufficiency, false-positive model, hook-scope decision, apply-safety decision, or registration approval. |
| Packet index | pending D5 rereview | Keep D5 blocked until accepted P1/P2 repairs are complete. If accepted, update D5 status to accepted for design/specification only; not implementation-complete; source implementation blocked on concrete D0 rows and live D2 `ruleBaselineFacts` wherever required. |

The ledger should also state that D7 and D8 remain their own blocking draft packets until their per-domino gates close. D5 cannot advance those packets by implication.

## P1 Blockers

### P1-1: D5 still lacks the exact D7/D8 handoff contract

D5 source says D5 unblocks D7 and D8, and current packet index repeats that dependency. D7 source says D7 consumes baseline projections and must not read baseline internals. D8 source says D8 consumes the D5 baseline contract and must not bypass it.

Current D5 does not provide that contract. The proposal says D5 will "D5 publishes baseline authority projection/refusal results for D7 and D8" at `proposal.md:27-29`; design repeats the same at `design.md:22-26`; tasks repeat it at `tasks.md:14-16`. The spec has only two scenarios: existing debt and new debt. The downstream ledger collapses D7 and D8 into `Later domino packets`.

This leaves D7 without an application/integrity result contract and D8 without a baseline authority projection/refusal contract. A D7 implementer would have to decide how baseline decisions become report inputs. A D8 implementer would have to decide which baseline facts are sufficient for admission gates. Both are D5 facts. D5 does not advance until it names the exact published facts, exact non-claims, and exact sequencing gates for D7 and D8.

### P1-2: D5/D8 wording still leaks Pattern Governance ownership into D5

The phrase "D5 publishes baseline authority projection/refusal results for D7 and D8" is unsafe. It can mean either:

- D5 defines part of D8 Pattern Governance lifecycle/admission, which violates D8 ownership; or
- D5 waits for D8 lifecycle/admission to exist, which contradicts the D5 -> D8 dependency order.

The correct one-way boundary is: D5 consumes D2 `ruleBaselineFacts` and publishes baseline authority projection/refusal results. D8 later consumes those results and owns Pattern Governance lifecycle/admission. The current D5 packet says `No Pattern Governance ownership collapse` at `proposal.md:35` and `design.md:32`, but it does not define the replacement contract, so the non-goal is not enforceable.

### P1-3: D5 does not encode D0/D2 source-blocking gates

D5 can consume accepted D0/D2 design now, but D5 source implementation remains blocked wherever concrete D0 rows or live D2 projections are required. The current D5 artifacts do not say that. `tasks.md:12-16` moves straight from pre-implementation grounding into implementation tasks, and `phase-record.md:22-28` lists runtime validation commands without separating design-time validation from later implementation gates.

This contradicts the accepted D0/D2 pattern and the packet index's "not implementation-complete" status for D0-D4. D5 must mirror D4's sequencing model: accepted design facts are usable for specification; source edits wait for concrete D0 public-surface rows and live D2 `ruleBaselineFacts`.

### P1-4: The D5 spec remains too thin to be downstream authority

The D5 spec at `specs/habitat-harness/spec.md:3-13` only states a generic baseline authority requirement and two scenarios. It does not normatively define the source-packet baseline states, application result states, integrity/refusal states, external exception projection equality, rule-introduction manifest relation, orphan/stale row handling, malformed/missing behavior, or shrink-only refusal semantics.

Because D7 and D8 are blocked on D5, this is not only a local completeness gap. It is a cross-domino blocker: D7 and D8 cannot safely consume D5 without inventing missing states.

## P2 Blockers

### P2-1: The downstream ledger is not a handoff artifact

The D5 downstream ledger only names the packet suite, D0 matrix, docs/examples, tests/fixtures, and `Later domino packets`. It does not name D7 or D8 separately, does not list exact facts they may rely on, and does not list non-claims. This fails the OpenSpec workstream downstream realignment contract and blocks D5 acceptance until repaired.

### P2-2: The phase record and validation gates conflate design review with later implementation validation

The phase record says implementation has not started, but its "Exact Validation Gates" list includes implementation/runtime validation commands. It also uses broad `bun run habitat check --json` instead of the D5 source packet's focused `bun run habitat check --rule baseline-integrity --json`.

D5 needs two validation sections:

- design-time gates for this remediation packet, including OpenSpec validation and review disposition;
- later implementation gates, including baseline unit tests, focused baseline-integrity command validation, injected bad cases for missing/malformed/orphan/expanded baselines, D0 surface citations, D2 projection availability, cache stance, command outputs, and non-claims.

### P2-3: Tasks remain unresolved design prompts

Tasks 2.1-2.3 repeat broad design verbs: define ownership, connect baselines to facets/Pattern Governance lifecycle/admission, and specify lifecycle/refusals. They do not name implementable slices, required state unions, contract files, fixtures, D7/D8 consumer tests, protected paths, or exact bad cases.

For a complete OpenSpec packet, these must become concrete implementation steps after the design decides the states and handoff contracts. Otherwise implementation agents still decide product/domain shape while coding.

### P2-4: Public surfaces are acknowledged but not enumerated

The proposal says check output may report baseline decisions more precisely within D0 compatibility rules. The design says D0 compatibility disposition is required for every public command, JSON, export, script, target, generator, and hook surface touched. But D5 does not enumerate the D5-specific surfaces requiring D0 rows.

D5 must enumerate baseline JSON files, baseline-related check command JSON/human output, exported baseline types/functions, `--expand-baseline` behavior, Pattern Governance generator/registration baseline messages if touched, docs/examples, and generated/help surfaces if affected.

## Required Repairs Before D5 Can Advance

1. Replace D5/D8 wording with a one-way contract: D5 publishes baseline authority projection/refusal results; D8 consumes them and owns lifecycle/admission.
2. Add a D5/D7 handoff contract: D5 publishes baseline integrity/application results; D7 consumes them and owns report construction, aggregation, rendering, and enforcement semantics.
3. Add sequencing language: D0/D2 accepted designs are consumable for D5 specification; source implementation is blocked until concrete D0 rows and live D2 `ruleBaselineFacts` exist wherever required.
4. Expand the D5 spec with normative scenarios for all source-packet baseline states and the downstream application/projection/refusal results.
5. Repair tasks into concrete implementation slices with write set, protected paths, exact fixtures, exact bad cases, D7/D8 consumer tests, and validation commands.
6. Repair the D5 downstream ledger with explicit D0, D2, D7, D8, and packet-index rows as above.
7. Repair phase record/closure checklist to separate design validation from later implementation validation and to require no unresolved accepted P1/P2 findings before packet advancement.

## Non-Claims

- This review does not edit D5 packet files, D7/D8 packet files, or Habitat source.
- This review does not accept D5.
- This review does not re-accept D0-D4; it treats their packet-index status as accepted for design/specification only.
- This review does not accept D7 or D8.
- This review does not claim current baseline code is correct.
- This review does not claim broad `habitat check --json` is sufficient D5 validation.

Skills used: domain-design, information-design, solution-design, system-design, civ7-open-spec-workstream.
