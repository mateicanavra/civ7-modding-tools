import React, { useMemo, useState } from 'react';
// ============================================================================
// RECIPE PANEL
// ============================================================================
// Left sidebar for recipe selection and pipeline configuration.
// Fully controlled component - all options passed via props.
// Uses path-based patching for efficient state updates.
// ============================================================================
import {
  Eraser,
  Braces,
  BookOpen,
  Focus,
  Settings,
  Save,
  Play } from
'lucide-react';
import { ConfigForm } from './ConfigForm';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  Select,
  Switch } from
'./ui';
import type {
  PipelineConfig,
  Theme,
  RecipeSettings,
  ConfigPatch,
  SelectOption,
  KnobOptionsMap } from
'../types';
// ============================================================================
// Props
// ============================================================================
export interface RecipePanelProps {
  /** Current pipeline configuration */
  config: PipelineConfig;
  /** Path-based patch callback for efficient state updates */
  onConfigPatch: (patch: ConfigPatch) => void;
  /** Callback to reset config to defaults */
  onConfigReset: () => void;
  /** Available recipe options */
  recipeOptions: ReadonlyArray<SelectOption>;
  /** Available preset options */
  presetOptions: ReadonlyArray<SelectOption>;
  /** Knob options mapping (knob name → available values) */
  knobOptions?: KnobOptionsMap;
  /** Optional stageId -> label mapping (for author-friendly stage names) */
  stageLabels?: Record<string, string>;
  /** Theme object (kept for API compatibility) */
  theme: Theme;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Currently selected step (for focus mode) */
  selectedStep: string;
  /** Current recipe settings */
  settings: RecipeSettings;
  /** Callback when recipe settings change */
  onSettingsChange: (settings: RecipeSettings) => void;
  /** Callback to start generation */
  onRun: () => void;
  /** Callback to save preset to current */
  onSaveToCurrent: () => void;
  /** Callback to save preset as new */
  onSaveAsNew: () => void;
  /** Callback to import preset */
  onImportPreset: () => void;
  /** Callback to export preset */
  onExportPreset: () => void;
  /** Callback to delete preset */
  onDeletePreset: () => void;
  /** Whether delete is available */
  canDeletePreset?: boolean;
  /** Whether generation is running */
  isRunning: boolean;
  /** Whether settings have changed since last run */
  isDirty: boolean;
  /** Whether config overrides are disabled (optional controlled mode) */
  overridesDisabled?: boolean;
  /** Callback when overrides disabled changes (optional controlled mode) */
  onOverridesDisabledChange?: (disabled: boolean) => void;
  /** Whether the recipe section is collapsed (optional controlled mode) */
  recipeCollapsed?: boolean;
  /** Callback when recipe collapsed changes (optional controlled mode) */
  onRecipeCollapsedChange?: (collapsed: boolean) => void;
  /** Whether the config section is collapsed (optional controlled mode) */
  configCollapsed?: boolean;
  /** Callback when config collapsed changes (optional controlled mode) */
  onConfigCollapsedChange?: (collapsed: boolean) => void;
}
// ============================================================================
// Main Component
// ============================================================================
export const RecipePanel: React.FC<RecipePanelProps> = ({
  config,
  onConfigPatch,
  onConfigReset,
  recipeOptions,
  presetOptions,
  knobOptions,
  stageLabels,
  theme,
  lightMode,
  selectedStep,
  settings,
  onSettingsChange,
  onRun,
  onSaveToCurrent,
  onSaveAsNew,
  onImportPreset,
  onExportPreset,
  onDeletePreset,
  canDeletePreset = false,
  isRunning,
  isDirty,
  overridesDisabled: overridesDisabledProp,
  onOverridesDisabledChange,
  recipeCollapsed: recipeCollapsedProp,
  onRecipeCollapsedChange,
  configCollapsed: configCollapsedProp,
  onConfigCollapsedChange
}) => {
  // ==========================================================================
  // Local State
  // ==========================================================================
  const [localRecipeCollapsed, setLocalRecipeCollapsed] = useState(false);
  const [localConfigCollapsed, setLocalConfigCollapsed] = useState(false);
  const [localOverridesDisabled, setLocalOverridesDisabled] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  const overridesDisabled = overridesDisabledProp ?? localOverridesDisabled;
  const setOverridesDisabled = (next: boolean) => {
    onOverridesDisabledChange?.(next);
    if (overridesDisabledProp === undefined) setLocalOverridesDisabled(next);
  };
  const recipeCollapsed = recipeCollapsedProp ?? localRecipeCollapsed;
  const setRecipeCollapsed = (next: boolean) => {
    onRecipeCollapsedChange?.(next);
    if (recipeCollapsedProp === undefined) setLocalRecipeCollapsed(next);
  };
  const configCollapsed = configCollapsedProp ?? localConfigCollapsed;
  const setConfigCollapsed = (next: boolean) => {
    onConfigCollapsedChange?.(next);
    if (configCollapsedProp === undefined) setLocalConfigCollapsed(next);
  };
  // ==========================================================================
  // Derived State
  // ==========================================================================
  const filteredConfig = useMemo(() => {
    if (showAllSteps || !selectedStep) return config;
    if (config[selectedStep])
    return {
      [selectedStep]: config[selectedStep]
    };
    return config;
  }, [config, selectedStep, showAllSteps]);
  // In focus mode (single step), auto-expand to depth 3
  const autoExpandDepth = !showAllSteps ? 3 : 0;
  // ==========================================================================
  // Handlers
  // ==========================================================================
  const handleConfigPatch = (patch: ConfigPatch) => {
    // If in filtered mode, patches still use full paths
    onConfigPatch(patch);
  };
  const updateSetting = <K extends keyof RecipeSettings,>(
  key: K,
  value: RecipeSettings[K]) =>
  {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };
  // ==========================================================================
  // Styles
  // ==========================================================================
  const panelBg = lightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const sectionBg = lightMode ? 'bg-gray-50/80' : 'bg-[#0f0f12]/80';
  const textPrimary = lightMode ? 'text-[#1f2937]' : 'text-[#e8e8ed]';
  const textSecondary = lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const borderColor = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const borderSubtle = lightMode ? 'border-gray-100' : 'border-[#222228]';
  const hoverBg = lightMode ? 'hover:bg-gray-50' : 'hover:bg-[#1a1a1f]';
  const iconBtn = `h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 ${lightMode ? 'text-[#6b7280] hover:text-[#1f2937] hover:bg-gray-100' : 'text-[#8a8a96] hover:text-[#e8e8ed] hover:bg-[#1a1a1f]'}`;
  const iconBtnActive = `h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 ${lightMode ? 'text-[#1f2937] bg-gray-200' : 'text-[#e8e8ed] bg-[#222228]'}`;
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <>
      <div
        className={`flex flex-col w-[280px] max-h-[calc(100vh-180px)] rounded-lg border overflow-hidden shadow-lg backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Header */}
        <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
          <button
            type="button"
            onClick={() => setRecipeCollapsed(!recipeCollapsed)}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${hoverBg}`}>

            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              <span className={`text-[13px] font-semibold ${textPrimary}`}>
                Recipe
              </span>
            </div>
            {isDirty &&
            <span className="text-[9px] font-medium uppercase tracking-wider text-orange-500">
                Modified
              </span>
            }
          </button>
        </div>

        {/* Recipe & Preset Selection */}
        {!recipeCollapsed &&
        <div
          className={`flex-shrink-0 px-3 py-3 space-y-2 border-b ${borderSubtle}`}>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-medium uppercase tracking-wider w-14 shrink-0 ${textMuted}`}>

              Recipe
            </span>
            <Select
              value={settings.recipe}
              onChange={(e) => updateSetting('recipe', e.target.value)}
              options={recipeOptions.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
              lightMode={lightMode}
              className="flex-1" />

          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-medium uppercase tracking-wider w-14 shrink-0 ${textMuted}`}>

              Preset
            </span>
            <Select
              value={settings.preset}
              onChange={(e) => updateSetting('preset', e.target.value)}
              options={presetOptions.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
              lightMode={lightMode}
              className="flex-1" />

          </div>
        </div>
        }

        {/* Config Section Header */}
        <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setConfigCollapsed(!configCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setConfigCollapsed(!configCollapsed);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer ${hoverBg}`}>

            <div className="flex items-center gap-2 min-w-0">
              <Settings className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              <span className={`text-[13px] font-semibold ${textPrimary}`}>
                Config
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}>

                <span
                  className={`text-[9px] font-medium uppercase tracking-wider ${overridesDisabled ? 'text-orange-500' : textMuted}`}>

                  On
                </span>
                <Switch
                  checked={!overridesDisabled}
                  onCheckedChange={(checked) => setOverridesDisabled(!checked)}
                  lightMode={lightMode}
                  title={overridesDisabled ? 'Enable overrides' : 'Disable overrides'} />

              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllSteps(!showAllSteps);
                }}
                title={
                showAllSteps ? 'Focus current step' : 'Show all steps'
                }
                className={!showAllSteps ? iconBtnActive : iconBtn}>

                <Focus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Config Content */}
        {!configCollapsed &&
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Config Actions */}
            <div
            className={`px-3 py-2 flex items-center gap-2 ${overridesDisabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>

              <div className="flex-1" />

              <button
              onClick={() => setShowResetModal(true)}
              title="Reset to defaults"
              className={iconBtn}>

                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
              onClick={() => setShowJson(!showJson)}
              title={showJson ? 'Show form view' : 'Show JSON view'}
              className={showJson ? iconBtnActive : iconBtn}>

                <Braces className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Config Form / JSON */}
            <div
            className={`px-3 pb-3 ${overridesDisabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>

              {showJson ?
            <div
              className={`border rounded p-2.5 max-h-[240px] overflow-auto ${lightMode ? 'bg-gray-50 border-gray-100' : 'bg-[#0f0f12] border-[#222228]'}`}>

                  <pre
                className={`text-[10px] font-mono leading-relaxed ${textMuted} whitespace-pre-wrap break-all`}>

                    {JSON.stringify(filteredConfig, null, 2)}
                  </pre>
                </div> :

            <ConfigForm
              config={filteredConfig}
              onConfigPatch={handleConfigPatch}
              knobOptions={knobOptions}
              theme={theme}
              lightMode={lightMode}
              autoExpandDepth={autoExpandDepth}
              stageLabels={stageLabels} />

            }
            </div>
          </div>
        }

        {/* Footer */}
        <div
          className={`flex-shrink-0 px-3 py-2.5 border-t ${borderColor} ${sectionBg}`}>

          <div className="flex items-center gap-2">
            <Button
              onClick={onRun}
              disabled={isRunning}
              className={`flex-1 ${isDirty ? 'ring-2 ring-orange-400/50 border-orange-400' : ''} ${isRunning ? 'opacity-70 cursor-wait' : ''}`}>

              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSaveMenu(!showSaveMenu)}
                title="Save preset"
                className="h-8 w-8">

                <Save className="w-4 h-4" />
              </Button>

              {showSaveMenu &&
              <>
                  <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSaveMenu(false)} />

                  <div
                  className={`absolute bottom-full right-0 mb-1 w-36 rounded-lg border shadow-lg z-50 ${panelBg} ${panelBorder}`}>

                    <button
                    onClick={() => {
                      onSaveToCurrent();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] ${textPrimary} ${hoverBg} rounded-t-lg`}>

                      Save to Current
                    </button>
                    <button
                    onClick={() => {
                      onSaveAsNew();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Save as New...
                    </button>
                    <button
                    onClick={() => {
                      onExportPreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Export...
                    </button>
                    <button
                    onClick={() => {
                      onImportPreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Import...
                    </button>
                    {canDeletePreset &&
                    <button
                    onClick={() => {
                      onDeletePreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] text-red-600 ${hoverBg} rounded-b-lg border-t ${borderSubtle}`}>

                        Delete Preset
                      </button>
                    }
                    {!canDeletePreset &&
                    <div className={`w-full text-left px-3 py-2 text-[11px] ${textMuted} rounded-b-lg border-t ${borderSubtle}`}>
                        Delete Preset (local only)
                      </div>
                    }
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog
        open={showResetModal}
        onOpenChange={setShowResetModal}
        lightMode={lightMode}>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle icon={<Eraser className="w-4 h-4" />}>
              Reset Config
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all config overrides to their default values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfigReset}
              className="bg-red-500 hover:bg-red-600 border-red-600">

              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

};
