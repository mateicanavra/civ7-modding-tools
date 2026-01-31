import { useMemo, useRef } from "react";
import type { AppMode } from "./AppShell";
import {
  CIV7_MAP_SIZES,
  formatMapSizeLabel,
  type Civ7MapSizePreset,
} from "../features/browserRunner/mapSizes";
import { formatStepLabel } from "../features/viz/presentation";
import type { TileLayout } from "../features/viz/model";
import type { RecipeOption, StudioRecipeId } from "../recipes/catalog";

export type AppHeaderProps = {
  isNarrow: boolean;
  mode: AppMode;
  onModeChange(next: AppMode): void;

  browserRecipeId: StudioRecipeId;
  recipeOptions: readonly RecipeOption[];
  onBrowserRecipeChange(next: StudioRecipeId): void;

  browserSeed: number;
  onBrowserSeedChange(next: number): void;
  onRerollSeed(): void;
  browserMapSizeId: Civ7MapSizePreset["id"];
  onBrowserMapSizeChange(next: Civ7MapSizePreset["id"]): void;
  browserRunning: boolean;
  browserLastStep: { stepId: string; stepIndex: number } | null;
  onStartBrowserRun(): void;
  onToggleOverrides(): void;
  overridesEnabled: boolean;
  onCancelBrowserRun(): void;

  onOpenDumpFolder(): void;
  onUploadDumpFolder(files: FileList): void;

  onFit(): void;
  canFit: boolean;
  showEdgeOverlay: boolean;
  onShowEdgeOverlayChange(next: boolean): void;
  showBackgroundGrid: boolean;
  onShowBackgroundGridChange(next: boolean): void;
  tileLayout: TileLayout;
  onTileLayoutChange(next: TileLayout): void;

  selectedStepId: string | null;
  steps: Array<{ stepId: string; stepIndex: number }>;
  onSelectedStepChange(next: string | null): void;
  selectedLayerKey: string | null;
  selectableLayers: Array<{ key: string; label: string; group?: string }>;
  onSelectedLayerChange(next: string | null): void;
};

export function AppHeader(props: AppHeaderProps) {
  const {
    isNarrow,
    mode,
    onModeChange,
    browserRecipeId,
    recipeOptions,
    onBrowserRecipeChange,
    browserSeed,
    onBrowserSeedChange,
    onRerollSeed,
    browserMapSizeId,
    onBrowserMapSizeChange,
    browserRunning,
    browserLastStep,
    onStartBrowserRun,
    onToggleOverrides,
    overridesEnabled,
    onCancelBrowserRun,
    onOpenDumpFolder,
    onUploadDumpFolder,
    onFit,
    canFit,
    showEdgeOverlay,
    onShowEdgeOverlayChange,
    showBackgroundGrid,
    onShowBackgroundGridChange,
    tileLayout,
    onTileLayoutChange,
    selectedStepId,
    steps,
    onSelectedStepChange,
    selectedLayerKey,
    selectableLayers,
    onSelectedLayerChange,
  } = props;

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

  const layersForStepGrouped = useMemo(() => {
    if (!selectableLayers.length) return [];
    const order: string[] = [];
    const groups = new Map<string, typeof selectableLayers>();
    for (const entry of selectableLayers) {
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
  }, [selectableLayers]);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const triggerDirectoryPicker = () => directoryInputRef.current?.click();

  return (
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
                onChange={(e) => onModeChange(e.target.value as AppMode)}
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
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Recipe</span>
                  <select
                    value={browserRecipeId}
                    onChange={(e) => onBrowserRecipeChange(e.target.value as StudioRecipeId)}
                    style={{ ...controlBaseStyle, width: 220 }}
                    disabled={browserRunning}
                  >
                    {recipeOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Seed</span>
                  <input
                    value={browserSeed}
                    onChange={(e) => onBrowserSeedChange(Number.parseInt(e.target.value || "0", 10) || 0)}
                    style={{ ...controlBaseStyle, width: 96 }}
                  />
                  <button
                    onClick={onRerollSeed}
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
                    onChange={(e) => onBrowserMapSizeChange(e.target.value as Civ7MapSizePreset["id"])}
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
                  onClick={onStartBrowserRun}
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
                  onClick={onToggleOverrides}
                  style={{ ...buttonStyle, padding: "6px 10px", opacity: overridesEnabled ? 1 : 0.85 }}
                  title="Toggle config overrides panel"
                  type="button"
                >
                  Overrides
                </button>
                <button
                  onClick={onCancelBrowserRun}
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
              <button onClick={onOpenDumpFolder} style={buttonStyle}>
                Open dump folder
              </button>

              <input
                ref={directoryInputRef}
                type="file"
                multiple
                onChange={(event) => {
                  if (!event.target.files) return;
                  onUploadDumpFolder(event.target.files);
                }}
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
              onClick={onFit}
              style={{ ...buttonStyle, opacity: canFit ? 1 : 0.55 }}
              disabled={!canFit}
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
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Overlay edges</span>
              <input
                type="checkbox"
                checked={showEdgeOverlay}
                onChange={(e) => onShowEdgeOverlayChange(e.target.checked)}
                title="Show an edge overlay if the current run provides one"
              />
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
                onChange={(e) => onShowBackgroundGridChange(e.target.checked)}
              />
            </label>
          </div>
          <div style={toolbarRowStyle}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 76 }}>Hex layout</span>
              <select
                value={tileLayout}
                onChange={(e) => onTileLayoutChange(e.target.value as TileLayout)}
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
                value={selectedStepId ?? ""}
                onChange={(e) => onSelectedStepChange(e.target.value || null)}
                style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                disabled={!steps.length && !selectedStepId}
              >
                {selectedStepId && !steps.some((s) => s.stepId === selectedStepId) ? (
                  <option value={selectedStepId}>{formatStepLabel(selectedStepId)} (pending)</option>
                ) : null}
                {steps.map((s) => (
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
                value={selectedLayerKey ?? ""}
                onChange={(e) => onSelectedLayerChange(e.target.value || null)}
                style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                disabled={!selectableLayers.length && !selectedLayerKey}
              >
                {selectedLayerKey && !selectableLayers.some((l) => l.key === selectedLayerKey) ? (
                  <option value={selectedLayerKey}>
                    {(() => {
                      const parts = selectedLayerKey?.split("::") ?? [];
                      const label = parts.length >= 3 ? `${parts[1]} (${parts[2]})` : selectedLayerKey;
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

        </div>
      </div>
    </div>
  );
}
