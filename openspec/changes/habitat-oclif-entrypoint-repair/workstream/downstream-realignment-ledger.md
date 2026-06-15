# Downstream Realignment Ledger

**Change:** `habitat-oclif-entrypoint-repair`
**Status:** realigned; ready for closure review
**Owner:** DRA Habitat recovery owner

## Realignment Rows

| Artifact | Current issue | Required disposition | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-oclif-cli/workstream/phase-record.md` | Records root and check help as passed in the old H4.5 phase, contradicted by current root probes. | Preserve history but annotate or realign as historical proof superseded by this repair. | patched: added 2026-06-15 recovery note and marked the old help proof as historical/superseded. |
| `docs/projects/habitat-harness/workstream-record.md` | Reads as if H1-H8 are locally closed and final gates are green. | Replace current-proof language with recovery status or pointer to Stage 0 ledgers and repair packets. | patched: names latest settled baseline separately from active command repair and points command trust to this packet. |
| `docs/projects/habitat-harness/review-disposition-ledger.md` | Says accepted repairs were applied and all eight changes revalidated; future agents can overread this as current proof. | Preserve pre-execution review history but add current-status language or pointer showing command trust is reopened by this repair. | patched: added recovery note that pre-execution revalidation is historical and not current command/Grit/baseline proof. |
| `docs/projects/habitat-harness/discrepancy-log.md` | Says no code-violates-docs cases were found during derivation; current command behavior now contradicts H4.5 help records if read broadly. | Clarify derivation-scope history or add a new discrepancy row for command-record drift. | patched: narrowed derivation-pass wording and added DL-17 for command-record drift resolved by this packet. |
| `docs/projects/habitat-harness/FRAME.md` | Status section names the old branch and preparation state. | Preserve historical frame provenance while preventing it from being read as current branch/closure state. | patched: status now distinguishes latest settled branch from active recovery packets and names this command-trust repair. |
| `docs/projects/habitat-harness/dra-takeover-frame.md` | High-order authority frame still titled the Stage 0 seed evidence as `Current Known Contradictions` and said root help, check help, and `--rule grit-check` false-green behavior were current. | Preserve the seed evidence while making current command behavior point to this packet's phase proof and keeping Grit row closure out of scope. | patched: section is now `Stage 0 Contradictions And Repair Disposition`; command-trust bullets are historical seeds superseded by this packet, valid `--tool grit-check` is selector-preservation only, and Grit current-tree/baseline/injected closure remains downstream. |
| `tools/habitat-harness/README.md` | May describe command/help behavior or selector use without invalid-selector failure semantics. | Patch only if implementation changes user-facing command output or selector guidance. | patched: added requested selector validation semantics, JSON failure report behavior, and `--expand-baseline` no-write failure rule. |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | Command trust rows are seed rows. | Move affected rows from seed/current contradiction to reviewed/repair-designed state after review. | patched: added Command Trust Repair Update naming repaired rows and downstream non-claims. |
| `docs/projects/habitat-harness/effect-orchestration-evaluation.md` | P0 command non-adoption decision is active but not yet tied to implementation result. | Record whether manual typed-selector repair succeeded or whether Effect slice opened. | patched: recorded P0 command repair outcome as non-Effect with typed selector outcomes; Grit adapter Effect selection remains. |

## Closure Rule

This repair does not close while any row above remains pending without an
explicit no-patch, deferred-with-trigger, or not-applicable disposition.

Before closure, rerun the stale-record scan from `tasks.md` and either patch or
record a source-backed no-patch/deferred disposition for every current-proof
hit that can be misread as live command trust.
