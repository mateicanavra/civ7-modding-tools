## 1. Diagnosis (before code)

- [ ] 1.1 Reproduce on :5173: fresh state → Run → inspect deck.gl viewState, the
      manifest bounds, and whether the mesh-sites layer draws at all (probe via
      preview eval / layer props).
- [ ] 1.2 Record the cause + evidence in design.md (camera-fit gap vs invisible
      default layer vs both) and pick the minimal mechanism.

## 2. Fix (shape confirmed by 1.2)

- [ ] 2.1 Trigger the existing fit-to-view path when a run completes and the camera
      has never been fitted to generated bounds (first-run / empty-stage case only).
- [ ] 2.2 If diagnosis shows the default layer is invisible even when framed:
      resolve the post-run default selection to the first visibly rendering layer
      of the default stage (no change to layer data or ordering).
- [ ] 2.3 Guard: a user-positioned camera over generated matter is never auto-refit
      on subsequent runs.

## 3. Verification

- [ ] 3.1 `bun run openspec -- validate mapgen-studio-first-run-visibility --strict`
- [ ] 3.2 tsc + mapgen-studio vitest project green
- [ ] 3.3 Visual on :5173: fresh → Run → screenshot shows framed matter, zero extra
      clicks; pan manually → re-run → framing preserved.
