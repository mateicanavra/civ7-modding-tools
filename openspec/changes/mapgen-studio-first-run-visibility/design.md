## Context

Observed once (2026-06-11, morning, dev server freshly booted, preview browser):
first Run from the empty stage completed (footer "Ready", DATA listed
"Mesh Sites (Area)") while the canvas kept the "Awaiting matter" empty state.
Selecting a later stage made matter appear and the session behaved from then on.

## Diagnosis (recorded before code, per the spec's diagnosis requirement)

Reproduction attempts at the Pass-2 tip (post C1–C4):

1. Run from the session's warm state → matter rendered, framed.
2. `localStorage.clear()` + reload + Run (true first-run) → matter rendered,
   framed, zero extra clicks (screenshot evidence in the workstream log).

So neither hypothesized cause holds at tip:

- **Camera fit gap — absent.** `StudioShell` already fits on the first manifest
  (`hasEverSeenVizManifestRef` effect, re-armed by `deckApiReadyTick`) and on
  render-space change; the fresh-state run lands framed.
- **Inherently invisible default layer — absent.** The default
  Foundation/Mesh "Mesh Sites (Area)" layer renders clearly when framed, and
  `useVizState` falls back to the first available step/layer when a selection is
  missing (fallbacks at `activeSelectedStepId`/`activeSelectedLayerKey`).

Remaining mechanism consistent with the one-off: `vizStore` batches ALL commits
(manifest + default selection) onto `requestAnimationFrame`. Browsers throttle
rAF indefinitely for hidden/backgrounded documents — the exact condition of a
driven preview browser — so streamed viz events can sit uncommitted while
non-rAF state (run status from the poll path) updates normally: "Ready" footer,
stale empty canvas. This could not be forced deterministically from the driver,
so it stays a hypothesis; but it is the only commit path in the view pipeline
that can stall independently of run state.

## Decision

- **No speculative camera/selection changes** — the specced mechanisms exist and
  are verified; adding more would be unfounded churn (systematic-workstream rule:
  no fixes without a proven failure mode).
- **One narrow hardening, matching the hypothesis:** `vizStore.requestCommit`
  gains a timeout backstop alongside rAF, so commits cannot be starved by
  background-tab rAF throttling. Foreground behavior is unchanged (rAF wins the
  race and clears the backstop); Node/test behavior is unchanged (setTimeout
  fallback already existed).

## Verification

- Fresh-state (cleared localStorage) Run → framed visible matter, no extra
  clicks (screenshot).
- Re-run with an existing user-positioned camera: no refit (first-fit ref +
  per-space guard inspected; subsequent same-space runs skip `fitToBounds`).
- Full suite + tsc green.
