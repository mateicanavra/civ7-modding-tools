import React, { useEffect, useMemo, useState } from 'react';
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
import { SchemaConfigForm } from '../../features/configOverrides/SchemaConfigForm';
import {
  formatMapConfigSaveDeployPhaseLabel,
  type MapConfigSaveDeployStatus,
} from '../../features/mapConfigSave/status';
import {
  Button,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose } from
'../../components/ui';
import { OptionSelect } from './OptionSelect';
import type {
  PipelineConfig,
  RecipeSettings,
  SelectOption } from
'../types';
// ============================================================================
// Props
// ============================================================================
export interface RecipePanelProps {
  /** Current pipeline configuration */
  config: PipelineConfig;
  /** Config schema (recipe artifacts) */
  configSchema: unknown;
  /** Path-based patch callback for efficient state updates */
  onConfigChange: (next: PipelineConfig) => void;
  /** Callback to reset config to defaults */
  onConfigReset: () => void;
  /** Available recipe options */
  recipeOptions: ReadonlyArray<SelectOption>;
  /** Available preset options */
  presetOptions: ReadonlyArray<SelectOption>;
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
  /** Whether generation is disabled by another Studio operation */
  isRunDisabled?: boolean;
  /** Whether config save/deploy is running */
  isSaveDeployRunning?: boolean;
  /** Current config save/deploy status */
  saveDeployStatus?: MapConfigSaveDeployStatus | null;
  /** Whether save actions are disabled by another Studio operation */
  isSaveDisabled?: boolean;
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
  configSchema,
  onConfigChange,
  onConfigReset,
  recipeOptions,
  presetOptions,
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
  isRunDisabled = false,
  isSaveDeployRunning = false,
  saveDeployStatus,
  isSaveDisabled = false,
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
  const saveActionDisabled = isSaveDisabled || isSaveDeployRunning;
  const runActionDisabled = isRunning || isRunDisabled || isSaveDeployRunning;
  const saveLabel = saveDeployStatus ? formatMapConfigSaveDeployPhaseLabel(saveDeployStatus.phase) : 'Save & Deploy Config';
  const saveTitle = isSaveDeployRunning ? `Save & Deploy Config: ${saveLabel}` : saveActionDisabled ? 'Save unavailable while another operation is running' : 'Save & Deploy Config';

