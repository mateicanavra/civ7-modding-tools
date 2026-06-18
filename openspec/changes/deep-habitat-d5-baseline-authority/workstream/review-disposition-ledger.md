# Review Disposition Ledger: deep-habitat-d5-baseline-authority

## Status

D5 is accepted for design/specification only. The acceptance is based on the
repaired packet/control records plus three fresh final rereview lanes that read
the current disk state and found no unresolved P1/P2 findings:

- `$AGENT_SCRATCH/domino-D5-final-domain-ontology-rereview.md`
- `$AGENT_SCRATCH/domino-D5-final-openspec-testing-rereview.md`
- `$AGENT_SCRATCH/domino-D5-final-topology-typescript-crossdomino-rereview.md`

This status does not authorize source implementation. D5 implementation remains
blocked behind concrete D0 rows for touched public/durable surfaces and live D2
baseline facts/projections wherever source code consumes rule baseline metadata.
D7 enforcement reporting, D8 lifecycle/admission, and D13 generator behavior
remain owned by their later packets.

## Findings And Dispositions

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global domain, OpenSpec, information, validation, and cross-domino concern catalogs apply to D5. | Global constraint | applied, not acceptance evidence | Global findings remain corpus-wide constraints only. D5 acceptance is based on the D5-specific final rereview rows below. |
| Prior D5 review found the spec delta omitted the baseline authority state model. | P1 | accepted and repaired; final rereviews found no unresolved P1/P2 | `specs/habitat-harness/spec.md` now defines requirements for baseline source resolution, external exception projections, shrink-only integrity, rule-introduction manifests, and D7/D8 consumer results. |
| Prior D5 review found D5/D8 ownership ambiguous. | P1 | accepted and repaired; final rereviews found no unresolved P1/P2 | `proposal.md`, `design.md`, `tasks.md`, and `$D5_DOWNSTREAM_LEDGER` now state D5 publishes baseline authority projection/refusal results while D8 owns lifecycle/admission. |
| Prior D5 review found validation gates used broad `habitat check --json` instead of the D5 command outcome. | P2 | accepted and repaired; final rereviews found no unresolved P1/P2 | `proposal.md`, `tasks.md`, and `$D5_PHASE_RECORD` now require later `bun run habitat check --rule baseline-integrity --json` and separate broad current-tree checks from D5-specific gates. |
| Prior D5 review found write set, protected paths, and public surfaces missing. | P2 | accepted and repaired; final rereviews found no unresolved P1/P2 | `design.md` now includes public-surface compatibility, write set, and protected path tables; `$D5_PHASE_RECORD` and `$D5_DOWNSTREAM_LEDGER` preserve source blockers behind D0 rows/live D2 facts. |
| Domain/ontology investigation found no accepted/refused ontology and ambiguous baseline-entry language. | P1 | accepted and repaired; final domain/ontology rereview found no unresolved P1/P2 | `design.md` now distinguishes `DiagnosticKey`, `BaselineEntry`, `ExternalExceptionProjectionEntry`, `BaselineApplicationMatch`, accepted authority states, and baseline refusals. `spec.md` rejects generic baseline-entry authority through concrete scenarios. |
| Domain/ontology investigation found external exception source, projection, and authority language conflated. | P1 | accepted and repaired; final domain/ontology rereview found no unresolved P1/P2 | `design.md` now names `ExternalExceptionSource` variants and projection/refusal obligations; `spec.md` has fixed/derived projection, unreadable/malformed source, projection mismatch, and parser-owned bypass scenarios. |
| Domain/ontology investigation found rule-introduction manifest acceptance/refusal under-specified. | P1 | accepted and repaired; final domain/ontology rereview found no unresolved P1/P2 | `design.md`, `spec.md`, and `tasks.md` now require exact manifest matching for rule id, owner project, owner tool, baseline path, sorted initial diagnostic keys, and comparison base, with missing/mismatch refusal scenarios. Final P3 terminology cleanup names `RuleIntroductionBaselineManifest` acceptance input and accepted `BaselineExpansionDecision`. |
| Information-design investigation found the packet lacked an executor-facing contract map and delegated decisions to implementation. | P1 | accepted and repaired; final rereviews found no unresolved P1/P2 | `design.md` now organizes owner boundary, ontology, state matrix, public surfaces, consumption rules, write/protected paths, TypeScript strategy, validation design, and non-goals. `tasks.md` converts design slogans into implementation slices. |
| Information-design investigation found brittle paths in durable artifacts. | P2 | accepted and repaired; final rereviews found no unresolved P1/P2 | `proposal.md`, `$D5_PHASE_RECORD`, `$D5_DOWNSTREAM_LEDGER`, and `$D5_CLOSURE_CHECKLIST` use `$REMEDIATION_DIR/context.md` variables. `$REMEDIATION_DIR/context.md` now defines D5 variables. |
| OpenSpec/testing investigation found the D5 state matrix and validation oracle missing. | P1 | accepted and repaired; final OpenSpec/testing rereview found no unresolved P1/P2 | `spec.md` contains normative scenarios for every required D5 state/refusal family; `$D5_PHASE_RECORD` and `tasks.md` define design-time and later implementation gates with exact commands and non-claims. |
| OpenSpec/testing investigation found design-time validation and later implementation gates conflated. | P2 | accepted and repaired; final OpenSpec/testing rereview found no unresolved P1/P2 | `$D5_PHASE_RECORD` now separates design-time gates from later implementation gates. `$D5_CLOSURE_CHECKLIST` mirrors that split. |
| Cross-domino investigation found D5 lacked exact D7/D8 handoff contracts. | P1 | accepted and repaired; final topology/TypeScript/cross-domino rereview found no unresolved P1/P2 | `design.md`, `spec.md`, and `$D5_DOWNSTREAM_LEDGER` now define D7 consumption of `BaselineApplicationResult`/`BaselineIntegrityResult` and D8 consumption of D5-published baseline authority projection/refusal result. |
| Cross-domino investigation found D0/D2 source-blocking gates missing. | P1 | accepted and repaired; final topology/TypeScript/cross-domino rereview found no unresolved P1/P2 | `proposal.md`, `design.md`, `tasks.md`, `$D5_PHASE_RECORD`, and `$D5_DOWNSTREAM_LEDGER` now state D0/D2 design facts may guide D5 now while source implementation is blocked behind concrete D0 rows and live D2 baseline facts. |
| TypeScript state-space investigation found guard booleans, optional external source shapes, whole-record leakage, command-engine inline authority, and D7/D8 projections under-specified. | P1 | accepted and repaired; final topology/TypeScript/cross-domino rereview found no unresolved P1/P2 | `design.md` now specifies target TypeScript state-space reduction for `BaselineExpansionDecision`, `ExternalExceptionSource`, `BaselineRefusal`, `BaselineIntegrityResult`, `BaselineApplicationResult`, and D8 projection. `tasks.md` sequences safe refactor slices. |
| Code/topology investigation found current topology, D0 surfaces, write/protected set, and command/report projections incomplete. | P1 | accepted and repaired; final topology/TypeScript/cross-domino rereview found no unresolved P1/P2 | `design.md` includes D5 public-surface compatibility rows and write/protected paths. `$D5_DOWNSTREAM_LEDGER` records exact downstream ownership. `tasks.md` names command, baseline, package export, and D8/D13 consumer tests. |
| Supervisor DRA D5 gate note required fresh final rereview after packet/control repair. | P1 | accepted and closed for design/specification | Fresh final rereview rows above read the current disk state and found no unresolved P1/P2 findings. Packet-index/status movement is now allowed for D5 design/specification acceptance only. |

## Final Rereview Lanes

| Lane | Scratch Record | Result |
| --- | --- | --- |
| Domain/ontology | `$AGENT_SCRATCH/domino-D5-final-domain-ontology-rereview.md` | Accepted for design/specification only; no unresolved P1/P2. Two P3 terminology tightenings were folded into `design.md` and `spec.md`. |
| OpenSpec/testing | `$AGENT_SCRATCH/domino-D5-final-openspec-testing-rereview.md` | Accepted for design/specification only; no unresolved P1/P2/P3. |
| Topology/TypeScript/cross-domino | `$AGENT_SCRATCH/domino-D5-final-topology-typescript-crossdomino-rereview.md` | Accepted for design/specification only; no unresolved P1/P2/P3. |

## Non-Claims

- D5 is not implementation-complete.
- D5 source changes may not start before concrete D0 rows and live D2 baseline
  facts/projections exist for the touched source surfaces.
- D5 acceptance does not accept D7, D8, D13, or current runtime behavior.
