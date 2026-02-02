import React, { useEffect, useState } from 'react';
// ============================================================================
// EXPLORE PANEL
// ============================================================================
// Stage selector, step list, data type list, and view controls.
// Fully controlled component - all options passed via props.
// Renamed: layer → dataType, projection → renderMode
// ============================================================================
import {
  Compass,
  GitBranch,
  ChevronDown,
  Maximize,
  Layers,
  SquareStack,
  Hexagon,
  CircleDot,
  Activity,
  Flame } from
'lucide-react';
import type {
  Theme,
  StageOption,
  StepOption,
  DataTypeOption,
  RenderModeOption } from
'../types';
// ============================================================================
// Props
// ============================================================================
export interface ExplorePanelProps {
  /** Available stages to select from */
  stages: StageOption[];
  /** Currently selected stage */
  selectedStage: string;
  /** Callback when stage selection changes */
  onSelectedStageChange: (stage: string) => void;
  /** Available steps for the current stage */
  steps: StepOption[];
  /** Currently selected step */
  selectedStep: string;
  /** Callback when step selection changes */
  onSelectedStepChange: (step: string) => void;
  /** Available data types (formerly "layers") */
  dataTypeOptions: DataTypeOption[];
  /** Currently selected data type */
  selectedDataType: string;
  /** Callback when data type selection changes */
  onSelectedDataTypeChange: (dataType: string) => void;
  /** Available render modes (formerly "projections") */
  renderModeOptions: RenderModeOption[];
  /** Currently selected render mode */
  selectedRenderMode: string;
  /** Callback when render mode selection changes */
  onSelectedRenderModeChange: (renderMode: string) => void;
  /** Theme object (kept for API compatibility) */
  theme: Theme;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Whether to show edge visualization */
  showEdges: boolean;
  /** Callback when edge visibility changes */
  onShowEdgesChange: (show: boolean) => void;
  /** Callback when fit view is requested */
  onFitView: () => void;
  /** Whether the stage list is expanded (optional controlled mode) */
  stageExpanded?: boolean;
  /** Callback when stageExpanded changes (optional controlled mode) */
  onStageExpandedChange?: (expanded: boolean) => void;
}
// ============================================================================
// Component
// ============================================================================
export const ExplorePanel: React.FC<ExplorePanelProps> = ({
  stages,
  selectedStage,
  onSelectedStageChange,
  steps,
  selectedStep,
  onSelectedStepChange,
  dataTypeOptions,
  selectedDataType,
  onSelectedDataTypeChange,
  renderModeOptions,
  selectedRenderMode,
  onSelectedRenderModeChange,
  lightMode,
  showEdges,
  onShowEdgesChange,
  onFitView,
  stageExpanded: stageExpandedProp,
  onStageExpandedChange
}) => {
  const [localStageExpanded, setLocalStageExpanded] = useState(true);
  const isStageExpanded = stageExpandedProp ?? localStageExpanded;
  const setIsStageExpanded = (next: boolean) => {
    onStageExpandedChange?.(next);
    if (stageExpandedProp === undefined) setLocalStageExpanded(next);
  };
  const currentStageIndex = stages.findIndex((s) => s.value === selectedStage);
  const currentStage = stages[currentStageIndex];
  // Auto-select data type when only one is available
  useEffect(() => {
    if (
    dataTypeOptions.length === 1 &&
    selectedDataType !== dataTypeOptions[0].value)
    {
      onSelectedDataTypeChange(dataTypeOptions[0].value);
    }
  }, [dataTypeOptions, selectedDataType, onSelectedDataTypeChange]);
  // ==========================================================================
  // Handlers
  // ==========================================================================
  const handleSelectStage = (stageValue: string) => {
    onSelectedStageChange(stageValue);
    setIsStageExpanded(false);
  };
  // ==========================================================================
  // Styles
  // ==========================================================================
  const panelBg = lightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const textPrimary = lightMode ? 'text-[#1f2937]' : 'text-[#e8e8ed]';
  const textSecondary = lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const borderSubtle = lightMode ? 'border-gray-100' : 'border-[#222228]';
  const hoverBg = lightMode ? 'hover:bg-gray-50' : 'hover:bg-[#1a1a1f]';
  // Stage list styles
  const stageItemBase = `w-full text-left px-3 py-2 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-2`;
  const stageItemActive = lightMode ?
  'bg-gray-100 text-[#1f2937]' :
  'bg-[#1a1a1f] text-[#e8e8ed]';
  const stageItemInactive = lightMode ?
  'text-[#6b7280] hover:bg-gray-50 hover:text-[#1f2937]' :
  'text-[#8a8a96] hover:bg-[#1a1a1f] hover:text-[#e8e8ed]';
  // Step/DataType list styles
  const stepItemBase = `w-full text-left px-3 py-1.5 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-2 border-l-2`;
  const stepItemActive = lightMode ?
  'border-gray-800 bg-gray-50 text-[#1f2937]' :
  'border-[#e8e8ed] bg-[#1a1a1f] text-[#e8e8ed]';
  const stepItemInactive = lightMode ?
  'border-transparent text-[#6b7280] hover:bg-gray-50 hover:text-[#1f2937]' :
  'border-transparent text-[#8a8a96] hover:bg-[#1a1a1f] hover:text-[#e8e8ed]';
  const iconBtn = `h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 ${lightMode ? 'text-[#6b7280] hover:text-[#1f2937] hover:bg-gray-100' : 'text-[#8a8a96] hover:text-[#e8e8ed] hover:bg-[#1a1a1f]'}`;
  const iconBtnActive = `h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 ${lightMode ? 'text-[#1f2937] bg-gray-200' : 'text-[#e8e8ed] bg-[#222228]'}`;
  const stageBadge = (isActive: boolean) => `
    w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-semibold shrink-0
    ${isActive ? lightMode ? 'bg-gray-300 text-gray-700' : 'bg-[#3a3a44] text-[#e8e8ed]' : lightMode ? 'bg-gray-100 text-gray-400' : 'bg-[#222228] text-[#5a5a66]'}
  `;
  const stepBadge = (isActive: boolean) => `
    w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono shrink-0
    ${isActive ? lightMode ? 'bg-gray-200 text-gray-800' : 'bg-[#3a3a44] text-[#e8e8ed]' : lightMode ? 'bg-gray-100 text-gray-400' : 'bg-[#222228] text-[#5a5a66]'}
  `;
  // Render mode icons map
  const getRenderModeIcon = (value: string) => {
    switch (value) {
      case 'hexagonal':
      case 'grid':
        return <Hexagon className="w-3.5 h-3.5" />;
      case 'points':
        return <CircleDot className="w-3.5 h-3.5" />;
      case 'fields':
      case 'vectors':
        return <Activity className="w-3.5 h-3.5" />;
      case 'heatmap':
        return <Flame className="w-3.5 h-3.5" />;
      default:
        return <Hexagon className="w-3.5 h-3.5" />;
    }
  };
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <div
      className={`flex flex-col w-[260px] rounded-lg border overflow-hidden shadow-lg backdrop-blur-sm ${panelBg} ${panelBorder}`}>

      {/* 1. STAGE HEADER (Collapsible) */}
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        {isStageExpanded ?
        <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Compass className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              <span className={`text-[13px] font-semibold ${textPrimary}`}>
                Stage
              </span>
            </div>
            <span className={`text-[10px] ${textMuted}`}>
              {stages.length} stages
            </span>
          </div> :

        <div className="flex items-center gap-1 px-2 py-2 overflow-hidden">
            <button
            onClick={() => setIsStageExpanded(true)}
            className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-2 py-1 rounded transition-colors overflow-hidden ${hoverBg}`}
            title="Click to show all stages">

              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className={stageBadge(true)}>
                  {currentStageIndex + 1}
                </span>
                <span
                className={`text-[12px] font-semibold ${textPrimary} truncate`}>

                  {currentStage?.label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${textMuted}`} />
            </button>
          </div>
        }
      </div>

      {/* STAGE LIST (When Expanded) */}
      {isStageExpanded &&
      <div className={`flex-shrink-0 py-1 border-b ${borderSubtle}`}>
          {stages.map((stage, index) =>
        <button
          key={stage.value}
          onClick={() => handleSelectStage(stage.value)}
          className={`${stageItemBase} ${stage.value === selectedStage ? stageItemActive : stageItemInactive}`}>

              <span className={stageBadge(stage.value === selectedStage)}>
                {index + 1}
              </span>
              <span className="truncate">{stage.label}</span>
            </button>
        )}
        </div>
      }

      {/* 2. STEPS SECTION */}
      <div className={`flex-shrink-0 border-b ${borderSubtle} flex flex-col`}>
        {/* Steps Header */}
        <div className={`px-3 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Layers className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span
              className={`text-[11px] font-semibold ${textSecondary} uppercase tracking-wider`}>

              Steps
            </span>
          </div>
          <span className={`text-[10px] ${textMuted}`}>{steps.length}</span>
        </div>

        {/* Steps List */}
        <div className="pb-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {steps.length > 0 ?
          steps.map((step, index) =>
          <button
            key={`${step.category}-${step.value}`}
            onClick={() => onSelectedStepChange(step.value)}
            className={`${stepItemBase} ${step.value === selectedStep ? stepItemActive : stepItemInactive}`}>

                <span className={stepBadge(step.value === selectedStep)}>
                  {index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
          ) :

          <div className={`px-3 py-2 text-[11px] ${textMuted} italic`}>
              No steps available
            </div>
          }
        </div>
      </div>

      {/* 3. LAYERS SECTION */}
      <div className={`flex-shrink-0 border-b ${borderSubtle} flex flex-col`}>
        {/* Layers Header */}
        <div className={`px-3 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <SquareStack className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span
              className={`text-[11px] font-semibold ${textSecondary} uppercase tracking-wider`}>

              Layers
            </span>
          </div>
          <span className={`text-[10px] ${textMuted}`}>
            {dataTypeOptions.length}
          </span>
        </div>

        {/* Layers List */}
        <div className="pb-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {dataTypeOptions.map((dataType, index) =>
          <button
            key={dataType.value}
            onClick={() => onSelectedDataTypeChange(dataType.value)}
            className={`${stepItemBase} ${dataType.value === selectedDataType ? stepItemActive : stepItemInactive}`}>

              <span className={stepBadge(dataType.value === selectedDataType)}>
                {index + 1}
              </span>
              <span className="truncate">{dataType.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. VIEW TOOLBAR */}
      <div className="flex-shrink-0 p-2 flex items-center justify-between gap-2">
        {/* Left: Fit & Edges */}
        <div className="flex items-center gap-1">
          <button onClick={onFitView} title="Fit to view" className={iconBtn}>
            <Maximize className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShowEdgesChange(!showEdges)}
            title={showEdges ? 'Hide edges' : 'Show edges'}
            className={showEdges ? iconBtnActive : iconBtn}>

            <GitBranch className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={`w-px h-4 ${lightMode ? 'bg-gray-200' : 'bg-[#2a2a32]'}`} />


        {/* Right: Render Modes (formerly Projections) */}
        <div className="flex items-center gap-1">
          {renderModeOptions.map((option) =>
          <button
            key={option.value}
            onClick={() => onSelectedRenderModeChange(option.value)}
            title={option.label}
            className={
            selectedRenderMode === option.value ? iconBtnActive : iconBtn
            }>

              {getRenderModeIcon(option.value)}
            </button>
          )}
        </div>
      </div>
    </div>);

};
