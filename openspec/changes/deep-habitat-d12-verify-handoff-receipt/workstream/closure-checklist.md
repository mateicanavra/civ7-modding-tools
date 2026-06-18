# Closure Checklist: D12 Verify Handoff Receipt

## Design Readiness

- [x] `$REMEDIATION_DIR/context.md` has a D12 variable fixture and active D12 branch.
- [x] Proposal cites D0/D1/D3/D7 authority and D12 source packet through variables.
- [x] Design names D12 owner, target ontology, closed states, write set, protected paths, and compatibility surfaces.
- [x] Spec delta uses normative SHALL language with D12-specific scenarios.
- [x] Tasks separate design closure from later implementation work.
- [x] Downstream realignment names D0, D1, D3, D7, D14, docs, tests, and packet index handoffs.
- [x] D12 affected non-execution language aligns to D1/D7 `skipped` / skipped-affected reason semantics.
- [x] D11 local-feedback and hook trace observations are bounded as non-claims and do not complete verify handoff.
- [x] First-wave D12 review findings from every lane are imported and dispositioned as repair input.
- [x] Fresh final D12 rereviews record no unresolved P1/P2 findings.
- [x] D12 strict OpenSpec validation passes.
- [x] Full OpenSpec validation passes.
- [x] D12 wording audit passes over `$D12_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D12-*.md`.
- [x] `git diff --check` passes.
- [x] `$REMEDIATION_DIR/packet-index.md` is updated only after final rereview acceptance.

## Later Implementation Closure

- [ ] Concrete D0 rows exist for every touched verify surface.
- [ ] D1 live receipt/output-family mapping supports target `VerifyReceipt` and legacy compatibility surfaces.
- [ ] D3 live verify target plan facts are available where D12 consumes them.
- [ ] D7 live verify check summary projection is available where D12 consumes it.
- [ ] Source changes stay inside the D12 approved write set.
- [ ] Verify tests and command gates pass with scenario-specific expected status and oracle recorded.
- [ ] Affected Nx argv is tested against the D12 command contract or a final accepted alternative contract.
- [ ] Root `bun run verify` and diagnostic `bun run habitat verify` remain distinct in docs/help where touched.
- [ ] Public-surface changes preserve, version, facade, deprecate, refuse, document, or generate exactly as D0 rows require.
- [ ] Downstream docs/tests/specs are realigned without claiming D12 implementation-complete before source work lands.
