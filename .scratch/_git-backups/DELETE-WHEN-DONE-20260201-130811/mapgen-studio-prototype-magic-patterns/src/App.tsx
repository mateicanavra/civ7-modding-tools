import React, { useCallback, useMemo, Component } from 'react';
// ============================================================================
// APP
// ============================================================================
// Main application component.
// Orchestrates state management and renders the UI layout.
// Demonstrates fully controlled components with props-based options.
// ============================================================================
import {
  useThemePreference,
  createTheme,
  useGeneration,
  useViewState } from
'./hooks';
import { defaultConfig } from './data/defaultConfig';
import {
  DEFAULT_WORLD_SETTINGS,
  DEFAULT_RECIPE_SETTINGS,
  DEFAULT_RECIPE_OPTIONS,
  DEFAULT_PRESET_OPTIONS,
  DEFAULT_DATA_TYPE_OPTIONS,
  DEFAULT_RENDER_MODE_OPTIONS,
  DEFAULT_KNOB_OPTIONS,
  LAYOUT } from
'./constants';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { RecipePanel } from './components/RecipePanel';
import { ExplorePanel } from './components/ExplorePanel';
import { ToastProvider, useToast } from './components/ui';
import {
  deriveStagesFromConfig,
  deriveStepsFromStage,
  filterDataTypesForStep,
  applyConfigPatch } from
'./utils';
import type { ConfigPatch } from './types';
// Re-export types for external consumers
export type {
  RecipeSettings,
  WorldSettings,
  PipelineConfig,
  GenerationStatus,
  ConfigPatch,
  StageOption,
  StepOption,
  DataTypeOption,
  RenderModeOption } from
