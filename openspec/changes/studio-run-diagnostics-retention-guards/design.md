# Design

## Retention Policy

Retain request workspaces, diagnostics records, and attribution reports for 72
hours and at least the latest 100 terminal operations. Terminal operations are
completed, failed, and cancelled. Both conditions apply: cleanup may remove a
terminal operation only when it is older than 72 hours and outside the latest
100 terminal operations ordered by terminal timestamp, with request id as the
deterministic tie-breaker.

Cleanup runs at daemon startup and operation terminalization. It does not run
inside active mutation phases and never removes active operations.

## Structural Closure

Closure is an authority-plane activity, not a behavior-test sweep. Permanent
rules assert target topology positively through SA-01 through SA-14 in the
structural authority matrix. Temporary transition patterns either become
registered authority with Pattern Authority metadata or are removed when the
permanent assertion supersedes them.

## Verification Split

Retention behavior and live Run in Game behavior are tested. Structure is
enforced through the exact runner named by each structural authority row:

- Grit for source patterns;
- structure-check for filesystem topology;
- Nx metadata for graph/order;
- Habitat command checks only for positive topology assertions that need code
  execution and cannot be expressed by narrower runners.

## Live Verification

This packet runs the full live verification matrix from `target-vocabulary.md`.
Without that live matrix, closure remains open. The matrix uses actual Studio
server endpoints, successful in-game Civilization 7 launches, API/control
variants, and the packet train's behavior tests. Civ7 or Studio endpoint
unavailability blocks closure; it is not an alternate accepted outcome.
