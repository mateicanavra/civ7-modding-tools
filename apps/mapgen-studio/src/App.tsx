import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BROWSER_TEST_RECIPE_CONFIG,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
  type BrowserTestRecipeConfig,
} from "@mapgen/browser-recipes/browser-test";
import { ConfigOverridesPanel } from "./features/configOverrides/ConfigOverridesPanel";
import { useConfigOverrides } from "./features/configOverrides/useConfigOverrides";
import { useBrowserRunner } from "./features/browserRunner/useBrowserRunner";
import { capturePinnedSelection } from "./features/browserRunner/retention";
import { DeckCanvas } from "./features/viz/DeckCanvas";
import { useVizState } from "./features/viz/useVizState";
import { formatStepLabel } from "./features/viz/presentation";
import type { TileLayout, VizManifestV0 } from "./features/viz/model";
import type { VizEvent } from "./shared/vizEvents";

type FileMap = Map<string, File>;

function stripRootDirPrefix(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return path;
  return parts.slice(1).join("/");
}

type Civ7MapSizePreset = {
  id: "MAPSIZE_TINY" | "MAPSIZE_SMALL" | "MAPSIZE_STANDARD" | "MAPSIZE_LARGE" | "MAPSIZE_HUGE";
  label: "Tiny" | "Small" | "Standard" | "Large" | "Huge";
  dimensions: { width: number; height: number };
};

const CIV7_MAP_SIZES: Civ7MapSizePreset[] = [
  { id: "MAPSIZE_TINY", label: "Tiny", dimensions: { width: 60, height: 38 } },
  { id: "MAPSIZE_SMALL", label: "Small", dimensions: { width: 74, height: 46 } },
  { id: "MAPSIZE_STANDARD", label: "Standard", dimensions: { width: 84, height: 54 } },
  { id: "MAPSIZE_LARGE", label: "Large", dimensions: { width: 96, height: 60 } },
  { id: "MAPSIZE_HUGE", label: "Huge", dimensions: { width: 106, height: 66 } },
];

function getCiv7MapSizePreset(id: Civ7MapSizePreset["id"]): Civ7MapSizePreset {
  return CIV7_MAP_SIZES.find((m) => m.id === id) ?? CIV7_MAP_SIZES[CIV7_MAP_SIZES.length - 1]!;
}

function formatMapSizeLabel(p: Civ7MapSizePreset): string {
  return `${p.label} (${p.dimensions.width}×${p.dimensions.height})`;
}

