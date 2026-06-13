# Design - Game Door Invariant Closeout

## D1 - Ownership Rule

The runtime program's final invariant is:

> Studio game-wire calls flow through the daemon runtime's shared
> `Civ7TunerSession`; bounded direct-control package flows may construct a
> per-flow session only through `withCiv7DirectControlSession`.

This gives the system two owners, each at the right level:

- `@civ7/studio-server`: owns the shared daemon session for long-lived polling,
  live-game watcher reads, control-oRPC host injection, health/backoff, and
  daemon shutdown.
- `@civ7/direct-control`: owns socket protocol mechanics and the per-flow helper
  that constructs and closes bounded sessions for package workflows.

App code, router leaves, operation engines, and ad-hoc scripts are forbidden
owners. They may request game work through the sanctioned services; they may not
construct the socket session.

## D2 - Guard Shape

The guard test is intentionally source-based. The invariant is about ownership
boundaries, not about one runtime branch. A scan is the smallest test that fails
when a future implementation reaches around the door.

The scan includes production `apps/` and `packages/` TypeScript and excludes
tests, generated output, and build artifacts. The allowlist is exact and mirrors
the invariant doc.

## D3 - Schema Technology Closeout

S1.2 moved error `data` schemas to TypeBox/Standard Schema but left legacy Zod
success I/O schemas as an explicit S4.1 closeout target. S4.1 migrates the
remaining `packages/studio-server/src/contract/*` success I/O schemas to
TypeBox/Standard Schema instead of retaining a mixed stack.

The `toStandardSchema` adapter parses through TypeBox before returning the
validated value. This preserves the old Zod object behavior that strips closed
object extras. Query defaults formerly expressed through Zod `.default(...)` are
moved into router logic so client input types remain optional and default values
are visible at the procedure interpretation point.

## D4 - Tuner Session Closeout

The old tuner-session OpenSpec change kept two unchecked deferred tasks. S4.1
dispositions them rather than carrying them forward:

- Run-in-game convergence is intentionally not performed. The invariant names
  the per-flow wrapper path as sanctioned and forbids Studio-side constructors.
- The "Restart Civ7" UX affordance is a product recovery surface, so it moves to
  `docs/system/DEFERRALS.md` as `DEF-015` with trigger and owner.

## D5 - Orphan Sweep

The final sweep is bounded to runtime simplification residue:

- stale comments that describe `/api` coexistence after one-mount are updated;
- stale comments that claim Save&Deploy status lacks server identity are updated;
- old browser polling/watchdog/localStorage bridge symbols stay deleted;
- old satellite mount/client/path symbols stay deleted;
- no live `RunInGameHttpError` bridge remains.
