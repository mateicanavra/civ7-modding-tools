import React from 'react';
// ============================================================================
// VIEW CONTROLS
// ============================================================================
// Toolbar for theme toggle and grid visibility.
// ============================================================================
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../utils';
import type { ThemePreference } from '../types';
// ============================================================================
// Props
// ============================================================================
export interface ViewControlsProps {
  /** Current theme preference */
  themePreference: ThemePreference;
  /** Callback to cycle theme preference */
  onThemeCycle: () => void;
  /** Light mode flag for styling */
  isLightMode: boolean;
  /** Whether grid is visible */
  showGrid: boolean;
  /** Callback when grid visibility changes */
  onShowGridChange: (show: boolean) => void;
}
// ============================================================================
// Constants
// ============================================================================
const THEME_CONFIG: Record<
  ThemePreference,
  {
    icon: typeof Monitor;
    tooltip: string;
  }> =
{
  system: {
    icon: Monitor,
    tooltip: 'Theme: Auto'
  },
  light: {
    icon: Sun,
    tooltip: 'Theme: Light'
  },
  dark: {
    icon: Moon,
    tooltip: 'Theme: Dark'
  }
};
// ============================================================================
// Component
// ============================================================================
export const ViewControls: React.FC<ViewControlsProps> = ({
  themePreference,
  onThemeCycle,
  isLightMode,
  showGrid,
  onShowGridChange
}) => {
  // ==========================================================================
  // Styles
  // ==========================================================================
  const panelBg = isLightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = isLightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const dividerColor = isLightMode ? 'bg-gray-200' : 'bg-[#2a2a32]';
  // Icon button styles based on theme
  const iconBtn = cn(
    'h-7 w-7 flex items-center justify-center rounded transition-colors',
    isLightMode ?
    'text-[#6b7280] hover:bg-gray-100 hover:text-[#1f2937]' :
    'text-[#8a8a96] hover:bg-[#1a1a1f] hover:text-[#e8e8ed]'
  );
  const iconBtnActive = cn(
    'h-7 w-7 flex items-center justify-center rounded transition-colors',
    isLightMode ? 'bg-gray-200 text-[#1f2937]' : 'bg-[#222228] text-[#e8e8ed]'
  );
  const { icon: ThemeIcon, tooltip: themeTooltip } =
  THEME_CONFIG[themePreference];
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <div
      className={`h-10 inline-flex items-center gap-1 px-1.5 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}
      role="toolbar"
      aria-label="View controls">

      {/* Theme toggle */}
      <button
        onClick={onThemeCycle}
        title={themeTooltip}
        aria-label={themeTooltip}
        className={iconBtn}>

        <ThemeIcon className="w-4 h-4" />
      </button>

      <div className={`w-px h-4 ${dividerColor}`} aria-hidden="true" />

      {/* Grid toggle */}
      <button
        onClick={() => onShowGridChange(!showGrid)}
        title={showGrid ? 'Hide grid' : 'Show grid'}
        aria-label={showGrid ? 'Hide grid' : 'Show grid'}
        aria-pressed={showGrid}
        className={showGrid ? iconBtnActive : iconBtn}>

        <div className="w-4 h-4" />
      </button>
    </div>);

};
