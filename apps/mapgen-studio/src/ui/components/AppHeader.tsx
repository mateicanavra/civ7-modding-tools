import React from 'react';
import { ChevronDown, Globe, SlidersHorizontal } from 'lucide-react';
import { AppBrand } from './AppBrand';
import { ViewControls } from './ViewControls';
import { Select } from './ui';
import {
  getLocalPlayerSetup,
  updateStudioSetupGameOption,
  updateStudioSetupPlayerOption,
  type Civ7StudioSetupConfig
} from '../../features/civ7Setup/setupConfig';
import {
  LAYOUT,
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
  setupConfig: Civ7StudioSetupConfig;
  setupOptions: {
    savedConfigOptions: ReadonlyArray<{ value: string; label: string }>;
    leaderOptions: ReadonlyArray<{ value: string; label: string }>;
    civilizationOptions: ReadonlyArray<{ value: string; label: string }>;
    difficultyOptions: ReadonlyArray<{ value: string; label: string }>;
    gameSpeedOptions: ReadonlyArray<{ value: string; label: string }>;
  };
  onSetupConfigChange: (config: Civ7StudioSetupConfig) => void;
  onSavedConfigChange: (configId: string) => void;
  onHeaderHeightChange?: (height: number) => void;
}
export const AppHeader: React.FC<AppHeaderProps> = ({
  isLightMode,
  themePreference,
  onThemeCycle,
  showGrid,
  onShowGridChange,
  globalSettings,
  onGlobalSettingsChange,
  setupConfig,
  setupOptions,
  onSetupConfigChange,
  onSavedConfigChange,
  onHeaderHeightChange
}) => {
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [setupOpen, setSetupOpen] = React.useState(false);
  // Token-driven chrome; theme follows the single `.dark` class. The header
  // docks float over the deck.gl map, so they ride the `popover` tier.
  const panelBg = 'bg-popover/95';
  const panelBorder = 'border-border';
  const textSecondary = 'text-muted-foreground';
  const textMuted = 'text-muted-foreground/70';
  const dividerColor = 'bg-border';
  const setupButtonClassName =
    'flex h-7 shrink-0 items-center gap-1.5 rounded border border-input bg-input-background px-2.5 text-data font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
  const updateSetting = <K extends keyof WorldSettings,>(
  key: K,
  value: WorldSettings[K]) =>
  {
    onGlobalSettingsChange({
      ...globalSettings,
      [key]: value
    });
  };
  const localPlayerSetup = getLocalPlayerSetup(setupConfig);
  const updateLeader = (value: string) => {
    onSetupConfigChange(updateStudioSetupPlayerOption(setupConfig, 'PlayerLeader', value || undefined));
  };
  const updateCivilization = (value: string) => {
    onSetupConfigChange(updateStudioSetupPlayerOption(setupConfig, 'PlayerCivilization', value || undefined));
  };
  const updateDifficulty = (value: string) => {
    const nextGame = updateStudioSetupGameOption(setupConfig, 'Difficulty', value || undefined);
    onSetupConfigChange(updateStudioSetupPlayerOption(nextGame, 'PlayerDifficulty', value || undefined));
  };
  const updateGameSpeed = (value: string) => {
    onSetupConfigChange(updateStudioSetupGameOption(setupConfig, 'GameSpeeds', value || undefined));
  };
  React.useEffect(() => {
    const element = headerRef.current;
    if (!element || !onHeaderHeightChange) return;
    const reportHeight = () => {
      onHeaderHeightChange(Math.ceil(element.getBoundingClientRect().height));
    };
    reportHeight();
    const resizeObserver = new ResizeObserver(reportHeight);
    resizeObserver.observe(element);
    window.addEventListener('resize', reportHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', reportHeight);
    };
  }, [onHeaderHeightChange]);
  return (
    <header
      ref={headerRef}
      className="absolute top-4 left-4 right-4 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3"
      style={{
        minHeight: HEADER_HEIGHT
      }}>

      {/* Left: App Brand */}
      <div className="shrink-0">
        <AppBrand isLightMode={isLightMode} />
      </div>

      {/* Center: World Settings */}
      <div className="min-w-0 flex flex-col items-center gap-2 overflow-visible">
        <div
          className={`flex min-h-10 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

          <div className="flex items-center gap-1.5">
            <Globe className={`w-4 h-4 ${textMuted}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>
              World
            </span>
          </div>

          <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
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

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
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

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
              Config
            </span>
            <Select
              value={setupConfig.savedConfig?.id ?? ""}
              onChange={(e) => onSavedConfigChange(e.target.value)}
              options={setupOptions.savedConfigOptions}
              lightMode={isLightMode}
              className="w-44 max-w-[34vw]" />
          </div>

          <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

          <button
            type="button"
            className={setupButtonClassName}
            aria-expanded={setupOpen}
            onClick={() => setSetupOpen((open) => !open)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Setup</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${setupOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {setupOpen ? (
          <div
            className={`flex min-h-10 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
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

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
                Leader
              </span>
              <Select
                value={String(localPlayerSetup.options.PlayerLeader ?? "")}
                onChange={(e) => updateLeader(e.target.value)}
                options={setupOptions.leaderOptions}
                lightMode={isLightMode}
                className="w-32" />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
                Civ
              </span>
              <Select
                value={String(localPlayerSetup.options.PlayerCivilization ?? "")}
                onChange={(e) => updateCivilization(e.target.value)}
                options={setupOptions.civilizationOptions}
                lightMode={isLightMode}
                className="w-32" />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
                Difficulty
              </span>
              <Select
                value={String(setupConfig.gameOptions.Difficulty ?? localPlayerSetup.options.PlayerDifficulty ?? "")}
                onChange={(e) => updateDifficulty(e.target.value)}
                options={setupOptions.difficultyOptions}
                lightMode={isLightMode}
                className="w-28" />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
                Speed
              </span>
              <Select
                value={String(setupConfig.gameOptions.GameSpeeds ?? "")}
                onChange={(e) => updateGameSpeed(e.target.value)}
                options={setupOptions.gameSpeedOptions}
                lightMode={isLightMode}
                className="w-28" />
            </div>
          </div>
        ) : null}
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
