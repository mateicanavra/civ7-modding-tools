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

## Implementation Closure

- [x] Concrete D0 rows are cited for every touched D5 public/durable surface.
- [x] Live D2 `ruleBaselineFacts` / `activeRuleBaselineFacts` and
      `ruleSelectorFacts` / `activeRuleSelectorFacts` are available wherever
      D5 consumes rule baseline metadata and owner/tool facts.
- [x] Source changes stay inside D5-owned baseline authority and check-command
      consumption surfaces.
- [x] Public-surface/record repairs outside `$D5_CHANGE/**` are limited to D0
      matrix D5/D4 row truth plus D2/D4 stale classify-row citations.
- [x] Protected D7, D8, D13, generated, lockfile, and unrelated product paths remain untouched.
- [x] Baseline unit tests cover every accepted/refused D5 state.
- [x] Targeted `bun run habitat check --json --base agent-DRA-d4-orientation-routing`
      built-in `baseline-integrity` report gate passes with recorded command
      outcome.
- [x] Command entrypoint and `--expand-baseline` tests pass where public command behavior is touched.
- [x] D8 Pattern Authority consumer compatibility passes through
      `test/rules/pattern-authority-manifest.test.ts`.
- [x] D13 pattern-generator compatibility residual is recorded: it is blocked by the D13-owned CJS/TS
      generator loader boundary before D5 projections execute; D5 records this
      residual and does not implement D13 generator restructuring.
- [x] Fixture/injection matrix covers the D5 state/refusal set.
- [x] Graphite layer is clean, reviewable, submitted as draft PR #1840, and does not proceed past unresolved packet approval.
