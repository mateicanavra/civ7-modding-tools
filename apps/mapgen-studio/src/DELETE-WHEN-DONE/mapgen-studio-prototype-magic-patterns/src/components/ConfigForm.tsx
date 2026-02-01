import React, { useEffect, useState, Fragment, Component } from 'react';
// ============================================================================
// CONFIG FORM
// ============================================================================
// Renders editable configuration for pipeline stages.
// Supports nested objects, arrays, and various field types.
// Uses path-based patching for efficient state updates.
// ============================================================================
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  NumberField,
  StringField,
  BooleanField,
  SelectField,
  ArrayField,
  FieldRow } from
'./fields';
import { formatStageName, formatFieldName } from '../utils';
import type {
  PipelineConfig,
  StepConfig,
  StageConfig,
  ConfigValue,
  ConfigPatch,
  Theme,
  KnobOptionsMap } from
'../types';
// ============================================================================
// Props
// ============================================================================
export interface ConfigFormProps {
  /** Current pipeline configuration */
  config: PipelineConfig;
  /** Path-based patch callback for efficient state updates */
  onConfigPatch: (patch: ConfigPatch) => void;
  /** Knob options mapping (knob name → available values) */
  knobOptions?: KnobOptionsMap;
  /** Theme object (currently unused, kept for API compatibility) */
  theme: Theme;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Auto-expand sections up to this depth (0 = manual expand) */
  autoExpandDepth?: number;
}
// ============================================================================
// Helper Functions
// ============================================================================
function getKnobOptionValues(
knobOptions: KnobOptionsMap | undefined,
knobName: string,
currentValue: string)
: string[] {
  const options = knobOptions?.[knobName] || [currentValue];
  if (!options.includes(currentValue)) {
    return [...options, currentValue];
  }
  return [...options];
}
// ============================================================================
// Main Component
// ============================================================================
export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onConfigPatch,
  knobOptions,
  lightMode,
  autoExpandDepth = 0
}) => {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>>(
    {});
  // Auto-expand sections when in focus mode (single step)
  useEffect(() => {
    if (autoExpandDepth > 0) {
      const stages = Object.keys(config);
      const newExpandedStages: Record<string, boolean> = {};
      const newExpandedSections: Record<string, boolean> = {};
      stages.forEach((stageName) => {
        newExpandedStages[stageName] = true;
        const stageConfig = config[stageName];
        if (!stageConfig) return;
        Object.keys(stageConfig).forEach((key) => {
          if (key === 'knobs') return;
          const sectionKey = `${stageName}.${key}`;
          if (autoExpandDepth >= 2) {
            newExpandedSections[sectionKey] = true;
          }
          if (autoExpandDepth >= 3 && key !== 'knobs') {
            const group = stageConfig[key as keyof StageConfig];
            if (
            typeof group === 'object' &&
            group !== null &&
            !Array.isArray(group))
            {
              Object.keys(group).forEach((stepName) => {
                const stepKey = `${stageName}.${key}.${stepName}`;
                newExpandedSections[stepKey] = true;
                const stepConfig = (group as Record<string, StepConfig>)[
                stepName];

                if (stepConfig?.config) {
                  Object.keys(stepConfig.config).forEach((configKey) => {
                    const configSectionKey = `${stepKey}.config.${configKey}`;
                    newExpandedSections[configSectionKey] = true;
                  });
                }
              });
            }
          }
        });
      });
      setExpandedStages(newExpandedStages);
      setExpandedSections(newExpandedSections);
    }
  }, [config, autoExpandDepth]);
  // ==========================================================================
  // Styles
  // ==========================================================================
  const textPrimary = lightMode ? 'text-[#1f2937]' : 'text-[#e8e8ed]';
  const textSecondary = lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const borderSubtle = lightMode ? 'border-gray-100' : 'border-[#222228]';
  const nestedCardBg = lightMode ? 'bg-white' : 'bg-[#141418]';
  const hoverBg = lightMode ? 'hover:bg-gray-50' : 'hover:bg-[#1a1a1f]';
  const badgeBg = lightMode ?
  'bg-gray-100 text-gray-600' :
  'bg-[#222228] text-[#8a8a96]';
  const dividerClass = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  // ==========================================================================
  // State Handlers
  // ==========================================================================
  const toggleStage = (stage: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  // Path-based config update using patch callback
  const updateConfig = (path: string[], value: ConfigValue) => {
    onConfigPatch({
      path,
      value
    });
  };
  // ==========================================================================
  // Render Helpers
  // ==========================================================================
  const renderConfigValue = (
  key: string,
  value: ConfigValue,
  path: string[])
  : React.ReactNode => {
    const fieldPath = [...path, key];
    const label = formatFieldName(key);
    if (value === null) {
      return (
        <FieldRow key={key}>
          <span className={`text-[11px] ${textSecondary}`}>{label}</span>
          <span className={`text-[10px] ${textMuted}`}>null</span>
        </FieldRow>);

    }
    if (typeof value === 'boolean') {
      return (
        <BooleanField
          key={key}
          label={label}
          value={value}
          onChange={(v) => updateConfig(fieldPath, v)}
          lightMode={lightMode} />);


    }
    if (typeof value === 'number') {
      return (
        <NumberField
          key={key}
          label={label}
          value={value}
          onChange={(v) => updateConfig(fieldPath, v)}
          lightMode={lightMode} />);


    }
    if (typeof value === 'string') {
      return (
        <StringField
          key={key}
          label={label}
          value={value}
          onChange={(v) => updateConfig(fieldPath, v)}
          lightMode={lightMode} />);


    }
    if (Array.isArray(value)) {
      return (
        <ArrayField
          key={key}
          label={label}
          value={value}
          lightMode={lightMode} />);


    }
    if (typeof value === 'object') {
      const sectionKey = fieldPath.join('.');
      const isExpanded = expandedSections[sectionKey] ?? false;
      return (
        <div key={key} className="py-0.5">
          <button
            onClick={() => toggleSection(sectionKey)}
            className={`flex items-center gap-1.5 text-[11px] font-medium py-1 rounded transition-colors ${textSecondary} hover:opacity-80`}>

            {isExpanded ?
            <ChevronDown className="w-3 h-3" /> :

            <ChevronRight className="w-3 h-3" />
            }
            {label}
          </button>
          {isExpanded &&
          <div className={`ml-3 pl-3 mt-0.5 border-l ${borderSubtle}`}>
              {Object.entries(value).map(([k, v]) =>
            renderConfigValue(k, v as ConfigValue, fieldPath)
            )}
            </div>
          }
        </div>);

    }
    return null;
  };
  const renderStepConfig = (
  stepName: string,
  stepConfig: StepConfig,
  path: string[])
  : React.ReactNode => {
    const sectionKey = [...path, stepName].join('.');
    const isExpanded = expandedSections[sectionKey] ?? false;
    const hasConfig = 'config' in stepConfig && stepConfig.config;
    return (
      <div
        key={stepName}
        className={`rounded border ${nestedCardBg} ${borderSubtle}`}>

        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-1.5">
            {isExpanded ?
            <ChevronDown className={`w-3 h-3 ${textSecondary}`} /> :

            <ChevronRight className={`w-3 h-3 ${textSecondary}`} />
            }
            <span className={`text-[11px] font-medium ${textPrimary}`}>
              {stepName}
            </span>
          </div>
          {stepConfig.strategy &&
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${badgeBg}`}>

              {stepConfig.strategy}
            </span>
          }
        </button>

        {isExpanded && hasConfig &&
        <div className={`px-2.5 pb-2 border-t ${borderSubtle}`}>
            {Object.entries(stepConfig.config!).map(([key, value]) =>
          renderConfigValue(key, value, [...path, stepName, 'config'])
          )}
          </div>
        }
      </div>);

  };
  const renderStepGroup = (
  groupName: string,
  steps: Record<string, StepConfig>,
  stageName: string)
  : React.ReactNode => {
    const sectionKey = `${stageName}.${groupName}`;
    const isExpanded = expandedSections[sectionKey] ?? false;
    return (
      <div key={groupName}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between py-1.5 rounded transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-1.5">
            {isExpanded ?
            <ChevronDown className={`w-3 h-3 ${textSecondary}`} /> :

            <ChevronRight className={`w-3 h-3 ${textSecondary}`} />
            }
            <span className={`text-[11px] font-medium ${textPrimary}`}>
              {formatFieldName(groupName)}
            </span>
          </div>
          <span className={`text-[10px] font-mono ${textMuted}`}>
            {Object.keys(steps).length}
          </span>
        </button>

        {isExpanded &&
        <div className="flex flex-col gap-1 pt-1 pb-1.5">
            {Object.entries(steps).map(([stepName, stepConfig]) =>
          renderStepConfig(stepName, stepConfig, [
          stageName,
          'advanced',
          groupName]
          )
          )}
          </div>
        }
      </div>);

  };
  const renderKnobs = (
  stageName: string,
  knobs: Record<string, string>)
  : React.ReactNode => {
    if (Object.keys(knobs).length === 0) return null;
    return (
      <div className="flex flex-col">
        {Object.entries(knobs).map(([knobName, knobValue]) =>
        <SelectField
          key={knobName}
          label={formatFieldName(knobName)}
          value={knobValue}
          options={getKnobOptionValues(knobOptions, knobName, knobValue)}
          onChange={(v) => updateConfig([stageName, 'knobs', knobName], v)}
          lightMode={lightMode} />

        )}
      </div>);

  };
  const renderAdvanced = (
  stageName: string,
  advanced: Record<string, Record<string, StepConfig>>)
  : React.ReactNode => {
    const sectionKey = `${stageName}.advanced`;
    const isExpanded = expandedSections[sectionKey] ?? false;
    return (
      <div className={`mt-2 pt-2 border-t border-dashed ${borderSubtle}`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider py-1 rounded transition-colors ${textSecondary} hover:opacity-80`}>

          {isExpanded ?
          <ChevronDown className="w-3 h-3" /> :

          <ChevronRight className="w-3 h-3" />
          }
          Advanced
        </button>

        {isExpanded &&
        <div className="pt-1.5 flex flex-col gap-1.5">
            {Object.entries(advanced).map(([groupName, steps]) =>
          renderStepGroup(groupName, steps, stageName)
          )}
          </div>
        }
      </div>);

  };
  const renderStage = (
  stageName: string,
  stageConfig: StageConfig)
  : React.ReactNode => {
    const isExpanded = expandedStages[stageName] ?? true;
    const hasKnobs =
    stageConfig.knobs && Object.keys(stageConfig.knobs).length > 0;
    const hasAdvanced =
    stageConfig.advanced && Object.keys(stageConfig.advanced).length > 0;
    const otherSteps = Object.entries(stageConfig).filter(
      ([key]) => key !== 'knobs' && key !== 'advanced'
    );
    return (
      <div key={stageName}>
        <button
          onClick={() => toggleStage(stageName)}
          className={`w-full flex items-center justify-between py-1.5 rounded transition-colors ${hoverBg}`}>

          <span className={`font-semibold text-[12px] ${textPrimary}`}>
            {formatStageName(stageName)}
          </span>
          {isExpanded ?
          <ChevronDown className={`w-3.5 h-3.5 ${textSecondary}`} /> :

          <ChevronRight className={`w-3.5 h-3.5 ${textSecondary}`} />
          }
        </button>

        {isExpanded &&
        <div className="pt-0.5">
            {hasKnobs && renderKnobs(stageName, stageConfig.knobs!)}

            {otherSteps.length > 0 &&
          <div className="pt-1.5 flex flex-col gap-1.5">
                {otherSteps.map(([groupName, group]) => {
              if (
              typeof group === 'object' &&
              group !== null &&
              !Array.isArray(group))
              {
                return renderStepGroup(
                  groupName,
                  group as Record<string, StepConfig>,
                  stageName
                );
              }
              return null;
            })}
              </div>
          }

            {hasAdvanced && renderAdvanced(stageName, stageConfig.advanced!)}
          </div>
        }
      </div>);

  };
  // ==========================================================================
  // Render
  // ==========================================================================
  const stages = Object.entries(config);
  return (
    <div className="flex flex-col -mx-3">
      {stages.map(([stageName, stageConfig], index) =>
      <Fragment key={stageName}>
          {index > 0 && <div className={`border-t ${dividerClass} my-2.5`} />}
          <div className="px-3">{renderStage(stageName, stageConfig)}</div>
        </Fragment>
      )}
    </div>);

};