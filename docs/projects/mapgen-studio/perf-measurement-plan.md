# Status: Project plan (MapGen Studio)

This page is a time-bound performance baseline plan and may drift.
It is **not** canonical MapGen documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/TESTING.md`

# MapGen Studio Performance + Bundle Measurement Plan (Baseline)

Date: 2026-01-31  
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-EZRA-M1-mapgen-studio-arch-audit`  
Branch: `agent-EZRA-M1-mapgen-studio-arch-audit`

This plan is a lightweight “baseline capture” to quantify where time/memory/bandwidth goes in MapGen Studio *before* major refactors.

Primary objective: answer “what is actually slow (and why)?” so we can choose the right refactor slice order and validate improvements.

## A) Define the baseline scenario (repeatable)

In the UI, do the same sequence each time:

1) Cold load the app (hard refresh).
2) Start a run with a fixed seed (or reroll N times).
3) During streaming:
   - switch selected layer a few times
   - toggle overlays/palettes if available
   - pan/zoom the map for 5-10 seconds
4) After completion:
   - resize the viewport container (not just window size if possible)
   - run again with the same seed (to test caching)

Record:
- browser + OS
- viewport size + device pixel ratio
- recipe id + map size

## B) Worker protocol + data-volume metrics (cheap, high value)

Goal: quantify worker message rate and payload volume.

Add temporary instrumentation (or a dev-only debug flag) in the main thread near the worker message handler:

- Count events per type (e.g., `viz.layer.upsert`, `run.progress`).
- Track bytes transferred per event by summing:
  - `ArrayBuffer.byteLength`
  - `TypedArray.byteLength`
  - nested buffers in the payload
- Track “in-flight” run generations (to detect stale/ignored events).
- Track latency:
  - worker stamps `emittedAtMs` (performance.now) in events
  - main thread computes `receivedAtMs - emittedAtMs`

Outputs to capture:
- total events
- peak events/sec
- total bytes transferred
- top 5 heaviest layer payloads

## C) Main-thread performance trace (Chrome DevTools)

Goal: confirm whether jank comes from JS work, rendering, or GPU uploads.

Steps:

1) Open Chrome DevTools Performance panel.
2) Start recording, then execute the baseline scenario.
3) Stop recording and inspect:
   - main thread long tasks (>50ms)
   - time spent in `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
   - React commit frequency during streaming (do we commit per message?)
   - GC churn (allocation spikes) during grid/polygon creation

Artifacts:
- save the performance profile JSON export for later comparison.

## D) deck.gl rendering cost / update behavior

Goal: ensure we’re not triggering unnecessary layer reinitialization or attribute rebuilds.

Checks:
- Layer `id` stability across updates (no accidental layer recreation).
- Whether `data` references change every update (forcing deck.gl attribute regeneration).
- Whether `pickable` is enabled unnecessarily.
- Device pixel ratio impact (`useDevicePixels`).

Optional instrumentation:
- enable deck.gl stats (via deck.gl / probe.gl) in dev builds to record frame time and update cost.

## E) Bundle size + duplication analysis (main vs worker)

Goal: prove (or disprove) that runtime recipe code is duplicated into main + worker bundles, and quantify the cost.

Baseline build commands (repo root):

```bash
bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-EZRA-M1-mapgen-studio-arch-audit/apps/mapgen-studio build
```

Then inspect:
- `apps/mapgen-studio/dist/assets/index-*.js` size
- `apps/mapgen-studio/dist/assets/pipeline.worker-*.js` size

If we need deeper visibility:
- add a Vite “analyze” mode using a bundle visualizer plugin (temporary, dev-only)
- generate per-bundle treemaps and look for `createRecipe(...)` / recipe runtime code in both outputs

## F) Success criteria for the baseline (what we want to learn)

By the end of baseline capture, we should be able to answer:

- Are we CPU-bound on main thread (JS/GC), GPU-bound, or message-bound?
- Do we rebuild grid/mesh geometry too often? (and why)
- Does worker event rate drive React commits? (and how much)
- How large are the biggest payloads, and are they copied more than once?
- How much duplicated code is in main vs worker bundles today?