  useEffect(() => {
    if (saveActionDisabled) setShowSaveMenu(false);
  }, [saveActionDisabled]);
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
  const focusPath = !showAllSteps && selectedStep ? [selectedStep] : null;
  // ==========================================================================
  // Handlers
  // ==========================================================================
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
  // Token-driven chrome; theme follows the single `.dark` class. The dock
  // floats over the deck.gl map, so it rides the `popover` tier; the sunken
  // section sits on `surface-sunken`.
  const panelBg = 'bg-popover/95';
  const panelBorder = 'border-border';
  const sectionBg = 'bg-surface-sunken/80';
  const textPrimary = 'text-foreground';
  const textSecondary = 'text-muted-foreground';
  const textMuted = 'text-muted-foreground/70';
  const borderColor = 'border-border';
  const borderSubtle = 'border-border-subtle';
  const hoverBg = 'hover:bg-accent';
  const iconBtn = 'h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent';
  const iconBtnActive = 'h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-foreground bg-muted';
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
            aria-expanded={!recipeCollapsed}
            aria-controls="recipe-panel-recipe-section"
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${hoverBg}`}>

            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${textSecondary}`} aria-hidden="true" />
              <span className={`text-[13px] font-semibold ${textPrimary}`}>
                Recipe
              </span>
            </div>
            {isDirty &&
            <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
                Modified
              </span>
            }
          </button>
        </div>

        {/* Recipe & Preset Selection */}
        {!recipeCollapsed &&
        <div
          id="recipe-panel-recipe-section"
          className={`flex-shrink-0 px-3 py-3 space-y-2 border-b ${borderSubtle}`}>

          <div className="flex items-center gap-3">
            <span
              className={`text-label font-medium uppercase tracking-wider w-14 shrink-0 ${textMuted}`}>

              Recipe
            </span>
            <OptionSelect
              value={settings.recipe}
              onValueChange={(value) => updateSetting('recipe', value)}
              ariaLabel="Recipe"
              options={recipeOptions.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
              className="flex-1" />

          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-label font-medium uppercase tracking-wider w-14 shrink-0 ${textMuted}`}>

              Config
            </span>
            <OptionSelect
              value={settings.preset}
              onValueChange={(value) => updateSetting('preset', value)}
              ariaLabel="Config"
              options={presetOptions.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
              className="flex-1" />

          </div>
        </div>
        }

        {/* Config Section Header */}
        <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={!configCollapsed}
            aria-controls="recipe-panel-config-section"
            onClick={() => setConfigCollapsed(!configCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setConfigCollapsed(!configCollapsed);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer ${hoverBg}`}>

            <div className="flex items-center gap-2 min-w-0">
              <Settings className={`w-4 h-4 shrink-0 ${textSecondary}`} aria-hidden="true" />
              <span className={`text-[13px] font-semibold ${textPrimary}`}>
                Config
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}>

                <span
                  className={`text-[9px] font-medium uppercase tracking-wider ${overridesDisabled ? 'text-primary' : textMuted}`}>

                  On
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch
                      checked={!overridesDisabled}
                      onCheckedChange={(checked) => setOverridesDisabled(!checked)}
                      aria-label={overridesDisabled ? "Enable Overrides" : "Disable Overrides"} />
                  </TooltipTrigger>
                  <TooltipContent>{overridesDisabled ? 'Enable Overrides' : 'Disable Overrides'}</TooltipContent>
                </Tooltip>

              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllSteps(!showAllSteps);
                    }}
                    aria-label={showAllSteps ? "Focus Current Step" : "Show All Steps"}
                    aria-pressed={showAllSteps}
                    className={!showAllSteps ? iconBtnActive : iconBtn}>

                    <Focus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{showAllSteps ? 'Focus Current Step' : 'Show All Steps'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Config Content */}
        {!configCollapsed &&
        <div id="recipe-panel-config-section" className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Config Actions */}
            <div
            className={`px-3 py-2 flex items-center gap-2 ${overridesDisabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>

              <div className="flex-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  aria-label="Reset Config to Defaults"
                  className={iconBtn}>

                    <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reset to Defaults</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  aria-label={showJson ? "Show Form View" : "Show JSON View"}
                  aria-pressed={showJson}
                  className={showJson ? iconBtnActive : iconBtn}>

                    <Braces className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{showJson ? 'Show Form View' : 'Show JSON View'}</TooltipContent>
              </Tooltip>
            </div>

            {/* Config Form / JSON */}
            <div
            className={`px-3 pb-3 ${overridesDisabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>

              {showJson ?
            <div className="border border-border-subtle rounded p-2.5 max-h-[240px] overflow-auto bg-surface-sunken">

                  <pre
                className={`text-label font-mono leading-relaxed ${textMuted} whitespace-pre-wrap break-all`}>

                    {JSON.stringify(filteredConfig, null, 2)}
                  </pre>
                </div> :

            <SchemaConfigForm
              schema={configSchema}
              value={config}
              focusPath={focusPath}
              disabled={overridesDisabled}
              onChange={(next) => onConfigChange(next)}
            />

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
              disabled={runActionDisabled}
              className={`flex-1 ${isDirty ? 'ring-1 ring-ring border-primary' : ''} ${isRunning || isSaveDeployRunning ? 'opacity-70 cursor-wait' : ''}`}>

              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isRunning ? 'Running…' : 'Run'}</span>
            </Button>

            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (saveActionDisabled) return;
                      setShowSaveMenu(!showSaveMenu);
                    }}
                    disabled={saveActionDisabled}
                    aria-label="Save & Deploy Config"
                    aria-haspopup="menu"
                    aria-expanded={showSaveMenu}
                    className={`h-8 w-8 ${isSaveDeployRunning ? 'opacity-70 cursor-wait' : ''}`}>

                    <Save className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{saveTitle}</TooltipContent>
              </Tooltip>

              {showSaveMenu &&
              <>
                  <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close Save Config Menu"
                  onClick={() => setShowSaveMenu(false)} />

                  <div
                  className={`absolute bottom-full right-0 mb-1 w-36 rounded-lg border shadow-lg z-50 ${panelBg} ${panelBorder}`}>

                    <button
                    type="button"
                    onClick={() => {
                      onSaveToCurrent();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-data ${textPrimary} ${hoverBg} rounded-t-lg`}>

                      Save & Deploy
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                      onSaveAsNew();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-data ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Save & Deploy As…
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                      onExportPreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-data ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Export…
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                      onImportPreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-data ${textPrimary} ${hoverBg} border-t ${borderSubtle}`}>

                      Import…
                    </button>
                    {canDeletePreset &&
                    <button
                    type="button"
                    onClick={() => {
                      onDeletePreset();
                      setShowSaveMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-data text-destructive ${hoverBg} rounded-b-lg border-t ${borderSubtle}`}>

                        Delete Scratch
                      </button>
                    }
                    {!canDeletePreset &&
                    <div className={`w-full text-left px-3 py-2 text-data ${textMuted} rounded-b-lg border-t ${borderSubtle}`}>
                        Delete Scratch
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
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              Reset Config
            </DialogTitle>
            <DialogDescription>
              This will reset all config overrides to their default values.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                onConfigReset();
                setShowResetModal(false);
              }}>

              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);

};