'./types';
// ============================================================================
// App Content (with toast access)
// ============================================================================
function AppContent() {
  // ==========================================================================
  // Theme
  // ==========================================================================
  const {
    preference: themePreference,
    isLightMode,
    cyclePreference
  } = useThemePreference();
  const theme = useMemo(() => createTheme(isLightMode), [isLightMode]);
  // ==========================================================================
  // Toast
  // ==========================================================================
  const { toast } = useToast();
  // ==========================================================================
  // Generation State
  // ==========================================================================
  const generation = useGeneration({
    initialConfig: defaultConfig,
    initialWorldSettings: DEFAULT_WORLD_SETTINGS,
    initialRecipeSettings: DEFAULT_RECIPE_SETTINGS,
    onGenerate: async (snapshot) => {
      console.log('Starting generation:', snapshot);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Generation complete');
    }
  });
  // ==========================================================================
  // View State
  // ==========================================================================
  const view = useViewState();
  // ==========================================================================
  // Derived Options (computed from config for host app demonstration)
  // ==========================================================================
  const stages = useMemo(
    () => deriveStagesFromConfig(generation.config),
    [generation.config]
  );
  const steps = useMemo(
    () => deriveStepsFromStage(generation.config, view.selectedStage),
    [generation.config, view.selectedStage]
  );
  const filteredDataTypes = useMemo(
    () =>
    filterDataTypesForStep(
      DEFAULT_DATA_TYPE_OPTIONS,
      steps,
      view.selectedStep
    ),
    [steps, view.selectedStep]
  );
  // ==========================================================================
  // Config Patch Handler (path-based updates)
  // ==========================================================================
  const handleConfigPatch = useCallback(
    (patch: ConfigPatch) => {
      const newConfig = applyConfigPatch(generation.config, patch);
      generation.setConfig(newConfig);
    },
    [generation]
  );
  const handleConfigReset = useCallback(() => {
    generation.reset(defaultConfig);
  }, [generation]);
  // ==========================================================================
  // Stage/Step Change Handlers
  // ==========================================================================
  const handleStageChange = useCallback(
    (stage: string) => {
      view.setSelectedStage(stage);
      // Auto-select first step of the new stage
      const newSteps = deriveStepsFromStage(generation.config, stage);
      if (newSteps.length > 0) {
        view.setSelectedStep(newSteps[0].value);
      }
    },
    [generation.config, view]
  );
  // ==========================================================================
  // Other Handlers
  // ==========================================================================
  const handleSave = useCallback(() => {
    console.log('Save preset:', {
      config: generation.config,
      recipeSettings: generation.recipeSettings
    });
    toast('Preset saved', {
      variant: 'success'
    });
  }, [generation.config, generation.recipeSettings, toast]);
  const handleFitView = useCallback(() => {
    console.log('Fit to view');
  }, []);
  const handleToast = useCallback(
    (message: string) => {
      toast(message, {
        variant: 'success'
      });
    },
    [toast]
  );
  // ==========================================================================
  // Layout
  // ==========================================================================
  const panelTop = LAYOUT.SPACING + LAYOUT.HEADER_HEIGHT + LAYOUT.SPACING;
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <div
      className={`relative w-full min-h-screen ${isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a12]'}`}>

      {/* Background visualization area */}
      <MapBackground isLightMode={isLightMode} showGrid={view.showGrid} />

      {/* Header */}
      <AppHeader
        isLightMode={isLightMode}
        themePreference={themePreference}
        onThemeCycle={cyclePreference}
        showGrid={view.showGrid}
        onShowGridChange={view.setShowGrid}
        globalSettings={generation.worldSettings}
        onGlobalSettingsChange={generation.setWorldSettings} />


      {/* Left Panel: Recipe Configuration */}
      <div
        className="absolute left-4 z-10"
        style={{
          top: panelTop
        }}>

        <RecipePanel
          config={generation.config}
          onConfigPatch={handleConfigPatch}
          onConfigReset={handleConfigReset}
          recipeOptions={[...DEFAULT_RECIPE_OPTIONS]}
          presetOptions={[...DEFAULT_PRESET_OPTIONS]}
          knobOptions={DEFAULT_KNOB_OPTIONS}
          theme={theme}
          lightMode={isLightMode}
          selectedStep={view.selectedStage}
          settings={generation.recipeSettings}
          onSettingsChange={generation.setRecipeSettings}
          onRun={generation.run}
          onSave={handleSave}
          isRunning={generation.isRunning}
          isDirty={generation.isDirty} />

      </div>

      {/* Right Panel: Step Explorer */}
      <div
        className="absolute right-4 z-10"
        style={{
          top: panelTop
        }}>

        <ExplorePanel
          stages={stages}
          selectedStage={view.selectedStage}
          onSelectedStageChange={handleStageChange}
          steps={steps}
          selectedStep={view.selectedStep}
          onSelectedStepChange={view.setSelectedStep}
          dataTypeOptions={filteredDataTypes}
          selectedDataType={view.selectedDataType}
          onSelectedDataTypeChange={view.setSelectedDataType}
          renderModeOptions={[...DEFAULT_RENDER_MODE_OPTIONS]}
          selectedRenderMode={view.selectedRenderMode}
          onSelectedRenderModeChange={view.setSelectedRenderMode}
          theme={theme}
          lightMode={isLightMode}
          showEdges={view.showEdges}
          onShowEdgesChange={view.setShowEdges}
          onFitView={handleFitView} />

      </div>

      {/* Footer: Status & Run Controls */}
      <AppFooter
        status={generation.status}
        lastRunSettings={generation.lastRunSnapshot.recipeSettings}
        lastGlobalSettings={generation.lastRunSnapshot.worldSettings}
        currentSettings={generation.recipeSettings}
        onSettingsChange={generation.setRecipeSettings}
        onRun={generation.run}
        onReroll={generation.reroll}
        isRunning={generation.isRunning}
        isDirty={generation.isDirty}
        lightMode={isLightMode}
        onToast={handleToast} />

    </div>);

}
// ============================================================================
// App Component (with providers)
// ============================================================================
export function App() {
  const { isLightMode } = useThemePreference();
  return (
    <ToastProvider lightMode={isLightMode}>
      <AppContent />
    </ToastProvider>);

}
// ============================================================================
// Map Background Component
// ============================================================================
interface MapBackgroundProps {
  isLightMode: boolean;
  showGrid: boolean;
}
function MapBackground({ isLightMode, showGrid }: MapBackgroundProps) {
  return (
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      {/* Gradient blobs to simulate map terrain */}
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, ${isLightMode ? '#cbd5e0' : '#2d3748'} 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, ${isLightMode ? '#cbd5e0' : '#2d3748'} 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, ${isLightMode ? '#cbd5e0' : '#2d3748'} 0%, transparent 30%)
          `
        }} />

      {/* Grid overlay */}
      {showGrid &&
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
              linear-gradient(${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.02)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.02)'} 1px, transparent 1px)
            `,
          backgroundSize: '50px 50px'
        }} />

      }
    </div>);

}