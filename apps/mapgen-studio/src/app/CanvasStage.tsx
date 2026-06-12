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
 * Purely presentational: it owns the token-driven backdrop, the optional
 * decorative grid, the `DeckCanvas` mount, and the "awaiting matter" empty state.
 * All rendering inputs (layers, effective layer, viewport, bounds, deck api
 * ref/ready handler) are passed in by `StudioShell`.
 *
 * Craft (system.md lever #3): the chrome backdrop is the page substrate
 * (`bg-background` — the token the design system names as "the deck.gl canvas
 * backdrop"), so it follows the `.dark` theme instead of a hard-coded
 * `lightMode` hex ternary. The radial vignette + grid are drawn in luminance
 * (`--muted-foreground` at very low alpha), not hex. Before any matter exists,
 * the empty stage frames the map with a subtle graticule + contour ring so it
 * reads as *ready*, not hollow. `lightMode` is still forwarded to `DeckCanvas`
 * because that governs deck.gl scene rendering, not the chrome.
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
      {/* Page substrate — the design-system token named as the deck.gl backdrop. */}
      <div className="absolute inset-0 bg-background" />
      {/* Luminance vignette (cool-steel, very low alpha) — depth without chroma. */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, hsl(var(--muted-foreground) / 0.18) 0%, transparent 55%),
            radial-gradient(circle at 70% 60%, hsl(var(--muted-foreground) / 0.18) 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, hsl(var(--muted-foreground) / 0.18) 0%, transparent 35%)
          `,
        }}
      />
      {backgroundGridEnabled ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px)
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
        interactive={hasManifest}
      />
      {/* Awaiting matter: a graticule field + a centered contour frame so the
          empty stage reads as a survey console that is ready, not dead space. */}
      {!hasManifest ? (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--muted-foreground) / 0.05) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--muted-foreground) / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "120px 120px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-popover/40 px-8 py-6 text-center backdrop-blur-sm">
              <span className="text-label uppercase tracking-[0.2em] text-muted-foreground/70">
                Awaiting matter
              </span>
              <span className="text-data font-medium text-muted-foreground">
                Click Run to generate a map
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
