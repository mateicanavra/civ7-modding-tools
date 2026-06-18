# Closure Checklist: D9 Transformation Transaction

## Current State

D9 is accepted for design/specification after final rereview. It is not
implementation-complete and not source-ready.

## Design Readiness

- [x] Proposal cites the source packet and remediation router.
- [x] Proposal defines product scenario, affected surfaces, dependencies,
  stop conditions, and design-time/later implementation gates.
- [x] Design names Transformation Transaction as the single D9 owner.
- [x] Design contains term disposition for legacy proof/result vocabulary.
- [x] Design defines request, admission, dry-run, write-set, live-write,
  formatter, gate, rollback, outcome, recovery, and non-claim state families.
- [x] Design defines vendor/tool boundaries for Grit, Biome, Git, Nx, and
  Habitat.
- [x] Design records D0/D1 public compatibility blockers.
- [x] Design records D8/D10/G-HOST source blockers.
- [x] Spec delta contains normative requirements/scenarios for the accepted
  first-wave P1/P2 findings.
- [x] Tasks sequence state-model construction, request/admission, write-set,
  live-write/handoff/rollback, public projection, validation, and review.
- [x] Downstream realignment is recorded for D0, D1, D6, D7, D8, D10, G-HOST,
  D11, D13, D15, packet index, and tests/fixtures.
- [x] D9 complete-standard wording audit passes over `$D9_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D9-*.md`.
- [x] Strict D9 OpenSpec validation passes.
- [x] Full OpenSpec validation passes.
- [x] `git diff --check` passes.
- [x] Fresh final D9 domain/ontology rereview records no unresolved P1/P2.
- [x] Fresh final D9 TypeScript/validation rereview records no unresolved P1/P2.
- [x] Fresh final D9 OpenSpec/information rereview records no unresolved P1/P2.
- [x] Fresh final D9 code/vendor topology rereview records no unresolved P1/P2.
- [x] Fresh final D9 cross-domino/product rereview records no unresolved P1/P2.
- [x] Review ledger imports final rereviews as acceptance evidence.
- [x] Packet index marks D9 accepted for design/specification only.

## Implementation Closure (Later)

- [ ] Source changes stay inside the approved D9 write set.
- [ ] Public-surface changes cite concrete D0 rows.
- [ ] D8 apply admission is live wherever D9 consumes it.
- [ ] D10/G-HOST path/host projections are live wherever D9 consumes them.
- [ ] State construction tests reject invalid request/outcome combinations.
- [ ] Transaction unit and focused integration tests cover all D9 bad cases.
- [ ] Command checks prove `habitat fix --dry-run` and any D0-authorized JSON
  surface exactly.
- [ ] Native Grit/Biome/Nx gates are run only for the vendor/tool claims they
  actually establish.
- [ ] Worktree is clean after live-write/rollback fixtures.
- [ ] Graphite layer is clean and subject/body commit message format is valid.
