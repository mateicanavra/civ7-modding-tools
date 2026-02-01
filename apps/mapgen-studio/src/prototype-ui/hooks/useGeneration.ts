// ============================================================================
// GENERATION HOOK
// ============================================================================
// Manages generation state and actions.
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type {
  PipelineConfig,
  WorldSettings,
  RecipeSettings,
  GenerationStatus } from
'../types';
import {
  configsEqual,
  worldSettingsEqual,
  recipeSettingsEqual,
  generateSeed } from
'../utils';

export interface GenerationSnapshot {
  config: PipelineConfig;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
}

export interface UseGenerationOptions {
  initialConfig: PipelineConfig;
  initialWorldSettings: WorldSettings;
  initialRecipeSettings: RecipeSettings;
  /** Called when generation starts. Implement actual API call here. */
  onGenerate?: (snapshot: GenerationSnapshot) => Promise<void>;
}

export interface UseGenerationReturn {
  // Current state
  status: GenerationStatus;
  config: PipelineConfig;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;

  // Last run state (for comparison)
  lastRunSnapshot: GenerationSnapshot;

  // Derived state
  isDirty: boolean;
  isRunning: boolean;

  // Actions
  setConfig: (config: PipelineConfig) => void;
  setWorldSettings: (settings: WorldSettings) => void;
  setRecipeSettings: (settings: RecipeSettings) => void;

  // Generation actions
  run: () => Promise<void>;
  reroll: () => Promise<void>;
  reset: (defaultConfig: PipelineConfig) => void;
}

export function useGeneration(
options: UseGenerationOptions)
: UseGenerationReturn {
  const {
    initialConfig,
    initialWorldSettings,
    initialRecipeSettings,
    onGenerate
  } = options;

  // Current state
  const [status, setStatus] = useState<GenerationStatus>('ready');
  const [config, setConfig] = useState<PipelineConfig>(initialConfig);
  const [worldSettings, setWorldSettings] =
  useState<WorldSettings>(initialWorldSettings);
  const [recipeSettings, setRecipeSettings] = useState<RecipeSettings>(
    initialRecipeSettings
  );

  // Last run snapshot
  const [lastRunSnapshot, setLastRunSnapshot] = useState<GenerationSnapshot>({
    config: initialConfig,
    worldSettings: initialWorldSettings,
    recipeSettings: initialRecipeSettings
  });

  // Derived state
  const isDirty = useMemo(() => {
    return (
      !configsEqual(config, lastRunSnapshot.config) ||
      !worldSettingsEqual(worldSettings, lastRunSnapshot.worldSettings) ||
      !recipeSettingsEqual(recipeSettings, lastRunSnapshot.recipeSettings));

  }, [config, worldSettings, recipeSettings, lastRunSnapshot]);

  const isRunning = status === 'running';

  // Run generation with current settings
  const run = useCallback(async () => {
    const snapshot: GenerationSnapshot = {
      config: { ...config },
      worldSettings: { ...worldSettings },
      recipeSettings: { ...recipeSettings }
    };

    setLastRunSnapshot(snapshot);
    setStatus('running');

    try {
      if (onGenerate) {
        await onGenerate(snapshot);
      } else {
        // Default: simulate generation delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setStatus('ready');
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('error');
    }
  }, [config, worldSettings, recipeSettings, onGenerate]);

  // Reroll: generate new seed and run
  const reroll = useCallback(async () => {
    const newSeed = generateSeed();
    const newRecipeSettings = { ...recipeSettings, seed: newSeed };

    setRecipeSettings(newRecipeSettings);

    const snapshot: GenerationSnapshot = {
      config: { ...config },
      worldSettings: { ...worldSettings },
      recipeSettings: newRecipeSettings
    };

    setLastRunSnapshot(snapshot);
    setStatus('running');

    try {
      if (onGenerate) {
        await onGenerate(snapshot);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setStatus('ready');
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('error');
    }
  }, [config, worldSettings, recipeSettings, onGenerate]);

  // Reset config to defaults
  const reset = useCallback((defaultConfig: PipelineConfig) => {
    setConfig(defaultConfig);
  }, []);

  return {
    status,
    config,
    worldSettings,
    recipeSettings,
    lastRunSnapshot,
    isDirty,
    isRunning,
    setConfig,
    setWorldSettings,
    setRecipeSettings,
    run,
    reroll,
    reset
  };
}