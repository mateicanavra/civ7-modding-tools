import React from 'react';
import { Bolt, Clock, Dices, Play } from 'lucide-react';
import { Button, Input } from './ui';
import { MAP_SIZE_SHORT, LAYOUT } from '../constants';
import { formatResourceMode } from '../utils';
import type { RecipeSettings, WorldSettings, GenerationStatus } from '../types';
export interface AppFooterProps {
  /** Current generation status */
  status: GenerationStatus;
  /** Settings from the last completed run */
  lastRunSettings: RecipeSettings;
  /** World settings from the last completed run */
  lastGlobalSettings: WorldSettings;
  /** Current recipe settings (for seed input) */
  currentSettings: RecipeSettings;
  /** Callback when recipe settings change */
  onSettingsChange: (settings: RecipeSettings) => void;
  /** Callback to start a generation run */
  onRun: () => void;
  /** Callback to reroll (new seed + run) */
  onReroll: () => void;
  /** Whether generation is currently running */
  isRunning: boolean;
  /** Whether current settings differ from last run */
  isDirty: boolean;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Toast function for notifications */
  onToast?: (message: string) => void;
  /** When enabled, config changes auto-run the current seed */
  autoRunEnabled: boolean;
  /** Toggle auto-run mode */
  onAutoRunEnabledChange: (enabled: boolean) => void;
}
export const FOOTER_HEIGHT = LAYOUT.FOOTER_HEIGHT;
export const AppFooter: React.FC<AppFooterProps> = ({
  status,
  lastRunSettings,
  lastGlobalSettings,
  currentSettings,
  onSettingsChange,
  onRun,
  onReroll,
  isRunning,
  isDirty,
  lightMode,
  onToast,
  autoRunEnabled,
  onAutoRunEnabledChange
}) => {
  const panelBg = lightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const textPrimary = lightMode ? 'text-[#1f2937]' : 'text-[#e8e8ed]';
  const textSecondary = lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const dividerColor = lightMode ? 'bg-gray-200' : 'bg-[#2a2a32]';
  const statusDotClass =
  status === 'running' ?
  'bg-amber-400' :
  status === 'error' ?
  'bg-red-400' :
  isDirty ?
  'bg-orange-400' :
  'bg-emerald-400';
  const statusText =
  status === 'running' ?
  'Running' :
  status === 'error' ?
  'Error' :
  isDirty ?
  'Modified' :
  'Ready';
  const displaySize =
  MAP_SIZE_SHORT[lastGlobalSettings.mapSize] || lastGlobalSettings.mapSize;
  const displayResources = formatResourceMode(lastGlobalSettings.resources);
  const updateSetting = <K extends keyof RecipeSettings,>(
  key: K,
  value: RecipeSettings[K]) =>
  {
    onSettingsChange({
      ...currentSettings,
      [key]: value
    });
  };
  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(lastRunSettings.seed);
      onToast?.('Seed copied to clipboard');
    } catch (err) {
      console.error('Failed to copy seed:', err);
    }
  };
  return (
    <footer
      className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2"
      style={{
        height: FOOTER_HEIGHT
      }}>

      {/* Status Panel */}
      <div
        className={`h-10 inline-flex items-center gap-3 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <span className={`text-[11px] font-medium ${textPrimary}`}>
            {statusText}
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Last Run label */}
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${textMuted}`} />
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary}`}>

            Last
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Last run info */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={handleCopySeed}
            title="Click to copy seed"
            className={`font-mono ${textPrimary} hover:text-orange-500 hover:underline transition-colors cursor-pointer`}>

            {lastRunSettings.seed}
          </button>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displaySize}</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{lastGlobalSettings.playerCount}p</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displayResources}</span>
        </div>
      </div>

      {/* Run Controls Panel */}
      <div
        className={`h-10 inline-flex items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Seed input */}
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${textMuted}`}>

          Seed
        </span>
        <Input
          type="text"
          value={currentSettings.seed}
          onChange={(e) => updateSetting('seed', e.target.value)}
          placeholder="Seed"
          title="Generation seed"
          lightMode={lightMode}
          className="w-20 font-mono" />


        {/* Reroll button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onReroll}
          disabled={isRunning}
          title="Re-roll: New seed and run">

          <Dices className="w-3.5 h-3.5" />
        </Button>

        {/* Auto-run toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onAutoRunEnabledChange(!autoRunEnabled)}
          disabled={isRunning}
          aria-pressed={autoRunEnabled}
          aria-label="Toggle auto-run: run current seed on config changes"
          title="Auto-run: run current seed on config changes"
          className={autoRunEnabled ? "ring-2 ring-orange-400/50 border-orange-400 text-orange-500" : undefined}>

          <Bolt className="w-3.5 h-3.5" />
        </Button>

        {/* Run button */}
        <Button
          onClick={onRun}
          disabled={isRunning}
          className={`
            ${isDirty ? 'ring-2 ring-orange-400/50 border-orange-400' : ''}
            ${isRunning ? 'opacity-70 cursor-wait' : ''}
          `}>

          <Play className="w-3 h-3" />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </Button>
      </div>
    </footer>);

};
