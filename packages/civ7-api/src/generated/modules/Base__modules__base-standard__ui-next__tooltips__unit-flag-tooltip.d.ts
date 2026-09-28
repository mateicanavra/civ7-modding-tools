/**
 * unit-flag-tooltip.tsx
 * @copyright 2026, Firaxis Games
 * @description Solid tooltip for unit flags.
 */
import { ParentComponent } from "solid-js";
import { TooltipBaseProps, TooltipHorizontalPosition, TooltipVerticalPosition } from "/core/ui-next/components/tooltip.js";
import { type UnitInfoSectionProps } from "/base-standard/ui-next/tooltips/plot-tooltip/helpers.js";
interface UnitFlagTooltipProps extends Omit<TooltipBaseProps, "initialVPosition" | "initialHPosition" | "offset"> {
    unitInfo: UnitInfoSectionProps;
    initialVPosition?: TooltipVerticalPosition;
    initialHPosition?: TooltipHorizontalPosition;
    offset?: number;
}
export declare const UnitFlagTooltipComponent: ParentComponent<UnitFlagTooltipProps>;
export declare const UnitFlagTooltip: any;
export {};