function safeStringify(value: unknown): string | null {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "bigint") return `${v}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    return null;
  }
}

function formatErrorForUi(e: unknown): string {
  if (e instanceof Error) {
    const parts: string[] = [];
    const header = e.name ? `${e.name}: ${e.message}` : e.message;
    parts.push(header || "Error");
    const details = safeStringify(e);
    if (details && details !== "{}") parts.push(details);
    if (e.stack) parts.push(e.stack);
    return parts.join("\n\n");
  }

  if (e instanceof ErrorEvent) {
    const parts: string[] = [];
    parts.push(e.message || "ErrorEvent");
    if (e.filename) parts.push(`${e.filename}:${e.lineno}:${e.colno}`);
    if (e.error) parts.push(formatErrorForUi(e.error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}

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

async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

async function loadManifestFromFileMap(fileMap: FileMap): Promise<VizManifestV0> {
  const manifestFile = fileMap.get("manifest.json");
  if (!manifestFile) {
    throw new Error("manifest.json not found. Select the run folder that contains manifest.json.");
  }
  const text = await readFileAsText(manifestFile);
  return JSON.parse(text) as VizManifestV0;
}

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const isNarrow = viewportSize.width < 760;

  const [mode, setMode] = useState<"browser" | "dump">("browser");

  const [dumpFileMap, setDumpFileMap] = useState<FileMap | null>(null);
  const dumpAssetResolver = useMemo(() => {
    if (!dumpFileMap) return null;
    return {
      readArrayBuffer: async (path: string) => {
        const file = dumpFileMap.get(path);
        if (!file) throw new Error(`Missing file: ${path}`);
        return await file.arrayBuffer();
      },
    };
  }, [dumpFileMap]);

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

  const [error, setError] = useState<string | null>(null);

  const vizIngestRef = useRef<(event: VizEvent) => void>(() => {});
  const selectedStepIdRef = useRef<string | null>(null);
  const selectedLayerKeyRef = useRef<string | null>(null);

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
    onError: (e) => setError(formatErrorForUi(e)),
  });

  const manifest = viz.manifest;
  const effectiveLayer = viz.effectiveLayer;
  const legend = viz.legend;

  useEffect(() => {
    vizIngestRef.current = viz.ingest;
  }, [viz.ingest]);

  useEffect(() => {
    selectedStepIdRef.current = viz.selectedStepId;
  }, [viz.selectedStepId]);

  useEffect(() => {
    selectedLayerKeyRef.current = viz.selectedLayerKey;
  }, [viz.selectedLayerKey]);

  useEffect(() => {
    if (mode !== "browser") return;
    if (!browserRunner.state.error) return;
    setError(browserRunner.state.error);
  }, [browserRunner.state.error, mode, setError]);

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

  const layersForStepGrouped = useMemo(() => {
    if (!viz.selectableLayers.length) return [];
    const order: string[] = [];
    const groups = new Map<string, typeof viz.selectableLayers>();
    for (const entry of viz.selectableLayers) {
      const groupLabel = entry.group ?? "Other";
      if (!groups.has(groupLabel)) {
        groups.set(groupLabel, []);
        order.push(groupLabel);
      }
      groups.get(groupLabel)!.push(entry);
    }
    return order.map((group) => ({
      group,
      layers: groups.get(group) ?? [],
    }));
  }, [viz.selectableLayers]);

  const openDumpFolder = useCallback(async () => {
    setError(null);
    try {
      setMode("dump");
      const anyWindow = window as any;
      if (typeof anyWindow.showDirectoryPicker === "function") {
        const dirHandle: any = await anyWindow.showDirectoryPicker();
        const files: FileMap = new Map();

        const walk = async (handle: any, prefix: string) => {
          for await (const [name, entry] of handle.entries()) {
            const path = prefix ? `${prefix}/${name}` : name;
            if (entry.kind === "directory") {
              await walk(entry, path);
            } else if (entry.kind === "file") {
              const file = await entry.getFile();
              files.set(path, file);
            }
          }
        };

        await walk(dirHandle, "");
        // If the selected folder is the run folder, manifest.json should be at root.
        // If it was selected with an extra parent dir, allow stripping one leading component.
        const normalized: FileMap = new Map();
        for (const [path, file] of files.entries()) {
          normalized.set(path, file);
          normalized.set(stripRootDirPrefix(path), file);
        }
        setDumpFileMap(normalized);
        const m = await loadManifestFromFileMap(normalized);
        viz.setDumpManifest(m);
        const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
        viz.setSelectedStepId(firstStep);
        viz.setSelectedLayerKey(null);
        viz.resetView();
        return;
      }

      // Fallback: directory upload (Chromium via webkitdirectory).
      setError("Your browser does not support folder picking. Use a Chromium-based browser, or enable directory picking.");
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [viz]);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const onDirectoryFiles = useCallback(async () => {
    setError(null);
    try {
      const input = directoryInputRef.current;
      if (!input?.files) return;
      setMode("dump");
      const files: FileMap = new Map();
      for (const file of Array.from(input.files)) {
        const rel = (file as any).webkitRelativePath ? String((file as any).webkitRelativePath) : file.name;
        files.set(stripRootDirPrefix(rel), file);
      }
      setDumpFileMap(files);
      const m = await loadManifestFromFileMap(files);
      viz.setDumpManifest(m);
      const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
      viz.setSelectedStepId(firstStep);
      viz.setSelectedLayerKey(null);
      viz.resetView();
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [viz]);

  const startBrowserRun = useCallback((overrides?: { seed?: number }) => {
    setError(null);
    if (browserConfigOverrides.enabled && browserConfigOverrides.tab === "json") {
      const { ok } = browserConfigOverrides.applyJson();
      if (!ok) {
        setError("Config overrides JSON is invalid. Fix it (or disable overrides) and try again.");
        return;
      }
    }
    const pinned = capturePinnedSelection({
      mode,
      selectedStepId: selectedStepIdRef.current,
      selectedLayerKey: selectedLayerKeyRef.current,
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

  const triggerDirectoryPicker = useCallback(() => {
    directoryInputRef.current?.click();
  }, []);

  const controlBaseStyle: React.CSSProperties = useMemo(
    () => ({
      background: "#111827",
      color: "#e5e7eb",
      border: "1px solid #374151",
      borderRadius: 8,
      padding: isNarrow ? "10px 10px" : "6px 8px",
      minWidth: 0,
      fontSize: isNarrow ? 14 : 13,
    }),
    [isNarrow]
  );

  const buttonStyle: React.CSSProperties = useMemo(
    () => ({
      ...controlBaseStyle,
      padding: isNarrow ? "10px 12px" : "6px 10px",
      cursor: "pointer",
      fontWeight: 600,
      width: isNarrow ? "100%" : undefined,
      textAlign: "center",
    }),
    [controlBaseStyle, isNarrow]
  );

  const toolbarSectionStyle: React.CSSProperties = useMemo(
    () => ({
      border: "1px solid #1f2937",
      background: "rgba(15, 23, 42, 0.6)",
      borderRadius: 12,
      padding: isNarrow ? "10px" : "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }),
    [isNarrow]
  );

  const toolbarSectionTitleStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.02em",
      color: "#cbd5f5",
      textTransform: "uppercase",
    }),
    []
  );

  const toolbarRowStyle: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    }),
    []
  );


  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b1020", color: "#e5e7eb" }}>
      <div
        style={{
          padding: isNarrow ? "10px 12px" : "12px 14px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          gap: isNarrow ? 10 : 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: isNarrow ? "flex-start" : "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: isNarrow ? 16 : 14 }}>MapGen Studio</div>
          <div style={{ color: "#9ca3af", fontSize: isNarrow ? 13 : 12 }}>
            {mode === "browser" ? "Browser Runner (V0.1 Slice)" : "Dump Viewer (V0)"}
          </div>
          <div style={{ flex: 1 }} />
          {!isNarrow && mode === "dump" ? (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Open a run folder under <span style={{ color: "#e5e7eb" }}>mods/mod-swooper-maps/dist/visualization</span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>Run</div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "0 0 auto" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  style={{ ...controlBaseStyle, width: isNarrow ? "100%" : 170 }}
                >
                  <option value="browser">browser</option>
                  <option value="dump">dump</option>
                </select>
              </label>
            </div>

            {mode === "browser" ? (
              <>
                <div style={toolbarRowStyle}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Seed</span>
                    <input
                      value={browserSeed}
                      onChange={(e) => setBrowserSeed(Number.parseInt(e.target.value || "0", 10) || 0)}
                      style={{ ...controlBaseStyle, width: 96 }}
                    />
                    <button
                      onClick={() => {
                        const next = randomU32();
                        setBrowserSeed(next);
                        startBrowserRun({ seed: next });
                      }}
                      style={{ ...buttonStyle, padding: "6px 10px" }}
                      title="Reroll seed"
                      type="button"
                    >
                      Reroll
                    </button>
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Map size</span>
                    <select
                      value={browserMapSizeId}
                      onChange={(e) => setBrowserMapSizeId(e.target.value as Civ7MapSizePreset["id"])}
                      style={{ ...controlBaseStyle, width: 220 }}
                      disabled={browserRunning}
                    >
                      {CIV7_MAP_SIZES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatMapSizeLabel(p)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={toolbarRowStyle}>
                  <button
                    onClick={() => startBrowserRun()}
                    style={{
                      ...buttonStyle,
                      opacity: browserRunning ? 0.6 : 1,
                      background: "#2563eb",
                      borderColor: "#1d4ed8",
                    }}
                    disabled={browserRunning}
                  >
                    Run (Browser)
                  </button>
                  <button
                    onClick={() => setBrowserConfigOpen((v) => !v)}
                    style={{ ...buttonStyle, padding: "6px 10px", opacity: browserConfigOverrides.enabled ? 1 : 0.85 }}
                    title="Toggle config overrides panel"
                    type="button"
                  >
                    Overrides
                  </button>
                  <button
                    onClick={browserRunner.actions.cancel}
                    style={{ ...buttonStyle, opacity: browserRunning ? 1 : 0.6 }}
                    disabled={!browserRunning}
                  >
                    Cancel
                  </button>
                </div>
                {browserLastStep ? (
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    step: <span style={{ color: "#e5e7eb" }}>{browserLastStep.stepIndex}</span> ·{" "}
                    {formatStepLabel(browserLastStep.stepId)}
                  </div>
                ) : null}
              </>
            ) : (
              <div style={toolbarRowStyle}>
                <button onClick={openDumpFolder} style={buttonStyle}>
                  Open dump folder
                </button>

                <input
                  ref={directoryInputRef}
                  type="file"
                  multiple
                  onChange={onDirectoryFiles}
                  style={{ display: "none" }}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                <button onClick={triggerDirectoryPicker} style={buttonStyle}>
                  Upload dump folder
                </button>
              </div>
            )}
          </div>

          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>View</div>
            <div style={toolbarRowStyle}>
              <button
                onClick={viz.fitToActive}
                style={{ ...buttonStyle, opacity: viz.activeBounds ? 1 : 0.55 }}
                disabled={!viz.activeBounds}
              >
                Fit
              </button>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "2px 2px",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Mesh edges</span>
                <input type="checkbox" checked={showMeshEdges} onChange={(e) => setShowMeshEdges(e.target.checked)} />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "2px 2px",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Background grid</span>
                <input
                  type="checkbox"
                  checked={showBackgroundGrid}
                  onChange={(e) => setShowBackgroundGrid(e.target.checked)}
                />
              </label>
            </div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 76 }}>Hex layout</span>
                <select
                  value={tileLayout}
                  onChange={(e) => setTileLayout(e.target.value as TileLayout)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                >
                  <option value="row-offset">row-offset (Civ-like)</option>
                  <option value="col-offset">col-offset</option>
                </select>
              </label>
            </div>
          </div>

          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>Inspect</div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Step</span>
                <select
                  value={viz.selectedStepId ?? ""}
                  onChange={(e) => viz.setSelectedStepId(e.target.value || null)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                  disabled={!viz.steps.length && !viz.selectedStepId}
                >
                  {viz.selectedStepId && !viz.steps.some((s) => s.stepId === viz.selectedStepId) ? (
                    <option value={viz.selectedStepId}>
                      {formatStepLabel(viz.selectedStepId)} (pending)
                    </option>
                  ) : null}
                  {viz.steps.map((s) => (
                    <option key={s.stepId} value={s.stepId}>
                      {s.stepIndex} · {formatStepLabel(s.stepId)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Layer</span>
                <select
                  value={viz.selectedLayerKey ?? ""}
                  onChange={(e) => viz.setSelectedLayerKey(e.target.value || null)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                  disabled={!viz.selectableLayers.length && !viz.selectedLayerKey}
                >
                  {viz.selectedLayerKey && !viz.selectableLayers.some((l) => l.key === viz.selectedLayerKey) ? (
                    <option value={viz.selectedLayerKey}>
                      {(() => {
                        const parts = viz.selectedLayerKey?.split("::") ?? [];
                        const label = parts.length >= 3 ? `${parts[1]} (${parts[2]})` : viz.selectedLayerKey;
                        return `${label} (pending)`;
                      })()}
                    </option>
                  ) : null}
                  {layersForStepGrouped.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.layers.map((l) => (
                        <option key={l.key} value={l.key}>
                          {l.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>

            {viz.era.active ? (
              <div style={toolbarRowStyle}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Era</span>
                  <input
                    type="range"
                    min={0}
                    max={viz.era.max ?? 0}
                    step={1}
                    value={Math.max(0, Math.min(viz.era.max ?? 0, viz.era.value))}
                    onChange={(e) => viz.era.setValue(Number.parseInt(e.target.value, 10))}
                    style={{ flex: 1, width: "100%" }}
                  />
                  <span style={{ fontSize: 12, color: "#e5e7eb", minWidth: 26, textAlign: "right" }}>
                    {Math.max(0, Math.min(viz.era.max ?? 0, viz.era.value))}
                  </span>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div style={{ padding: 12, background: "#2a0b0b", borderBottom: "1px solid #7f1d1d", color: "#fecaca" }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
        </div>
      ) : null}

      <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
        {mode === "browser" ? (
          <ConfigOverridesPanel
            open={browserConfigOpen}
            onClose={() => setBrowserConfigOpen(false)}
            controller={browserConfigOverrides}
            disabled={browserRunning}
            schema={BROWSER_TEST_RECIPE_CONFIG_SCHEMA}
          />
        ) : null}
        {manifest ? (
          <DeckCanvas deck={viz.deck} />
        ) : (
          <div style={{ padding: 18, color: "#9ca3af" }}>
            {mode === "browser"
              ? "Click “Run (Browser)” to execute Foundation in a Web Worker and stream layers directly to deck.gl."
              : "Select a dump folder containing `manifest.json` (e.g. `mods/mod-swooper-maps/dist/visualization/<runId>`)."}
          </div>
        )}
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
        </div>

        {manifest && effectiveLayer && legend ? (
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
        ) : null}
      </div>
    </div>
  );
}
