// ============================================================================
// VIEW STATE HOOK
// ============================================================================
// Manages visualization preferences and selected step.
// Renamed: layer → dataType, projection → renderMode
// ============================================================================

import { useState, useCallback } from 'react';
import type { ViewState } from '../types';
import { DEFAULT_VIEW_STATE } from '../constants';

export interface UseViewStateOptions {
  initialState?: Partial<ViewState>;
}

export interface UseViewStateReturn extends ViewState {
  // Actions
  setShowEdges: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setSelectedStage: (stage: string) => void;
  setSelectedStep: (step: string) => void;
  setSelectedDataType: (dataType: string) => void;
  setSelectedRenderMode: (renderMode: string) => void;
  toggleEdges: () => void;
  toggleGrid: () => void;
  resetView: () => void;
}

export function useViewState(
options: UseViewStateOptions = {})
: UseViewStateReturn {
  const initialState: ViewState = {
    ...DEFAULT_VIEW_STATE,
    ...options.initialState
  };

  const [showEdges, setShowEdges] = useState(initialState.showEdges);
  const [showGrid, setShowGrid] = useState(initialState.showGrid);
  const [selectedStage, setSelectedStage] = useState(initialState.selectedStage);
  const [selectedStep, setSelectedStep] = useState(initialState.selectedStep);
  const [selectedDataType, setSelectedDataType] = useState(
    initialState.selectedDataType
  );
  const [selectedRenderMode, setSelectedRenderMode] = useState(
    initialState.selectedRenderMode
  );

  const toggleEdges = useCallback(() => setShowEdges((prev) => !prev), []);
  const toggleGrid = useCallback(() => setShowGrid((prev) => !prev), []);

  const resetView = useCallback(() => {
    setShowEdges(DEFAULT_VIEW_STATE.showEdges);
    setShowGrid(DEFAULT_VIEW_STATE.showGrid);
    setSelectedStage(DEFAULT_VIEW_STATE.selectedStage);
    setSelectedStep(DEFAULT_VIEW_STATE.selectedStep);
    setSelectedDataType(DEFAULT_VIEW_STATE.selectedDataType);
    setSelectedRenderMode(DEFAULT_VIEW_STATE.selectedRenderMode);
  }, []);

  return {
    showEdges,
    showGrid,
    selectedStage,
    selectedStep,
    selectedDataType,
    selectedRenderMode,
    setShowEdges,
    setShowGrid,
    setSelectedStage,
    setSelectedStep,
    setSelectedDataType,
    setSelectedRenderMode,
    toggleEdges,
    toggleGrid,
    resetView
  };
}