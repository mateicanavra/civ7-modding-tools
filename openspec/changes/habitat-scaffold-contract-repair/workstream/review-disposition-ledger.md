# Review Disposition Ledger

**Change:** `habitat-scaffold-contract-repair`
**Status:** review run; accepted findings patched into proposal, design, spec,
tasks, phase record, source synthesis, and downstream ledger
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| PO-01 | Product/outcome | P1 | Reviewer initially reported no packet present. | Invalidated by current untracked packet state; reviewer started before draft existed. | None. | closed |
| PO-02 | Product/outcome | P1 | Baseline contract contradiction was not settled: missing-file-as-locked remained compatible with old H2 acceptance. | Accepted. | Design now makes missing baseline a contract failure and requires committed explicit baseline files or modeled external sources. | patched |
| PO-03 | Product/outcome | P1 | Historical H2 scaffold acceptance could be inherited as current proof. | Accepted. | Phase/downstream ledgers now classify H2 baseline/key-format claims as historical source and require current proof. | patched |
| PO-04 | Product/outcome | P1 | Generator metadata dependency was outside scope but still needed a blocking interface. | Accepted. | Added rule-introduction baseline manifest and future metadata repair dependency. | patched |
| ES-01 | Evidence/system | P1 | Trunk merge-base comparison can let a Graphite child branch grow a downstack rule baseline while the rule appears new relative to trunk. | Accepted. | Baseline integrity now requires trusted stack-parent or explicit trusted comparison-base proof. | patched |
| ES-02 | Evidence/system | P2 | H2 parity conflated raw wrapped-check detection with Habitat ratchet exit semantics. | Accepted. | Downstream proof boundaries split detection parity from ratchet exit behavior for accepted debt. | patched |
| ES-03 | Evidence/system | P2 | Current tests are mostly command mocks and do not prove the baseline engine matrix. | Accepted. | Tasks now require fake Git, fake registry, fake filesystem engine-level tests. | patched |
| ES-04 | Evidence/system | P3 | `--staged` behavior is file-layer-only in practice. | Accepted as boundary clarity. | Tasks and proof boundaries record staged scope unless future owner-specific packet expands it. | patched |
| BS-01 | Baseline/scaffold | P1 | Accepted rule-introduction authority artifact was undefined and overlapped generator metadata. | Accepted. | Replaced with concrete rule-introduction baseline manifest owned by this packet, with generator metadata left to future repair. | patched |
| BS-02 | Baseline/scaffold | P1 | Comparison-source failure states were not modeled. | Accepted. | Added unavailable comparison base, missing/malformed base registry, unreadable base baseline, and Graphite stack ambiguity contract failures. | patched |
| BS-03 | Baseline/scaffold | P2 | Selector validation dependency was too soft for mutation/write-guard tasks. | Accepted. | Mutation writes are blocked until accepted selector validation exists; read-only contract validation may proceed. | patched |
| BS-04 | Baseline/scaffold | P2 | Two storage models conflicted: committed files versus registry. | Accepted. | v1 storage model is committed `tools/habitat-harness/baselines/<rule-id>.json` files. | patched |
| BS-05 | Baseline/scaffold | P2 | Parser-owned `baselined: true` could still bypass the baseline contract. | Accepted. | External projection must exactly match contract state or report a contract failure. | patched |
| BS-06 | Baseline/scaffold | P3 | Invalid rule/tool/owner and empty-selection no-write tests were missing from final proof. | Accepted. | Added invalid-selector and empty-intersection no-write tasks and verification gates. | patched |
| GG-01 | Generator/Grit consumer | P1 | Registry storage would not satisfy Grit proof needing inspectable committed baseline paths. | Accepted. | Committed baseline files are required for v1. | patched |
| GG-02 | Generator/Grit consumer | P1 | Rule-introduction authorization artifact was unnamed. | Accepted. | Added rule-introduction baseline manifest fields and refusal behavior. | patched |
| GG-03 | Generator/Grit consumer | P2 | Current exception-path inventory was incomplete. | Accepted. | Added required inventory of all non-`none` `exceptionPath` values, including `adapter-boundary` and `doc-ambiguity`. | patched |
| EV-01 | Evidence sidecar | P1 | H2 key-format language conflicts with current `violationKey()` implementation. | Accepted. | Locked v1 key format to `path::message` and moved richer key text to future migration scope. | patched |
| EV-02 | Evidence sidecar | P2 | Unknown rule/tool selector behavior can produce false green reports. | Accepted as upstream dependency. | Mutation proof consumes `habitat-oclif-entrypoint-repair`; no baseline write path may proceed without accepted selector truth. | patched |
| EF-01 | User/Product substrate | P1 | Effect should be reconsidered if manual Habitat structure is producing systematic proof gaps. | Accepted. | Added Effect adoption gate to proposal, design, spec, tasks, and downstream ledger. | patched |
