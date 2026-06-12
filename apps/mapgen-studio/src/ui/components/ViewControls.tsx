import React from 'react';
// ============================================================================
// VIEW CONTROLS
// ============================================================================
// Toolbar for theme toggle and grid visibility.
//
// Reskinned onto the design tokens: the dock floats over the map on the
// `popover` tier; icon buttons rest on `text-muted-foreground` and lift to
// `bg-accent` on hover / `bg-muted` when active. Native `title=` hints are now
// the shadcn Tooltip (token-styled, delay-grouped under the shell provider).
// ============================================================================
import { Grid3x3, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui';
import type { ThemePreference } from '../types';
// ============================================================================
// Props
// ============================================================================
export interface ViewControlsProps {
  /** Current theme preference */
  themePreference: ThemePreference;
  /** Callback to cycle theme preference */
  onThemeCycle: () => void;
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
// Styles (token-driven; theme follows the `.dark` class)
// ============================================================================
const iconBtn = cn(
  'h-7 w-7 flex items-center justify-center rounded transition-colors',
  'text-muted-foreground hover:bg-accent hover:text-foreground'
);
const iconBtnActive = cn(
  'h-7 w-7 flex items-center justify-center rounded transition-colors',
  'bg-muted text-foreground'
);
// ============================================================================
// Component
// ============================================================================
export const ViewControls: React.FC<ViewControlsProps> = ({
  themePreference,
  onThemeCycle,
  showGrid,
  onShowGridChange
}) => {
  const { icon: ThemeIcon, tooltip: themeTooltip } =
  THEME_CONFIG[themePreference];
  const gridTooltip = showGrid ? 'Hide grid' : 'Show grid';
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <div
      className="h-10 inline-flex items-center gap-1 px-1.5 rounded-lg border border-border bg-popover/95 backdrop-blur-sm"
      role="toolbar"
      aria-label="View controls">

      {/* Theme toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onThemeCycle}
            aria-label={themeTooltip}
            className={iconBtn}>

            <ThemeIcon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{themeTooltip}</TooltipContent>
      </Tooltip>

      <div className="w-px h-4 bg-border" aria-hidden="true" />

      {/* Grid toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onShowGridChange(!showGrid)}
            aria-label={gridTooltip}
            aria-pressed={showGrid}
            className={showGrid ? iconBtnActive : iconBtn}>

            <Grid3x3 className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{gridTooltip}</TooltipContent>
      </Tooltip>
    </div>);

};
