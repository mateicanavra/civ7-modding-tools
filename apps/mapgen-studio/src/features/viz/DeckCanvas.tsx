import { Deck, OrthographicView, type OrthographicViewState } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DEFAULT_VIEW_STATE, type Bounds, type VizLayerEntryV0 } from './model';

function niceStep(target: number): number {
  const t = Math.max(1e-9, target);
  const pow = Math.pow(10, Math.floor(Math.log10(t)));
  const scaled = t / pow;
  if (scaled <= 1) return 1 * pow;
  if (scaled <= 2) return 2 * pow;
  if (scaled <= 5) return 5 * pow;
  return 10 * pow;
}

export type DeckCanvasApi = {
  fitToBounds(bounds: Bounds): void;
  resetView(): void;
};

export type DeckCanvasProps = {
  layers: Layer[];
  effectiveLayer: VizLayerEntryV0 | null;
  viewportSize: { width: number; height: number };
  showBackgroundGrid?: boolean;
  activeBounds: Bounds | null;
  apiRef?: MutableRefObject<DeckCanvasApi | null>;
};

export function DeckCanvas(props: DeckCanvasProps) {
  const { layers, effectiveLayer, viewportSize, showBackgroundGrid = true, activeBounds, apiRef } = props;

  // Using the core Deck instance avoids React-driven rerenders on every pointer interaction.
  // (The @deck.gl/react wrapper can schedule React updates during camera changes.)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deckRef = useRef<Deck<any> | null>(null);

  const views = useMemo(() => new OrthographicView({ id: 'ortho' }), []);

  const gridEnabled = useMemo(() => {
    if (!showBackgroundGrid) return false;
    if (!effectiveLayer) return false;
    if (!(effectiveLayer.kind === 'points' || effectiveLayer.kind === 'segments')) return false;
    if (effectiveLayer.meta?.showGrid === false) return false;
    return true;
  }, [effectiveLayer, showBackgroundGrid]);

  const gridParams = useMemo(() => {
    if (!gridEnabled) return null;
    if (!activeBounds) return null;

    // Make the grid world-anchored and independent of camera state.
    const [minX, minY, maxX, maxY] = activeBounds;
    const width = Math.max(1e-6, maxX - minX);
    const height = Math.max(1e-6, maxY - minY);

    const maxPoints = 1800;
    const minStepForBudget = Math.sqrt((width * height) / maxPoints);
    const baseStep = niceStep(width / 26);
    const step = niceStep(Math.max(baseStep, minStepForBudget));

    const x0 = Math.floor(minX / step) * step;
    const y0 = Math.floor(minY / step) * step;
    const x1 = Math.ceil(maxX / step) * step;
    const y1 = Math.ceil(maxY / step) * step;

    return { step, x0, y0, x1, y1 };
  }, [activeBounds, gridEnabled]);

  const gridLayer = useMemo(() => {
    if (!gridParams) return null;
    const { step, x0, y0, x1, y1 } = gridParams;
    const points: Array<{ x: number; y: number }> = [];
    const maxPoints = 1800;
    for (let y = y0; y <= y1; y += step) {
      for (let x = x0; x <= x1; x += step) {
        points.push({ x, y });
        if (points.length >= maxPoints) break;
      }
      if (points.length >= maxPoints) break;
    }

    return new ScatterplotLayer({
      id: 'bg.mesh.grid',
      data: points,
      getPosition: (d: any) => [d.x, d.y],
      getFillColor: [148, 163, 184, 55],
      radiusUnits: 'pixels',
      getRadius: 1.2,
      pickable: false,
    });
  }, [gridParams]);

  const deckLayers = useMemo<Layer[]>(() => [...(gridLayer ? [gridLayer] : []), ...layers], [gridLayer, layers]);

  const applyViewState = useCallback(
    (next: OrthographicViewState) => {
      const deck = deckRef.current as any;
      if (!deck) return;

      // deck.gl stores internal viewState when initialViewState is provided and no external viewState prop is used.
      // We update the internal mapping to allow programmatic "fit" without controlling camera during interactions.
      const viewId = 'ortho';
      deck.viewState = { ...(deck.viewState || {}), [viewId]: next };
      deck.viewManager?.setProps({ viewState: deck.viewState });
      deck.setProps({});
      deck.redraw(true);
    },
    []
  );

  const fitToBounds = useCallback(
    (bounds: Bounds) => {
      const [minX, minY, maxX, maxY] = bounds;
      const width = Math.max(1e-6, maxX - minX);
      const height = Math.max(1e-6, maxY - minY);
      const padding = 0.92;
      const scaleX = (viewportSize.width * padding) / width;
      const scaleY = (viewportSize.height * padding) / height;
      const scale = Math.min(scaleX, scaleY);
      const zoom = Math.log2(scale);
      const target: [number, number, number] = [(minX + maxX) / 2, (minY + maxY) / 2, 0];
      applyViewState({ target, zoom });
    },
    [applyViewState, viewportSize.height, viewportSize.width]
  );

  const resetView = useCallback(() => {
    fitToBounds([0, 0, 1, 1]);
  }, [fitToBounds]);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = { fitToBounds, resetView };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, fitToBounds, resetView]);

  // Preserve existing behavior: auto-fit when the effective layer bounds changes.
  useEffect(() => {
    if (!activeBounds) return;
    fitToBounds(activeBounds);
  }, [activeBounds, fitToBounds]);

  // Create + destroy the Deck instance.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cap device pixel ratio to avoid pathological buffer sizes on high-DPI displays.
    const useDevicePixels = Math.min(globalThis.devicePixelRatio ?? 1, 2);

    const deck = new Deck({
      canvas,
      views,
      controller: true,
      initialViewState: {
        target: [...DEFAULT_VIEW_STATE.target],
        zoom: DEFAULT_VIEW_STATE.zoom,
      },
      layers: deckLayers,
      useDevicePixels,
    });

    deckRef.current = deck;

    return () => {
      deck.finalize();
      deckRef.current = null;
    };
    // deckLayers intentionally excluded: we update via setProps below.
  }, [views]);

  // Keep layers in sync without remounting the Deck instance.
  useEffect(() => {
    deckRef.current?.setProps({ layers: deckLayers });
  }, [deckLayers]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
