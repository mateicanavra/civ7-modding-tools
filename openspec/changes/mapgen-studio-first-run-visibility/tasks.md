## 1. Diagnosis (before code)

- [x] 1.1 Reproduce on :5173: fresh state → Run → inspect deck.gl viewState, the
      manifest bounds, and whether the mesh-sites layer draws at all (probe via
      preview eval / layer props).
- [x] 1.2 Record the cause + evidence in design.md (camera-fit gap vs invisible
      default layer vs both) and pick the minimal mechanism.
      → Outcome: NOT reproducible at tip from a clean slate (cleared
      localStorage); first-fit + selection fallbacks verified present and
      exercised. Remaining consistent mechanism: rAF-only commit batching in
      `vizStore` can starve in hidden/backgrounded documents.

## 2. Fix (shape confirmed by 1.2)

- [x] 2.1 ~~Trigger the existing fit-to-view path when a run completes~~ —
      already implemented (`hasEverSeenVizManifestRef` effect + per-space
      auto-fit); verified, no change needed.
- [x] 2.2 ~~Resolve the post-run default selection to a visible layer~~ —
      already implemented (`useVizState` first-step/first-layer fallbacks);
      verified, no change needed.
- [x] 2.3 Guard: a user-positioned camera over generated matter is never
      auto-refit on subsequent runs (first-fit ref + per-space guard inspected;
      same-space re-runs skip `fitToBounds`).
- [x] 2.4 (Per diagnosis) Harden `vizStore.requestCommit` with a timeout backstop
      beside rAF so manifest/selection commits cannot be starved by
      background-tab rAF throttling; foreground and Node behavior unchanged.

## 3. Verification

- [x] 3.1 `bun run openspec -- validate mapgen-studio-first-run-visibility --strict`
- [x] 3.2 tsc + mapgen-studio vitest project green
- [x] 3.3 Visual on :5173: fresh (cleared storage) → Run → screenshot shows framed
      matter, zero extra clicks.
