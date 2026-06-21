# Review Disposition Ledger

Pre-code review of the packet. Findings are control inputs; accepted P1/P2 block
implementation until repaired or explicitly dispositioned.

| ID | Severity | Finding | Source | Disposition |
| --- | --- | --- | --- | --- |
| R1 | P1 | The exact odd-R offset table must be confirmed on the live engine before migrating (static evidence pins direction, not the precise diagonal signs / odd-r vs even-r). | self (investigation-design evidence policy) | Accepted. Encoded as Task 1 gate + stop condition; behavioral commit blocked until probe confirms. |
| R2 | P1 | The correct odd-R diagonals are west/east pairs keyed `y&1`, NOT the odd-Q north/south arrays re-keyed by `y` (that yields an incoherent lattice). A recon agent printed the re-keyed table; it is wrong. | self (geometry derivation) | Accepted. design.md records the correct table and the explicit contrast; corrected in the predicted table. |
| R3 | P2 | Migration must not change per-tile land/water truth (components/landmask use adjacency for flood fill). | self | Accepted. Hard invariant in spec delta + expectation ledger; equality gate in Task 5.5. |
| R4 | P2 | Flow/drainage routing is exact-set critical (a phantom neighbor can become the steepest receiver). A superset cannot fix it; only the corrected model can. | self | Accepted. Highest-risk consumer flagged in corpus + expectation ledgers; explicit before/after required. |
| R5 | P2 | Scope creep risk: the coast-policy seeding redesign (islands injected after coastline metrics) is a separate root cause. | self | Accepted. Out of scope; the coast-ring safety net handles it; recorded in forbidden owners. |
| R6 | P3 | Rename churn (~95 sites) could bury the behavioral diff. | self | Accepted. Sequenced as separate commits (mechanical rename, then math) per design.md. |

## Pending external review

- [ ] User pre-code review of this packet (design decision: rename strategy,
      PR #1811 disposition, expectation bands).
- [ ] Optional adversarial peer-agent review of the offset-table derivation and
      the flow-routing risk before the behavioral commit.
