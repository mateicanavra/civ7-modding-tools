# Closure Checklist: D5 Baseline Authority

## Design/Specification Acceptance

- [x] Proposal cites controlling authority, source packet, and D5-specific product scenario.
- [x] Design names Baseline Authority ownership, forbidden owners, target ontology, state matrix, public surfaces, write set, protected paths, validation design, and D7/D8 consumption rules.
- [x] Spec delta contains normative scenarios for the complete D5 baseline state/refusal matrix.
- [x] Tasks are concrete later implementation slices, not unresolved design questions.
- [x] Downstream ledger names D0, D2, D7, D8, packet index/status, tests/fixtures, and docs/examples separately.
- [x] Phase record separates design-time gates from later implementation gates.
- [x] Review ledger imports all prior D5 negative-control findings and records repair evidence for each accepted P1/P2.
- [x] D5 strict OpenSpec validation passes after control-record repair.
- [x] Full OpenSpec validation passes after control-record repair.
- [x] `git diff --check` passes after control-record repair.
- [x] Active D5 wording audit is clean, or historical wording is clearly marked as negative-control provenance rather than current guidance.
- [x] Fresh final D5 rereview lanes read the current disk state and record no unresolved P1/P2 findings.
- [x] Packet index is updated only after final D5 rereview acceptance.

Current design-time validation evidence is recorded in `$D5_PHASE_RECORD`.

## Later Implementation Closure

- [ ] Concrete D0 rows are cited for every touched D5 public/durable surface.
- [ ] Live D2 `ruleBaselineFacts` or an explicitly accepted migration input is available wherever D5 consumes rule baseline metadata.
- [ ] Source changes stay inside the approved D5 write set.
- [ ] Protected D7, D8, D13, generated, lockfile, and unrelated product paths remain untouched unless a later accepted packet owns them.
- [ ] Baseline unit tests cover every accepted/refused D5 state.
- [ ] Targeted `bun run habitat check --rule baseline-integrity --json` gate passes with recorded command outcome.
- [ ] Command entrypoint and `--expand-baseline` tests pass where public command behavior is touched.
- [ ] D8/D13 consumer compatibility tests pass where D5 projection surfaces are touched.
- [ ] Fixture/injection matrix covers the D5 state/refusal set.
- [ ] Graphite layer is clean, reviewable, and does not proceed past unresolved packet approval.
