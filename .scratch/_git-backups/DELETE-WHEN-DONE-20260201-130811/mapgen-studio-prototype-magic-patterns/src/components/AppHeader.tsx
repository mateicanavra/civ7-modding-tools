import React from 'react';
import { Globe } from 'lucide-react';
import { AppBrand } from './AppBrand';
import { ViewControls } from './ViewControls';
import { Select } from './ui';
import {
  LAYOUT,
  WORLD_MODE_OPTIONS,
  MAP_SIZE_OPTIONS,
  PLAYER_COUNT_OPTIONS,
  RESOURCE_MODE_OPTIONS } from
'../constants';
import type { ThemePreference, WorldSettings } from '../types';
export const HEADER_HEIGHT = LAYOUT.HEADER_HEIGHT;
export interface AppHeaderProps {
  isLightMode: boolean;
  themePreference: ThemePreference;
  onThemeCycle: () => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  globalSettings: WorldSettings;
  onGlobalSettingsChange: (settings: WorldSettings) => void;
}
export const AppHeader: React.FC<AppHeaderProps> = ({
  isLightMode,
  themePreference,
  onThemeCycle,
  showGrid,
  onShowGridChange,
  globalSettings,
  onGlobalSettingsChange
}) => {
  const panelBg = isLightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = isLightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const textSecondary = isLightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = isLightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const dividerColor = isLightMode ? 'bg-gray-200' : 'bg-[#2a2a32]';
  const updateSetting = <K extends keyof WorldSettings,>(
  key: K,
  value: WorldSettings[K]) =>
  {
    onGlobalSettingsChange({
      ...globalSettings,
      [key]: value
    });
  };
  return (
    <header
      className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3"
      style={{
        height: HEADER_HEIGHT
      }}>

      {/* Left: App Brand */}
      <div className="shrink-0">
        <AppBrand isLightMode={isLightMode} />
      </div>

      {/* Center: World Settings */}
      <div
        className={`h-10 flex items-center gap-3 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* World label */}
        <div className="flex items-center gap-1.5">
          <Globe className={`w-4 h-4 ${textMuted}`} />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>

            World
          </span>
        </div>

        <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

        {/* Mode */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>

            Mode
          </span>
          <Select
            value={globalSettings.mode}
            onChange={(e) =>
            updateSetting('mode', e.target.value as WorldSettings['mode'])
            }
            options={WORLD_MODE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label
            }))}
            lightMode={isLightMode}
            className="w-20" />

        </div>

        <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

        {/* Map Size */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>

            Size
          </span>
          <Select
            value={globalSettings.mapSize}
            onChange={(e) =>
            updateSetting(
              'mapSize',
              e.target.value as WorldSettings['mapSize']
            )
            }
            options={MAP_SIZE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label
            }))}
            lightMode={isLightMode}
            className="w-24" />

        </div>

        <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

        {/* Player Count */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>

            Players
          </span>
          <Select
            value={globalSettings.playerCount.toString()}
            onChange={(e) =>
            updateSetting('playerCount', parseInt(e.target.value, 10))
            }
            options={PLAYER_COUNT_OPTIONS.map((count) => ({
              value: count.toString(),
              label: count.toString()
            }))}
            lightMode={isLightMode}
            className="w-14" />

        </div>

        <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

        {/* Resources */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>

            Resources
          </span>
          <Select
            value={globalSettings.resources}
            onChange={(e) =>
            updateSetting(
              'resources',
              e.target.value as WorldSettings['resources']
            )
            }
            options={RESOURCE_MODE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label
            }))}
            lightMode={isLightMode}
            className="w-24" />

        </div>
      </div>

      {/* Right: View Controls */}
      <div className="shrink-0">
        <ViewControls
          themePreference={themePreference}
          onThemeCycle={onThemeCycle}
          isLightMode={isLightMode}
          showGrid={showGrid}
          onShowGridChange={onShowGridChange} />

      </div>
    </header>);

};