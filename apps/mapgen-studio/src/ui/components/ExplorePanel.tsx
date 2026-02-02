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
  Bug,
  Flame } from
'lucide-react';
import type {
  StageOption,
  StepOption,
  DataTypeOption,
  SpaceOption,
  VariantOption,
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
  /** Available spaces (spaceId) for selected data type */
  spaceOptions: SpaceOption[];
  /** Currently selected space */
  selectedSpace: string;
  /** Callback when space selection changes */
  onSelectedSpaceChange: (space: string) => void;
  /** Available render modes (formerly "projections") */
  renderModeOptions: RenderModeOption[];
  /** Currently selected render mode */
  selectedRenderMode: string;
  /** Callback when render mode selection changes */
  onSelectedRenderModeChange: (renderMode: string) => void;
  /** Available variants for selected render mode */
  variantOptions: VariantOption[];
  /** Currently selected variant */
  selectedVariant: string;
  /** Callback when variant selection changes */
  onSelectedVariantChange: (variant: string) => void;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Whether to show edge visualization */
  showEdges: boolean;
  /** Callback when edge visibility changes */
  onShowEdgesChange: (show: boolean) => void;
  /** Whether debug layers/variants are visible */
  showDebugLayers: boolean;
  /** Callback when debug visibility changes */
  onShowDebugLayersChange: (show: boolean) => void;
  /** Callback when fit view is requested */
  onFitView: () => void;
  /** Whether the stage section is expanded (optional controlled mode) */
  stageExpanded?: boolean;
  /** Callback when stageExpanded changes (optional controlled mode) */
  onStageExpandedChange?: (expanded: boolean) => void;
  /** Whether the step section is expanded (optional controlled mode) */
  stepExpanded?: boolean;
  /** Callback when stepExpanded changes (optional controlled mode) */
  onStepExpandedChange?: (expanded: boolean) => void;
  /** Whether the layers section is expanded (optional controlled mode) */
  layersExpanded?: boolean;
  /** Callback when layersExpanded changes (optional controlled mode) */
  onLayersExpandedChange?: (expanded: boolean) => void;
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
  spaceOptions,
  selectedSpace,
  onSelectedSpaceChange,
  renderModeOptions,
  selectedRenderMode,
  onSelectedRenderModeChange,
  variantOptions,
  selectedVariant,
  onSelectedVariantChange,
  lightMode,
  showEdges,
  onShowEdgesChange,
  showDebugLayers,
  onShowDebugLayersChange,
  onFitView,
  stageExpanded: stageExpandedProp,
  onStageExpandedChange,
  stepExpanded: stepExpandedProp,
  onStepExpandedChange,
  layersExpanded: layersExpandedProp,
  onLayersExpandedChange
}) => {
  const [localStageExpanded, setLocalStageExpanded] = useState(true);
  const [localStepExpanded, setLocalStepExpanded] = useState(true);
  const [localLayersExpanded, setLocalLayersExpanded] = useState(true);

  const isStageExpanded = stageExpandedProp ?? localStageExpanded;
  const setIsStageExpanded = (next: boolean) => {
    onStageExpandedChange?.(next);
    if (stageExpandedProp === undefined) setLocalStageExpanded(next);
  };

  const isStepExpanded = stepExpandedProp ?? localStepExpanded;
  const setIsStepExpanded = (next: boolean) => {
    onStepExpandedChange?.(next);
    if (stepExpandedProp === undefined) setLocalStepExpanded(next);
  };

  const isLayersExpanded = layersExpandedProp ?? localLayersExpanded;
  const setIsLayersExpanded = (next: boolean) => {
    onLayersExpandedChange?.(next);
    if (layersExpandedProp === undefined) setLocalLayersExpanded(next);
  };
  const currentStage = stages.find((s) => s.value === selectedStage);
  const currentStep = steps.find((s) => s.value === selectedStep);
  const currentLayer = dataTypeOptions.find((dt) => dt.value === selectedDataType);
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
  const handleSelectStep = (stepValue: string) => {
    onSelectedStepChange(stepValue);
    setIsStepExpanded(false);
  };
  const handleSelectLayer = (layerValue: string) => {
    onSelectedDataTypeChange(layerValue);
    setIsLayersExpanded(false);
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
  const listMaxHeight = "max-h-[200px]";
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
    const kind = value.split(":")[0] ?? value;
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
        if (kind === "points") return <CircleDot className="w-3.5 h-3.5" />;
        if (kind === "segments") return <GitBranch className="w-3.5 h-3.5" />;
        if (kind === "gridFields") return <Activity className="w-3.5 h-3.5" />;
        return <Hexagon className="w-3.5 h-3.5" />;
    }
  };

  const getSpaceIcon = (value: string) => {
    switch (value) {
      case "tile.hexOddR":
      case "tile.hexOddQ":
        return <Hexagon className="w-3.5 h-3.5" />;
      case "mesh.world":
        return <SquareStack className="w-3.5 h-3.5" />;
      case "world.xy":
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <div
      className={`flex flex-col w-[260px] rounded-lg border overflow-hidden shadow-lg backdrop-blur-sm ${panelBg} ${panelBorder}`}>

      {/* 1. STAGE SECTION */}
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        <button
          type="button"
          onClick={() => setIsStageExpanded(!isStageExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Compass className={`w-4 h-4 shrink-0 ${textSecondary}`} />
            <span className={`text-[13px] font-semibold ${textPrimary}`}>
              Stage
            </span>
            {!isStageExpanded ? (
              <span className={`text-[12px] font-semibold ${textPrimary} truncate`}>
                {currentStage?.label ?? ""}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] ${textMuted}`}>
              {stages.length}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 ${textMuted} transition-transform ${isStageExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>
      </div>
      {isStageExpanded ? (
        <div className={`flex-shrink-0 py-1 border-b ${borderSubtle} ${listMaxHeight} overflow-y-auto custom-scrollbar`}>
          {stages.map((stage, index) => (
            <button
              key={stage.value}
              onClick={() => handleSelectStage(stage.value)}
              className={`${stageItemBase} ${stage.value === selectedStage ? stageItemActive : stageItemInactive}`}>

              <span className={stageBadge(stage.value === selectedStage)}>
                {index + 1}
              </span>
              <span className="truncate">{stage.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* 2. STEP SECTION */}
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        <button
          type="button"
          onClick={() => setIsStepExpanded(!isStepExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Layers className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span className={`text-[11px] font-semibold ${textSecondary} uppercase tracking-wider`}>
              Step
            </span>
            {!isStepExpanded ? (
              <span className={`text-[11px] font-mono ${textPrimary} truncate`}>
                {currentStep?.label ?? ""}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] ${textMuted}`}>{steps.length}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${textMuted} transition-transform ${isStepExpanded ? "rotate-180" : ""}`} />
          </div>
        </button>
      </div>
      {isStepExpanded ? (
        <div className={`flex-shrink-0 pb-2 border-b ${borderSubtle} ${listMaxHeight} overflow-y-auto custom-scrollbar`}>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <button
                key={`${step.category}-${step.value}`}
                onClick={() => handleSelectStep(step.value)}
                className={`${stepItemBase} ${step.value === selectedStep ? stepItemActive : stepItemInactive}`}>

                <span className={stepBadge(step.value === selectedStep)}>
                  {index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
            ))
          ) : (
            <div className={`px-3 py-2 text-[11px] ${textMuted} italic`}>No steps available</div>
          )}
        </div>
      ) : null}

      {/* 3. LAYERS SECTION */}
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        <button
          type="button"
          onClick={() => setIsLayersExpanded(!isLayersExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <SquareStack className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span className={`text-[11px] font-semibold ${textSecondary} uppercase tracking-wider`}>
              Layers
            </span>
            {!isLayersExpanded ? (
              <span className={`text-[11px] font-mono ${textPrimary} truncate`}>
                {currentLayer?.label ?? ""}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] ${textMuted}`}>{dataTypeOptions.length}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${textMuted} transition-transform ${isLayersExpanded ? "rotate-180" : ""}`} />
          </div>
        </button>
      </div>
      {isLayersExpanded ? (
        <div className={`flex-shrink-0 pb-2 border-b ${borderSubtle} ${listMaxHeight} overflow-y-auto custom-scrollbar`}>
          {(() => {
            let lastGroup: string | undefined = undefined;
            return dataTypeOptions.map((dataType, index) => {
              const group = dataType.group ?? undefined;
              const showGroupHeader = group !== lastGroup;
              lastGroup = group;
              return (
                <React.Fragment key={dataType.value}>
                  {showGroupHeader && group ? (
                    <div className={`px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider ${textMuted}`}>{group}</div>
                  ) : null}
                  <button
                    onClick={() => handleSelectLayer(dataType.value)}
                    className={`${stepItemBase} ${dataType.value === selectedDataType ? stepItemActive : stepItemInactive}`}>

                    <span className={stepBadge(dataType.value === selectedDataType)}>
                      {index + 1}
                    </span>
                    <span className="truncate">{dataType.label}</span>
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </div>
      ) : null}

      {/* 4. VIEW TOOLBAR */}
      <div className="flex-shrink-0 p-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
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

          {/* Right: Render */}
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>Render</span>
            <div className="flex items-center gap-1">
              {renderModeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSelectedRenderModeChange(option.value)}
                  title={option.label}
                  className={selectedRenderMode === option.value ? iconBtnActive : iconBtn}
                >
                  {getRenderModeIcon(option.value)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Left: Space */}
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>Space</span>
            <div className="flex items-center gap-1">
              {spaceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSelectedSpaceChange(option.value)}
                  title={option.label}
                  className={selectedSpace === option.value ? iconBtnActive : iconBtn}
                >
                  {getSpaceIcon(option.value)}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Debug toggle */}
          <button
            onClick={() => onShowDebugLayersChange(!showDebugLayers)}
            title={showDebugLayers ? "Hide debug layers" : "Show debug layers"}
            className={showDebugLayers ? iconBtnActive : iconBtn}>
            <Bug className="w-3.5 h-3.5" />
          </button>
        </div>

        {variantOptions.length > 1 ? (
          <label className="flex flex-col gap-1">
            <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>Variant</span>
            <select
              value={selectedVariant}
              onChange={(e) => onSelectedVariantChange(e.target.value)}
              className={`h-8 rounded px-2 text-[11px] ${lightMode ? 'bg-white border border-gray-200 text-[#1f2937]' : 'bg-[#111116] border border-[#2a2a32] text-[#e8e8ed]'}`}>
              {variantOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={`text-[10px] ${textMuted}`}>
              Semantic slices like <span className={lightMode ? "text-gray-600" : "text-[#8a8a96]"}>era:2</span>, not styling.
            </span>
          </label>
        ) : null}
      </div>
    </div>);

};
