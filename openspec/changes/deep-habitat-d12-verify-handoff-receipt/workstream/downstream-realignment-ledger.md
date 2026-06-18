# Downstream Realignment Ledger: D12 Verify Handoff Receipt

D12 is accepted for design/specification only. The rows below define the
handoffs that must remain true for later implementation and downstream packet
work.

| Surface | D12 disposition | Required action |
| --- | --- | --- |
| D0 command surface inventory | D12 names verify public surfaces but does not decide compatibility handling. | Concrete D0 rows must exist before source edits touch verify JSON, human output, help, exit status, exports, docs/examples, scripts, or tests. |
| D1 receipt contract boundary | D12 consumes `VerifyReceipt`, canonical `NonClaim` identifiers, typed relationships, and legacy `VerifyProof` compatibility handling. | D12 implementation must use D1 target semantics and cite D1 output-family mapping for touched surfaces. |
| D3 workspace graph boundary | D12 consumes `VerifyTargetPlan` and graph-refusal states. | D12 must not hard-code graph target lists or resolve project/target availability locally. |
| D7 structural enforcement pipeline | D12 consumes `VerifyCheckSummaryProjection`, including selector state, status counts, selected ids, `allowsAffectedExecution`, and owner-sourced skipped-affected reason. | D12 must not reconstruct check summary or run affected targets after D7 blocks execution. |
| D11 local feedback | D12 may observe D11 local-feedback non-claims or hook trace boundary projections only through named D11 projections. | D12 must not treat hook pass, local-feedback eligibility, staged-file behavior, or hook trace output as verify handoff completion, CI, graph authority, Graphite readiness, product/runtime readiness, OpenSpec acceptance, apply safety, current-tree correctness, or root aggregate verification. |
| D14 authoring topology fence | D14 may consume D12 receipt examples, non-claims, and handoff limits after D12 acceptance. | D14 must not infer authoring acceptance, product approval, CI, or Graphite readiness from D12 receipt success. |
| Habitat docs/examples | D12 may require verify wording updates later. | Docs edits require D0/D1 compatibility handling and must teach receipt/handoff semantics, not target proof semantics. |
| Root verify documentation | D12 preserves the distinction between root `bun run verify` and diagnostic `bun run habitat verify`. | Later docs/help edits must describe root `bun run verify` as Nx aggregate and diagnostic `habitat verify` as a command receipt. |
| Verify tests | Later implementation must realign current proof-named tests or add target receipt tests. | Tests must cover check allowed/blocked, graph refusal, affected failure, bounded streams, cache observation, selector state, post-state observation, and canonical non-claims. |
| Nx affected command behavior | D12 records affected argv contract and D3 target-plan source. | Later implementation must test exact argv, stable target order from D3, explicit `--base`, `--head HEAD`, and `--outputStyle=static` unless final review accepts another exact contract. |
| Packet index | D12 is accepted for design/specification only after final rereviews found no unresolved P1/P2. | Keep D12 not implementation-complete and preserve source blockers in the packet index. |

## Source Blockers

Even after design acceptance, D12 remains not implementation-complete. Source
implementation stays blocked behind concrete D0 rows, D1 output-family handling,
live D3 verify target plan facts, and live D7 verify check projection facts.
