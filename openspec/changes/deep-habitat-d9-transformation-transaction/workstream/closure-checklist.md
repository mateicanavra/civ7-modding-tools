# Closure Checklist: D9 Transformation Transaction

## Current State

D9 has a repaired source slice: `habitat fix` now enters a TypeBox-first
Transformation Transaction boundary, resolves registered D8 apply admissions,
derives explicit D8 transaction-input projections from typed rule facts before
native dry-run execution, and refuses before live native writes. D9 is not
implementation-complete.

## Design Readiness

- [x] Proposal cites the source packet and remediation router.
- [x] Proposal defines product scenario, affected surfaces, dependencies,
  stop conditions, and design-time/later implementation gates.
- [x] Design names Transformation Transaction as the single D9 owner.
- [x] Design contains term disposition for previous transaction/result
  vocabulary.
- [x] Design defines request, admission, dry-run, write-set, live-write,
  formatter, gate, rollback, outcome, recovery, and non-claim state families.
- [x] Design defines vendor/tool boundaries for Grit, Biome, Git, Nx, and
  Habitat.
- [x] Design records D0/D1 public contract blockers.
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
- [x] Review ledger imports final rereviews as acceptance inputs.
- [x] Packet index marks D9 accepted for design/specification only.

## Implementation Closure

- [x] Source changes stay inside the approved D9 write set.
- [x] Public-surface changes cite concrete D0 rows.
- [x] D8 apply admission is live wherever D9 consumes it.
- [x] D8 transaction-input projections are matched by pattern id, manifest
  path, and transaction input ref before D9 invokes native dry-run commands.
- [x] Transaction inputs validate repo-relative apply pattern paths and scan
  roots through TypeBox before `HabitatProcess` receives a command request.
- [x] Current D9 slice does not consume D10/G-HOST path or host projections
  before approving live writes; future live-write/protected/host consumption
  remains blocked until the owning projections are consumed in D9 write-set
  approval.
- [ ] Complete state construction tests reject invalid request/outcome
  combinations; current slice covers invalid request shape and dirty live
  refusal only.
- [ ] Transaction unit and focused integration tests cover all D9 bad cases;
  dry-run inventory, write-set approval, live write, handoffs, and rollback
  remain open.
- [x] Command checks prove `habitat fix --dry-run` preserves the D0 non-writing
  public surface by running registry-derived transaction inputs without source
  mutation, and `habitat fix --help` remains available.
- [x] Native Grit is invoked only for admitted dry-runs that receive typed
  transaction input projections. Biome/Nx/live-write gates are not invoked by
  the current D9 slice.
- [x] Worktree is clean after validation; no live-write or rollback fixture ran
  in this source slice.
- [x] Graphite layer is clean and subject/body commit message format is valid.
