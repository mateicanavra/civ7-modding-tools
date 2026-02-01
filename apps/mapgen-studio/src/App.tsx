import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppHeader } from "./app/AppHeader";
import { AppShell, type AppMode } from "./app/AppShell";
import { PrototypeShell } from "./app/prototype/PrototypeShell";
import { useDumpLoader } from "./features/dumpViewer/useDumpLoader";
import { ConfigOverridesPanel } from "./features/configOverrides/ConfigOverridesPanel";
import { useConfigOverrides } from "./features/configOverrides/useConfigOverrides";
import { buildOverridesPatch } from "./features/configOverrides/overridesPatch";
import { useBrowserRunner } from "./features/browserRunner/useBrowserRunner";
import { capturePinnedSelection } from "./features/browserRunner/retention";
import { getCiv7MapSizePreset, type Civ7MapSizePreset } from "./features/browserRunner/mapSizes";
import { DeckCanvas, type DeckCanvasApi } from "./features/viz/DeckCanvas";
import { useVizState } from "./features/viz/useVizState";
import { formatStepLabel } from "./features/viz/presentation";
import type { TileLayout } from "./features/viz/model";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import {
  DEFAULT_STUDIO_RECIPE_ID,
  getRecipeArtifacts,
  STUDIO_RECIPE_OPTIONS,
  type StudioRecipeId,
} from "./recipes/catalog";
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
  const deckApiRef = useRef<DeckCanvasApi | null>(null);

  const [mode, setMode] = useState<AppMode>("browser");
  const [uiLayout, setUiLayout] = useState<"legacy" | "prototype">("legacy");

  const dumpLoader = useDumpLoader();
  const dumpAssetResolver = dumpLoader.state.status === "loaded" ? dumpLoader.state.reader : null;
  const dumpManifest = dumpLoader.state.status === "loaded" ? dumpLoader.state.manifest : null;

  const [browserSeed, setBrowserSeed] = useState(123);
  const [browserRecipeId, setBrowserRecipeId] = useState<StudioRecipeId>(DEFAULT_STUDIO_RECIPE_ID);
  const [browserMapSizeId, setBrowserMapSizeId] = useState<Civ7MapSizePreset["id"]>("MAPSIZE_HUGE");
  const [browserConfigOpen, setBrowserConfigOpen] = useState(false);
  const [tileLayout, setTileLayout] = useState<TileLayout>("row-offset");
  const [showEdgeOverlay, setShowEdgeOverlay] = useState(true);
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(true);
  const recipeArtifacts = getRecipeArtifacts(browserRecipeId);
  const browserConfigOverridesBaseConfig = useMemo(() => {
    // Recipes may export a sparse default config (e.g. `{}`) while their schema provides defaults.
    // Normalize once so "enable overrides" doesn't promote schema defaults into "overrides" payloads.
    const { value, errors } = normalizeStrict<Record<string, unknown>>(
      recipeArtifacts.configSchema as any,
      recipeArtifacts.defaultConfig as any,
      "/defaultConfig"
    );
    if (errors.length > 0) {
      console.error("[mapgen-studio] invalid recipe default config", errors);
      return recipeArtifacts.defaultConfig as Record<string, unknown>;
    }
    return value as Record<string, unknown>;
  }, [recipeArtifacts.configSchema, recipeArtifacts.defaultConfig]);

  const browserConfigOverrides = useConfigOverrides<Record<string, unknown>>({
    baseConfig: browserConfigOverridesBaseConfig,
    schema: recipeArtifacts.configSchema,
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
    showEdgeOverlay,
    allowPendingSelection: mode === "browser" && browserRunning,
    onError: (e) => setLocalError(formatErrorForUi(e)),
  });

  const manifest = viz.manifest;
  const effectiveLayer = viz.effectiveLayer;
  const legend = viz.legend;
  const { setDumpManifest, setSelectedStepId, setSelectedLayerKey } = viz;
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
    deckApiRef.current?.resetView();
  }, [dumpManifest, setDumpManifest, setSelectedLayerKey, setSelectedStepId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();

    // Prefer ResizeObserver so we track actual container size (sidebars, panels, etc.),
    // not just the global window size.
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
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
    let configOverrides: unknown = undefined;
    if (browserConfigOverrides.enabled && browserConfigOverrides.tab === "json") {
      const { ok, value } = browserConfigOverrides.applyJson();
      if (!ok) {
        setLocalError("Config overrides JSON is invalid. Fix it (or disable overrides) and try again.");
        return;
      }
      configOverrides = buildOverridesPatch(browserConfigOverridesBaseConfig, value);
    } else if (browserConfigOverrides.enabled) {
      // Precomputed in the overrides controller so rerolls don't pay deep-diff costs.
      configOverrides = browserConfigOverrides.patchForRun;
    }

    // Avoid posting empty overrides payloads (structured clone is still work).
    if (
      configOverrides &&
      typeof configOverrides === "object" &&
      !Array.isArray(configOverrides) &&
      Object.keys(configOverrides as Record<string, unknown>).length === 0
    ) {
      configOverrides = undefined;
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
    if (!pinned.retainStep) deckApiRef.current?.resetView();

    browserRunner.actions.clearError();

    const seedToUse = overrides?.seed ?? browserSeed;
    const mapSize = getCiv7MapSizePreset(browserMapSizeId);
    browserRunner.actions.start({
      recipeId: browserRecipeId,
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
    browserRecipeId,
    browserSeed,
    mode,
    viz,
  ]);



  const header = (
    <AppHeader
      isNarrow={isNarrow}
      mode={mode}
      onModeChange={setMode}
      uiLayout={uiLayout}
      onUiLayoutChange={setUiLayout}
      browserRecipeId={browserRecipeId}
      recipeOptions={STUDIO_RECIPE_OPTIONS}
      onBrowserRecipeChange={setBrowserRecipeId}
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
      onFit={() => {
        if (!viz.activeBounds) return;
        deckApiRef.current?.fitToBounds(viz.activeBounds);
      }}
      canFit={Boolean(viz.activeBounds)}
      showEdgeOverlay={showEdgeOverlay}
      onShowEdgeOverlayChange={setShowEdgeOverlay}
      showBackgroundGrid={showBackgroundGrid}
      onShowBackgroundGridChange={setShowBackgroundGrid}
      tileLayout={tileLayout}
      onTileLayoutChange={setTileLayout}
      selectedStepId={viz.selectedStepId}
      pipelineStages={viz.pipelineStages}
      onSelectedStepChange={viz.setSelectedStepId}
      selectedLayerKey={viz.selectedLayerKey}
      selectableLayers={viz.selectableLayers}
      onSelectedLayerChange={viz.setSelectedLayerKey}
    />
  );

  const canvas = manifest ? (
    <DeckCanvas
      apiRef={deckApiRef}
      layers={viz.deck.layers}
      effectiveLayer={viz.effectiveLayer}
      viewportSize={viewportSize}
      showBackgroundGrid={showBackgroundGrid}
      activeBounds={viz.activeBounds}
    />
  ) : (
    <div style={{ padding: 18, color: "#9ca3af" }}>
      {mode === "browser"
        ? "Click “Run (Browser)” to execute the selected recipe in a Web Worker and stream layers directly to deck.gl."
        : "Select a dump folder containing `manifest.json` (e.g. `<mod>/dist/visualization/<runId>`)."}
    </div>
  );

  const main =
    uiLayout === "prototype" ? (
      <PrototypeShell
        isNarrow={isNarrow}
        leftPanel={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.35 }}>
              UI-04 shell: layout only. Wiring happens in UI-05.
            </div>
            <div style={{ fontSize: 12, color: "#e5e7eb" }}>
              recipe: <span style={{ color: "#93c5fd" }}>{browserRecipeId}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setBrowserConfigOpen(true)}
                style={{
                  background: "#111827",
                  color: "#e5e7eb",
                  border: "1px solid #374151",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Config overrides…
              </button>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                overrides:{" "}
                <span style={{ color: browserConfigOverrides.enabled ? "#86efac" : "#fca5a5" }}>
                  {browserConfigOverrides.enabled ? "enabled" : "disabled"}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#9ca3af", lineHeight: 1.35 }}>
              Selected step drives available data types + render modes.
            </div>
          </div>
        }
        rightPanel={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              stage groups: <span style={{ color: "#e5e7eb" }}>{viz.pipelineStages.length}</span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              selected step:{" "}
              <span style={{ color: "#e5e7eb" }}>
                {viz.selectedStepId ? formatStepLabel(viz.selectedStepId) : "—"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              data types:{" "}
              <span style={{ color: "#e5e7eb" }}>{viz.dataTypeModel?.dataTypes.length ?? 0}</span>
            </div>
          </div>
        }
        footer={
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(10, 18, 36, 0.92)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              status:{" "}
              <span style={{ color: browserRunning ? "#fbbf24" : manifest ? "#86efac" : "#9ca3af" }}>
                {browserRunning ? "running" : manifest ? "ready" : "idle"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              runId:{" "}
              <span style={{ color: "#e5e7eb" }}>{manifest ? `${manifest.runId.slice(0, 12)}…` : "—"}</span>
            </div>
          </div>
        }
      >
        {canvas}
      </PrototypeShell>
    ) : (
      canvas
    );

  const overlays = [
    mode === "browser" ? (
      <ConfigOverridesPanel
        open={browserConfigOpen}
        onClose={() => setBrowserConfigOpen(false)}
        controller={browserConfigOverrides}
        // Disabling a large RJSF form during runs is extremely expensive (thousands of DOM nodes).
        // We snapshot overrides at run-start, so edits during a run simply apply on the next run.
        disabled={false}
        schema={recipeArtifacts.configSchema}
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
