## 1. Frame

- [x] 1.1 Workstream record + proposal/design/tasks/spec deltas committed
      (`design/dag-tab-frame`).

## 2. Implementation (`design/dag-tab-stage`)

- [x] 2.1 `viewStore`: `stageView` ("map" | "pipeline"),
      `pipelineSelectedStageId`, `pipelineExpandedStageIds` (+ setters).
- [x] 2.2 `useRecipeDagQuery` on TanStack Query (fetch on activation,
      cache per recipe, typed error; transport via preserved client).
- [x] 2.3 `StageViewTabs` segmented switcher (Map | Pipeline), popover-tier
      pill, top-center of the stage area.
- [x] 2.4 `PipelineStage`: token-driven re-expression of the DAG chrome
      preserving all §2.6 interaction semantics; floating pipeline console
      strip (identity + counts); diagnostics panel.
- [x] 2.5 `StudioShell` wiring: switcher mount; map stage hidden-not-
      unmounted in pipeline view; Explore dock scoped to map view.
- [x] 2.6 Delete `RecipeDagView.tsx` + its test; port semantic pins to
      `test/recipeDag/PipelineStage.test.tsx` (same fixture).
- [x] 2.7 `system.md` amendment: stage-view furniture rule + pipeline-stage
      decisions; goal-ledger entry.

## 3. Verification

- [x] 3.1 `bun run openspec -- validate mapgen-studio-dag-tab --strict`
- [x] 3.2 tsc clean; studio vitest green (recipeDag suites incl. ported
      pins); mapgen-core tests green; build + worker-bundle green.
- [x] 3.3 Visual on :5173 (dark + light): switcher; pipeline loads for the
      standard recipe; selection/expansion/label-focus interactions; map
      view returns with camera intact; run loop works while pipeline view
      is active.
- [x] 3.4 Workstream/phase record closed with evidence.

## 4. Mount re-home (user-directed follow-up)

- [x] 4.1 Research pass (4-agent workflow): repo resolution/freshness facts,
      lane server-seam target, oRPC adapter docs, effect-orpc + Vite docs.
- [x] 4.2 `server/recipeDag/orpc.ts` → fetch adapter (`@orpc/server/fetch`),
      mirroring studio-server's handler shape; Connect shim kept for the
      Vite mount + transport tests; path contract unchanged.
- [x] 4.3 Extract the node⇄web bridge to `server/http/nodeWebBridge.ts`;
      both the `/rpc` mount and the recipe-dag mount share it.
- [x] 4.4 `vite.config.ts`: forever-memoized lazy mount → PER-REQUEST
      `ssrLoadModule` behind a path pre-check. (A static import was tried
      first and reverted: effect-orpc ships TS source, which Node cannot
      load outside Vite's pipeline — `vite build` failed and the dev
      server's config restart failed silently.)
- [x] 4.5 Gates: tsc; 193 tests (orpc.test.ts pins unchanged over the
      fetch-backed middleware); `vite build` evaluates the config; clean
      dev-server start + live smoke — `POST
      /api/recipe-dag/rpc/recipeDag/get → 200`, pipeline renders.
