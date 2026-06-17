# Next Packet - Runtime Effect Recovery Design

Status: reviewed design handoff.

## Next Action

Open implementation slice R0, `D12 Drain Reconciliation`, as a new Graphite
branch stacked above the design commit. Do not edit runtime source. Begin with
the write set and stop conditions in `CHANGESET-DESIGN.md`.

R0 must complete before R1/R2/R3 starts because the current D12 closure state is
the authority for later consumed-proof and packet-accounting realignment.

## If Review Finds Code Residue

Stop docs-only implementation. Add a new R0 blocker slice ahead of drain
realignment that names the exact production residue, owner, forbidden owners,
write set, tests, and proof classes. Do not claim D12 closure until the residue
slice is designed, reviewed, implemented, and verified.
