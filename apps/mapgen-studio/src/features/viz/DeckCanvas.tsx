import { Deck, OrthographicView, type OrthographicViewState } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';
import { LineLayer } from '@deck.gl/layers';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
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
  lightMode?: boolean;
  activeBounds: Bounds | null;
  apiRef?: MutableRefObject<DeckCanvasApi | null>;
};

export function DeckCanvas(props: DeckCanvasProps) {
  const { layers, effectiveLayer, viewportSize, showBackgroundGrid = true, lightMode = false, activeBounds, apiRef } = props;

  // Using the core Deck instance avoids React-driven rerenders on every pointer interaction.
  // (The @deck.gl/react wrapper can schedule React updates during camera changes.)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deckRef = useRef<Deck<any> | null>(null);
  const [deckEpoch, bumpDeckEpoch] = useReducer((x: number) => x + 1, 0);

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

    const maxLines = 120;
    const minStepForBudget = Math.max(width / maxLines, height / maxLines);
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
    const segments: Array<{ source: [number, number]; target: [number, number] }> = [];
    const maxSegments = 600;

    for (let x = x0; x <= x1; x += step) {
      segments.push({ source: [x, y0], target: [x, y1] });
      if (segments.length >= maxSegments) break;
    }
    if (segments.length < maxSegments) {
      for (let y = y0; y <= y1; y += step) {
        segments.push({ source: [x0, y], target: [x1, y] });
        if (segments.length >= maxSegments) break;
      }
    }

    const gridColor: [number, number, number, number] = lightMode ? [0, 0, 0, 16] : [255, 255, 255, 12];

    return new LineLayer({
      id: 'bg.mesh.grid',
      data: segments,
      getSourcePosition: (d: any) => d.source,
      getTargetPosition: (d: any) => d.target,
      getColor: gridColor,
      getWidth: 1,
      widthUnits: 'pixels',
      pickable: false,
    });
  }, [gridParams, lightMode]);

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
    if (!deckRef.current) return;
    fitToBounds(activeBounds);
  }, [activeBounds, deckEpoch, fitToBounds]);

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
    bumpDeckEpoch();

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

  // Keep Deck's internal canvas size in sync with the measured container size.
  // This avoids relying on implicit resize behavior and prevents blurry/incorrect scaling after layout changes.
  useEffect(() => {
    deckRef.current?.setProps({ width: viewportSize.width, height: viewportSize.height });
  }, [viewportSize.height, viewportSize.width]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
