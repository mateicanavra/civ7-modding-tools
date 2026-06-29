import { type RefObject, useCallback, useEffect, useRef } from "react";

import { type DeckCanvasApi } from "../../features/viz/DeckCanvas";
import type { UseVizStateResult } from "../../features/viz/useVizState";

/**
 * The viz read-projection the autofit machinery consumes, BY VALUE: the active
 * bounds, the manifest (first-paint signal), and the effective layer (its
 * `spaceId` drives the per-space refit). Narrowed to exactly these members so
 * `useDeckAutofit` depends on the viz surface it reads, not the full handle.
 */
export type DeckAutofitVizHandle = Pick<
  UseVizStateResult,
  "activeBounds" | "manifest" | "effectiveLayer"
>;

export type UseDeckAutofitArgs = {
  /** Deck canvas handle (single owner: `useViewportLayout`); `.current.fitToBounds`. */
  deckApiRef: RefObject<DeckCanvasApi | null>;
  /** Measured viewport (from `useViewportLayout`); a resize re-arms the first-paint fit. */
  viewportSize: { width: number; height: number };
  /** Bumps when the deck API (re)mounts (from `useViewportLayout`); re-arms the fit. */
  deckApiReadyTick: number;
  /** The viz read-projection from `useVizSelection`, consumed by value. */
  viz: DeckAutofitVizHandle;
};

export type UseDeckAutofit = {
  /** On-demand "fit to view" action for the explore-panel button. */
  handleFitView: () => void;
};

/**
 * `useDeckAutofit` — the deck-camera auto-fit machinery (lifted AFTER
 * `useVizSelection`, since it consumes that hook's viz read-projection by value).
 *
 * It owns the ordered autofit pair and their guard refs, which MUST stay
 * co-located (architecture/10 §3.2a; LS-7):
 *  1. **per-space refit** — when the effective layer's `spaceId` changes (and
 *     bounds exist), fit once, guarded by `lastAutoFitSpaceRef`.
 *  2. **first-paint fit** — the first time a manifest + bounds + a mounted deck
 *     API coincide, fit once, guarded by `hasEverSeenVizManifestRef`; re-armed by
 *     `deckApiReadyTick`/`viewportSize` so a deck remount or resize re-fits.
 *
 * `handleFitView` is the on-demand button action (same fit, no guards).
 */
export function useDeckAutofit({
  deckApiRef,
  viewportSize,
  deckApiReadyTick,
  viz,
}: UseDeckAutofitArgs): UseDeckAutofit {
  const hasEverSeenVizManifestRef = useRef(false);
  const lastAutoFitSpaceRef = useRef<string | null>(null);

  useEffect(() => {
    const spaceId = viz.effectiveLayer?.spaceId ?? null;
    if (!spaceId) return;
    if (!viz.activeBounds) return;
    if (lastAutoFitSpaceRef.current === spaceId) return;
    lastAutoFitSpaceRef.current = spaceId;
    deckApiRef.current?.fitToBounds(viz.activeBounds);
  }, [viz.activeBounds, viz.effectiveLayer?.spaceId]);

  useEffect(() => {
    if (!viz.manifest) return;
    if (hasEverSeenVizManifestRef.current) return;
    if (!viz.activeBounds) return;
    const deckApi = deckApiRef.current;
    if (!deckApi) return;
    deckApi.fitToBounds(viz.activeBounds);
    hasEverSeenVizManifestRef.current = true;
  }, [deckApiReadyTick, viewportSize.height, viewportSize.width, viz.activeBounds, viz.manifest]);

  const handleFitView = useCallback(() => {
    if (!viz.activeBounds) return;
    deckApiRef.current?.fitToBounds(viz.activeBounds);
  }, [viz.activeBounds, deckApiRef]);

  return { handleFitView };
}
