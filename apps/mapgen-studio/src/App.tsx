import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BROWSER_TEST_RECIPE_CONFIG,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
  type BrowserTestRecipeConfig,
} from "@mapgen/browser-recipes/browser-test";
import { AppHeader } from "./app/AppHeader";
import { AppShell, type AppMode } from "./app/AppShell";
import { useDumpLoader } from "./features/dumpViewer/useDumpLoader";
import { ConfigOverridesPanel } from "./features/configOverrides/ConfigOverridesPanel";
import { useConfigOverrides } from "./features/configOverrides/useConfigOverrides";
import { useBrowserRunner } from "./features/browserRunner/useBrowserRunner";
import { capturePinnedSelection } from "./features/browserRunner/retention";
import { getCiv7MapSizePreset, type Civ7MapSizePreset } from "./features/browserRunner/mapSizes";
import { DeckCanvas } from "./features/viz/DeckCanvas";
import { useVizState } from "./features/viz/useVizState";
import { formatStepLabel } from "./features/viz/presentation";
import type { TileLayout } from "./features/viz/model";
import { formatErrorForUi } from "./shared/errorFormat";
import type { VizEvent } from "./shared/vizEvents";

function randomU32(): number {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] ?? 0;
    }
  } catch {
    // ignore
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const isNarrow = viewportSize.width < 760;

  const [mode, setMode] = useState<AppMode>("browser");

  const dumpLoader = useDumpLoader();
  const dumpAssetResolver = dumpLoader.state.status === "loaded" ? dumpLoader.state.reader : null;
  const dumpManifest = dumpLoader.state.status === "loaded" ? dumpLoader.state.manifest : null;

  const [browserSeed, setBrowserSeed] = useState(123);
  const [browserMapSizeId, setBrowserMapSizeId] = useState<Civ7MapSizePreset["id"]>("MAPSIZE_HUGE");
  const [browserConfigOpen, setBrowserConfigOpen] = useState(false);
  const [tileLayout, setTileLayout] = useState<TileLayout>("row-offset");
  const [showMeshEdges, setShowMeshEdges] = useState(true);
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(true);
  const browserConfigOverrides = useConfigOverrides<BrowserTestRecipeConfig>({
    baseConfig: BROWSER_TEST_RECIPE_CONFIG,
    schema: BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const vizIngestRef = useRef<(event: VizEvent) => void>(() => {});

  const handleVizEvent = useCallback((event: VizEvent) => {
    vizIngestRef.current?.(event);
  }, []);

  const browserRunner = useBrowserRunner({
    enabled: mode === "browser",
    onVizEvent: handleVizEvent,
  });

  const browserRunning = browserRunner.state.running;
  const browserLastStep = browserRunner.state.lastStep;

  const viz = useVizState({
    enabled: mode === "browser" || mode === "dump",
    mode,
    assetResolver: mode === "dump" ? dumpAssetResolver : null,
    tileLayout,
    showMeshEdges,
    showBackgroundGrid,
    viewportSize,
    allowPendingSelection: mode === "browser" && browserRunning,
    onError: (e) => setLocalError(formatErrorForUi(e)),
  });

  const manifest = viz.manifest;
  const effectiveLayer = viz.effectiveLayer;
  const legend = viz.legend;
  const { setDumpManifest, setSelectedStepId, setSelectedLayerKey, resetView } = viz;
  const error =
    localError ??
    (mode === "browser" ? browserRunner.state.error : null) ??
    (dumpLoader.state.status === "error" ? dumpLoader.state.message : null);

  vizIngestRef.current = viz.ingest;

  useEffect(() => {
    if (!dumpManifest) return;
    setDumpManifest(dumpManifest);
    const firstStep = [...dumpManifest.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
    setSelectedStepId(firstStep);
    setSelectedLayerKey(null);
    resetView();
  }, [dumpManifest, resetView, setDumpManifest, setSelectedLayerKey, setSelectedStepId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const openDumpFolder = useCallback(async () => {
    setLocalError(null);
    setMode("dump");
    await dumpLoader.actions.openViaDirectoryPicker();
  }, [dumpLoader.actions, setMode]);

  const onUploadDumpFolder = useCallback(
    async (files: FileList) => {
      setLocalError(null);
      setMode("dump");
      await dumpLoader.actions.loadFromFileList(files);
    },
    [dumpLoader.actions, setMode]
  );

  const startBrowserRun = useCallback((overrides?: { seed?: number }) => {
    setLocalError(null);
    if (browserConfigOverrides.enabled && browserConfigOverrides.tab === "json") {
      const { ok } = browserConfigOverrides.applyJson();
      if (!ok) {
        setLocalError("Config overrides JSON is invalid. Fix it (or disable overrides) and try again.");
        return;
      }
    }
    const pinned = capturePinnedSelection({
      mode,
      selectedStepId: viz.selectedStepId,
      selectedLayerKey: viz.selectedLayerKey,
    });
    setMode("browser");
    viz.clearStream();
    if (!pinned.retainStep) viz.setSelectedStepId(null);
    if (!pinned.retainLayer) viz.setSelectedLayerKey(null);
    if (!pinned.retainStep) viz.resetView();

    browserRunner.actions.clearError();

    const seedToUse = overrides?.seed ?? browserSeed;
    const mapSize = getCiv7MapSizePreset(browserMapSizeId);
    const configOverrides = browserConfigOverrides.configOverridesForRun;
    browserRunner.actions.start({
      seed: seedToUse,
      mapSizeId: mapSize.id,
      dimensions: mapSize.dimensions,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      configOverrides,
    });
  }, [
    browserConfigOverrides,
    browserRunner.actions,
    browserMapSizeId,
    browserSeed,
    mode,
    viz,
  ]);



  const header = (
    <AppHeader
      isNarrow={isNarrow}
      mode={mode}
      onModeChange={setMode}
      browserSeed={browserSeed}
      onBrowserSeedChange={setBrowserSeed}
      onRerollSeed={() => {
        const next = randomU32();
        setBrowserSeed(next);
        startBrowserRun({ seed: next });
      }}
      browserMapSizeId={browserMapSizeId}
      onBrowserMapSizeChange={setBrowserMapSizeId}
      browserRunning={browserRunning}
      browserLastStep={browserLastStep}
      onStartBrowserRun={() => startBrowserRun()}
      onToggleOverrides={() => setBrowserConfigOpen((v) => !v)}
      overridesEnabled={browserConfigOverrides.enabled}
      onCancelBrowserRun={browserRunner.actions.cancel}
      onOpenDumpFolder={openDumpFolder}
      onUploadDumpFolder={onUploadDumpFolder}
      onFit={viz.fitToActive}
      canFit={Boolean(viz.activeBounds)}
      showMeshEdges={showMeshEdges}
      onShowMeshEdgesChange={setShowMeshEdges}
      showBackgroundGrid={showBackgroundGrid}
      onShowBackgroundGridChange={setShowBackgroundGrid}
      tileLayout={tileLayout}
      onTileLayoutChange={setTileLayout}
      selectedStepId={viz.selectedStepId}
      steps={viz.steps}
      onSelectedStepChange={viz.setSelectedStepId}
      selectedLayerKey={viz.selectedLayerKey}
      selectableLayers={viz.selectableLayers}
      onSelectedLayerChange={viz.setSelectedLayerKey}
      eraActive={viz.era.active}
      eraValue={viz.era.value}
      eraMax={viz.era.max}
      onEraChange={viz.era.setValue}
    />
  );

  const main = manifest ? (
    <DeckCanvas deck={viz.deck} />
  ) : (
    <div style={{ padding: 18, color: "#9ca3af" }}>
      {mode === "browser"
        ? "Click “Run (Browser)” to execute Foundation in a Web Worker and stream layers directly to deck.gl."
        : "Select a dump folder containing `manifest.json` (e.g. `mods/mod-swooper-maps/dist/visualization/<runId>`)."}
    </div>
  );

  const overlays = [
    mode === "browser" ? (
      <ConfigOverridesPanel
        open={browserConfigOpen}
        onClose={() => setBrowserConfigOpen(false)}
        controller={browserConfigOverrides}
        disabled={browserRunning}
        schema={BROWSER_TEST_RECIPE_CONFIG_SCHEMA}
        isNarrow={isNarrow}
      />
    ) : null,
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        fontSize: 12,
        color: "#9ca3af",
        background: "rgba(0,0,0,0.35)",
        padding: "6px 8px",
        borderRadius: 8,
      }}
    >
      {manifest ? (
        <>
          runId: <span style={{ color: "#e5e7eb" }}>{manifest.runId.slice(0, 12)}…</span>
          {" · "}
          viewport: {Math.round(viewportSize.width)}×{Math.round(viewportSize.height)}
        </>
      ) : (
        <>{mode === "browser" ? "No run loaded" : "No dump loaded"}</>
      )}
    </div>,
    manifest && effectiveLayer && legend ? (
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 12,
          color: "#e5e7eb",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.10)",
          padding: "10px 10px",
          borderRadius: 10,
          maxWidth: isNarrow ? "calc(100% - 20px)" : 360,
          maxHeight: isNarrow ? "40vh" : "70vh",
          overflowY: "auto",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{legend.title}</div>
        <div style={{ color: "#9ca3af", marginBottom: 8 }}>
          <div>step: {legend.context?.stepLabel ?? formatStepLabel(effectiveLayer.stepId)}</div>
          <div>
            layer: {legend.context?.layerId ?? effectiveLayer.layerId} ({legend.context?.kind ?? effectiveLayer.kind})
          </div>
          {legend.context?.eraIndex != null ? <div>era: {legend.context.eraIndex}</div> : null}
          {legend.context?.tileLayout ? <div>tile layout: {legend.context.tileLayout}</div> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {legend.items.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: `rgba(${item.color[0]},${item.color[1]},${item.color[2]},${item.color[3] / 255})`,
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#e5e7eb" }}>{item.label}</span>
            </div>
          ))}
        </div>
        {legend.note ? <div style={{ marginTop: 8, color: "#9ca3af" }}>{legend.note}</div> : null}
      </div>
    ) : null,
  ].filter(Boolean) as ReactNode[];

  return (
    <AppShell
      ref={containerRef}
      mode={mode}
      onModeChange={setMode}
      header={header}
      main={main}
      overlays={overlays}
      error={error}
    />
  );
}
