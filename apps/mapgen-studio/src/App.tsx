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
import { parsePipelineAddress } from "./shared/pipelineAddress";
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

  const dumpLoader = useDumpLoader();
  const dumpAssetResolver = dumpLoader.state.status === "loaded" ? dumpLoader.state.reader : null;
  const dumpManifest = dumpLoader.state.status === "loaded" ? dumpLoader.state.manifest : null;

  const [browserSeed, setBrowserSeed] = useState(123);
  const [browserRecipeId, setBrowserRecipeId] = useState<StudioRecipeId>(DEFAULT_STUDIO_RECIPE_ID);
  const [browserMapSizeId, setBrowserMapSizeId] = useState<Civ7MapSizePreset["id"]>("MAPSIZE_HUGE");
  const [browserPlayerCount, setBrowserPlayerCount] = useState(4);
  const [browserResourcesMode, setBrowserResourcesMode] = useState<"balanced" | "strategic">("balanced");
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

  const prototypeStages = useMemo(() => {
    if (mode === "browser") {
      return recipeArtifacts.uiMeta.stages.map((stage) => ({
        stageId: stage.stageId,
        label: stage.stageId,
        steps: stage.steps.map((step) => ({
          stepId: step.stepId,
          label: step.stepId,
          fullStepId: step.fullStepId,
          configFocusPathWithinStage: [...step.configFocusPathWithinStage],
        })),
      }));
    }

    return viz.pipelineStages.map((stage) => ({
      stageId: stage.stageId,
      label: stage.stageId,
      steps: stage.steps.map((step) => ({
        stepId: step.address?.stepId ?? step.stepId,
        label: step.address?.stepId ?? step.stepId,
        fullStepId: step.stepId,
        configFocusPathWithinStage: [] as string[],
      })),
    }));
  }, [mode, recipeArtifacts.uiMeta.stages, viz.pipelineStages]);

  const prototypeSelectedStepId = useMemo(() => {
    const selected = viz.selectedStepId;
    if (selected && prototypeStages.some((s) => s.steps.some((st) => st.fullStepId === selected))) return selected;
    return prototypeStages[0]?.steps[0]?.fullStepId ?? null;
  }, [prototypeStages, viz.selectedStepId]);

  const prototypeSelectedStageId = useMemo(() => {
    const addr = prototypeSelectedStepId ? parsePipelineAddress(prototypeSelectedStepId) : null;
    const fromStep = addr?.stageId;
    if (fromStep && prototypeStages.some((s) => s.stageId === fromStep)) return fromStep;
    return prototypeStages[0]?.stageId ?? null;
  }, [prototypeSelectedStepId, prototypeStages]);

  const prototypeSelectedStage = useMemo(
    () => (prototypeSelectedStageId ? prototypeStages.find((s) => s.stageId === prototypeSelectedStageId) ?? null : null),
    [prototypeSelectedStageId, prototypeStages]
  );

  const prototypeSelectedStep = useMemo(() => {
    if (!prototypeSelectedStepId) return null;
    return prototypeStages.flatMap((s) => s.steps).find((st) => st.fullStepId === prototypeSelectedStepId) ?? null;
  }, [prototypeSelectedStepId, prototypeStages]);

  const configFocusPath = useMemo(() => {
    if (mode !== "browser") return null;
    if (!prototypeSelectedStageId || !prototypeSelectedStep) return null;
    return [prototypeSelectedStageId, ...prototypeSelectedStep.configFocusPathWithinStage];
  }, [mode, prototypeSelectedStageId, prototypeSelectedStep]);

  useEffect(() => {
    if (mode !== "browser" && mode !== "dump") return;
    if (!prototypeSelectedStepId) return;
    if (viz.selectedStepId === prototypeSelectedStepId) return;
    viz.setSelectedStepId(prototypeSelectedStepId);
    viz.setSelectedLayerKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, prototypeSelectedStepId]);

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
      playerCount: browserPlayerCount,
      resourcesMode: browserResourcesMode,
      configOverrides,
    });
  }, [
    browserConfigOverrides,
    browserRunner.actions,
    browserMapSizeId,
    browserRecipeId,
    browserSeed,
    browserPlayerCount,
    browserResourcesMode,
    mode,
    viz,
  ]);



  const header = (
    <AppHeader
      isNarrow={isNarrow}
      mode={mode}
      onModeChange={setMode}
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

  const main = (() => {
    const controlBase: React.CSSProperties = {
      background: "#111827",
      color: "#e5e7eb",
      border: "1px solid #374151",
      borderRadius: 10,
      padding: "8px 10px",
      fontWeight: 600,
      width: "100%",
    };

    const selectStyle: React.CSSProperties = {
      ...controlBase,
      appearance: "none",
    };

    const helpStyle: React.CSSProperties = { fontSize: 12, color: "#9ca3af", lineHeight: 1.35 };

    const dataTypeModel = viz.dataTypeModel;

    const layerSelection = (() => {
      if (!dataTypeModel) return null;
      for (const dt of dataTypeModel.dataTypes) {
        for (const rm of dt.renderModes) {
          for (const variant of rm.variants) {
            if (variant.layerKey === viz.selectedLayerKey) {
              return { dataTypeId: dt.dataTypeId, renderModeId: rm.renderModeId, variantId: variant.variantId };
            }
          }
        }
      }
      const firstDt = dataTypeModel.dataTypes[0];
      const firstRm = firstDt?.renderModes[0];
      const firstVariant = firstRm?.variants[0];
      if (!firstDt || !firstRm || !firstVariant) return null;
      return { dataTypeId: firstDt.dataTypeId, renderModeId: firstRm.renderModeId, variantId: firstVariant.variantId };
    })();

    const selectedDataType =
      dataTypeModel?.dataTypes.find((dt) => dt.dataTypeId === layerSelection?.dataTypeId) ?? dataTypeModel?.dataTypes[0] ?? null;
    const selectedRenderMode =
      selectedDataType?.renderModes.find((rm) => rm.renderModeId === layerSelection?.renderModeId) ??
      selectedDataType?.renderModes[0] ??
      null;
    const selectedVariant =
      selectedRenderMode?.variants.find((v) => v.variantId === layerSelection?.variantId) ?? selectedRenderMode?.variants[0] ?? null;

    return (
      <PrototypeShell
        isNarrow={isNarrow}
        leftPanel={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#e5e7eb" }}>
              {mode === "browser" ? (
                <>
                  recipe: <span style={{ color: "#93c5fd" }}>{browserRecipeId}</span>
                </>
              ) : (
                <>
                  dump:{" "}
                  <span style={{ color: "#e5e7eb" }}>{manifest ? `${manifest.runId.slice(0, 12)}…` : "—"}</span>
                </>
              )}
            </div>

            {mode === "browser" ? (
              <>
                <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 700, letterSpacing: 0.2 }}>World settings</div>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={helpStyle}>player count</span>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={browserPlayerCount}
                    onChange={(e) => setBrowserPlayerCount(Math.max(1, Math.min(32, Number(e.target.value) || 1)))}
                    style={controlBase}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={helpStyle}>resources</span>
                  <select
                    value={browserResourcesMode}
                    onChange={(e) => setBrowserResourcesMode(e.target.value as "balanced" | "strategic")}
                    style={selectStyle}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="strategic">Strategic</option>
                  </select>
                </label>

                <div style={helpStyle}>
                  Config focus: <span style={{ color: "#e5e7eb" }}>{configFocusPath ? configFocusPath.join(".") : "—"}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setBrowserConfigOpen(true)}
                    style={{ ...controlBase, cursor: "pointer", fontWeight: 700, width: "auto" }}
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
              </>
            ) : (
              <div style={helpStyle}>Config overrides are available only in browser runs.</div>
            )}

            <div style={{ marginTop: 6, ...helpStyle }}>
              Selected step drives available data types + render modes (from the viz stream).
            </div>
          </div>
        }
        rightPanel={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={helpStyle}>
              stage: <span style={{ color: "#e5e7eb" }}>{prototypeSelectedStageId ?? "—"}</span>
            </div>
            <select
              value={prototypeSelectedStageId ?? ""}
              style={selectStyle}
              onChange={(e) => {
                const nextStageId = e.target.value;
                const stage = prototypeStages.find((s) => s.stageId === nextStageId);
                const nextStepId = stage?.steps[0]?.fullStepId ?? null;
                viz.setSelectedStepId(nextStepId);
                viz.setSelectedLayerKey(null);
              }}
              disabled={prototypeStages.length === 0}
            >
              {prototypeStages.map((s) => (
                <option key={s.stageId} value={s.stageId}>
                  {s.label}
                </option>
              ))}
            </select>

            <div style={{ ...helpStyle, marginTop: 6 }}>
              step:{" "}
              <span style={{ color: "#e5e7eb" }}>{prototypeSelectedStepId ? formatStepLabel(prototypeSelectedStepId) : "—"}</span>
            </div>
            <select
              value={prototypeSelectedStepId ?? ""}
              style={selectStyle}
              onChange={(e) => {
                viz.setSelectedStepId(e.target.value || null);
                viz.setSelectedLayerKey(null);
              }}
              disabled={!prototypeSelectedStage || prototypeSelectedStage.steps.length === 0}
            >
              {(prototypeSelectedStage?.steps ?? []).map((st) => (
                <option key={st.fullStepId} value={st.fullStepId}>
                  {st.label}
                </option>
              ))}
            </select>

            <div style={{ ...helpStyle, marginTop: 10 }}>
              data type: <span style={{ color: "#e5e7eb" }}>{dataTypeModel ? dataTypeModel.dataTypes.length : "—"}</span>
            </div>
            <select
              value={selectedDataType?.dataTypeId ?? ""}
              style={selectStyle}
              disabled={!dataTypeModel || dataTypeModel.dataTypes.length === 0}
              onChange={(e) => {
                if (!dataTypeModel) return;
                const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === e.target.value);
                const rm = dt?.renderModes[0];
                const variant = rm?.variants[0];
                viz.setSelectedLayerKey(variant?.layerKey ?? null);
              }}
            >
              {(dataTypeModel?.dataTypes ?? []).map((dt) => (
                <option key={dt.dataTypeId} value={dt.dataTypeId}>
                  {dt.label}
                </option>
              ))}
            </select>

            <div style={{ ...helpStyle, marginTop: 10 }}>render mode</div>
            <select
              value={selectedRenderMode?.renderModeId ?? ""}
              style={selectStyle}
              disabled={!selectedDataType || selectedDataType.renderModes.length === 0}
              onChange={(e) => {
                if (!selectedDataType) return;
                const rm = selectedDataType.renderModes.find((x) => x.renderModeId === e.target.value);
                const variant = rm?.variants[0];
                viz.setSelectedLayerKey(variant?.layerKey ?? null);
              }}
            >
              {(selectedDataType?.renderModes ?? []).map((rm) => (
                <option key={rm.renderModeId} value={rm.renderModeId}>
                  {rm.label}
                </option>
              ))}
            </select>

            {selectedRenderMode && selectedRenderMode.variants.length > 1 ? (
              <>
                <div style={{ ...helpStyle, marginTop: 10 }}>variant</div>
                <select
                  value={selectedVariant?.variantId ?? ""}
                  style={selectStyle}
                  onChange={(e) => {
                    const v = selectedRenderMode.variants.find((x) => x.variantId === e.target.value);
                    viz.setSelectedLayerKey(v?.layerKey ?? null);
                  }}
                >
                  {selectedRenderMode.variants.map((v) => (
                    <option key={v.variantId} value={v.variantId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
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
              runId: <span style={{ color: "#e5e7eb" }}>{manifest ? `${manifest.runId.slice(0, 12)}…` : "—"}</span>
            </div>
          </div>
        }
      >
        {canvas}
      </PrototypeShell>
    );
  })();

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
        focusPath={configFocusPath}
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
