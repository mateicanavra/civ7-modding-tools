## Why

Observed live (2026-06-11): from a fresh studio (empty "Awaiting matter" stage),
clicking **Run** completes a generation (status "Ready", DATA lists
"Mesh Sites (Area)") — but the canvas stays **visually black**. The default
post-run selection (stage Foundation / step Mesh / its first data layer) renders
nothing the eye can find; matter only appears after the user manually selects a
later stage (e.g. Ecology Biomes), which also triggers a camera fit. A first-time
user reads this as "Run failed."

The first run is the product's hello-world moment; it must visibly produce a
world.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (issue 9)
- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core — run/poll/storage
  semantics unchanged; this change is a view-layer decision)
- `apps/mapgen-studio/.interface-design/system.md` ("the map is the hero"; the
  empty stage reads as *awaiting* matter — so a completed run must deliver it)

## What Changes

- **Diagnosis first (recorded in design.md before code):** determine why the
  default Foundation/Mesh selection renders invisibly after the first run —
  candidate causes: camera never fits to the first manifest's bounds (fit only
  runs on explicit stage change / fit-to-view), and/or the mesh-sites point layer
  renders sub-pixel/dark at the initial camera.
- **Fix the view layer so a completed run shows visible matter without further
  interaction.** Expected shape (confirmed by diagnosis): when a run completes
  and a manifest arrives while the camera has never been fitted to generated
  bounds, perform the same fit-to-view the manual control triggers. If diagnosis
  shows the default layer is inherently invisible even when framed, additionally
  make the post-run default selection resolve to the first *visibly rendering*
  layer of the default stage.
- The fix reuses existing mechanisms (the fit-to-view path, the existing
  selection plumbing) — no new camera math, no generation/runner changes.

## Out Of Scope / Parity Guarantees

- No changes to generation, the browser runner, run status semantics, polling, or
  persisted state.
- Manual camera control is never overridden mid-session: the auto-fit applies
  only when the camera has not been user-positioned over generated matter
  (first-run / empty-stage case).
- Layer data, ordering, and the DATA list are untouched.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-first-run-visibility --strict`
- tsc + mapgen-studio vitest project green
- Visual proof on :5173: fresh state → Run → canvas shows rendered matter with no
  further clicks (screenshot); manual pan/zoom then re-run → camera respected per
  the scenario contract.
