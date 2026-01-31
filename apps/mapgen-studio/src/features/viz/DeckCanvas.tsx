import { OrthographicView } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const views = useMemo(() => new OrthographicView({ id: 'ortho' }), []);

  const [viewState, setViewState] = useState<any>(() => ({ ...DEFAULT_VIEW_STATE }));

  const onViewStateChange = useCallback(({ viewState }: { viewState: any }) => {
    // Keep view state local to the canvas so pointer interactions don't re-render the whole app.
    setViewState(viewState);
  }, []);

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
      setViewState((prev: any) => ({ ...prev, target, zoom }));
    },
    [viewportSize.height, viewportSize.width]
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

  const gridEnabled = useMemo(() => {
    if (!showBackgroundGrid) return false;
    if (!effectiveLayer) return false;
    if (!(effectiveLayer.kind === 'points' || effectiveLayer.kind === 'segments')) return false;
    if (effectiveLayer.layerId.startsWith('foundation.plateTopology.')) return false;
    return true;
  }, [effectiveLayer, showBackgroundGrid]);

  // Compute lightweight grid params each render; only rebuild the points array when params actually change.
  const gridParams = useMemo(() => {
    if (!gridEnabled) return null;
    const zoom = typeof viewState?.zoom === 'number' ? viewState.zoom : 0;
    const scale = Math.pow(2, zoom);
    const worldWidth = viewportSize.width / Math.max(1e-6, scale);
    const worldHeight = viewportSize.height / Math.max(1e-6, scale);

    const tx = Array.isArray(viewState?.target) ? Number(viewState.target[0]) : 0;
    const ty = Array.isArray(viewState?.target) ? Number(viewState.target[1]) : 0;
    const minX = tx - worldWidth / 2;
    const maxX = tx + worldWidth / 2;
    const minY = ty - worldHeight / 2;
    const maxY = ty + worldHeight / 2;

    const step = niceStep(worldWidth / 26);
    const x0 = Math.floor(minX / step) * step;
    const y0 = Math.floor(minY / step) * step;
    const x1 = Math.ceil(maxX / step) * step;
    const y1 = Math.ceil(maxY / step) * step;

    return { step, x0, y0, x1, y1 };
  }, [gridEnabled, viewportSize.height, viewportSize.width, viewState?.target, viewState?.zoom]);

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

  return (
    <DeckGL
      views={views}
      controller={true}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      layers={deckLayers}
    />
  );
}
