import type { Layer } from "@deck.gl/core";
import type { MutableRefObject } from "react";

import { DeckCanvas, type DeckCanvasApi } from "../features/viz/DeckCanvas";
import type { Bounds, VizLayerEntryV1 } from "../features/viz/model";

export type CanvasStageProps = {
  apiRef: MutableRefObject<DeckCanvasApi | null>;
  onApiReady: () => void;
  layers: Layer[];
  effectiveLayer: VizLayerEntryV1 | null;
  viewportSize: { width: number; height: number };
  activeBounds: Bounds | null;
  lightMode: boolean;
  /** Whether the decorative background grid is rendered behind the canvas. */
  backgroundGridEnabled: boolean;
  /** True once a viz manifest has been produced; gates the empty-state hint. */
  hasManifest: boolean;
};

/**
 * `CanvasStage` — the full-bleed deck.gl host (architecture/10 §4).
 *
 * Purely presentational: it owns the theme-tinted backdrop, the optional
 * decorative grid, the `DeckCanvas` mount, and the "Click Run to generate a map"
 * empty state. All rendering inputs (layers, effective layer, viewport, bounds,
 * deck api ref/ready handler) are passed in by `StudioShell`. This block was
 * previously the inline `canvas` JSX inside `AppContent`; it is MOVED here
 * verbatim so the DOM, classes, and Deck.gl inputs are unchanged — recoloring the
 * hard-coded backdrop hexes is deferred to the design-craft slice, not this
 * behavior-preserving decomposition.
 */
export function CanvasStage(props: CanvasStageProps) {
  const {
    apiRef,
    onApiReady,
    layers,
    effectiveLayer,
    viewportSize,
    activeBounds,
    lightMode,
    backgroundGridEnabled,
    hasManifest,
  } = props;

  return (
    <div className="absolute inset-0">
      <div className={`absolute inset-0 ${lightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a12]"}`} />
      {/* Theme-tinted backdrop (kept outside deck.gl so it remains stable and cheap) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: lightMode
            ? `
              radial-gradient(circle at 30% 40%, #cbd5e0 0%, transparent 55%),
              radial-gradient(circle at 70% 60%, #cbd5e0 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, #cbd5e0 0%, transparent 35%)
            `
            : `
              radial-gradient(circle at 30% 40%, #2d3748 0%, transparent 55%),
              radial-gradient(circle at 70% 60%, #2d3748 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, #2d3748 0%, transparent 35%)
            `,
        }}
      />
      {backgroundGridEnabled ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${lightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.02)"} 1px, transparent 1px),
              linear-gradient(90deg, ${lightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.02)"} 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />
      ) : null}
      <DeckCanvas
        apiRef={apiRef}
        onApiReady={onApiReady}
        layers={layers}
        effectiveLayer={effectiveLayer}
        viewportSize={viewportSize}
        showBackgroundGrid={false}
        lightMode={lightMode}
        activeBounds={activeBounds}
      />
      {!hasManifest ? (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#7a7a8c]">
          Click Run to generate a map
        </div>
      ) : null}
    </div>
  );
}
