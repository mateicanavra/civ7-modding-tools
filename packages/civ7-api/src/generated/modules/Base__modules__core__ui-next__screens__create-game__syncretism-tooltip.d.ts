/**
 * warehouse-breakdown-tooltip.tsx
 * Solid-based tooltips for displaying a Civilization's Syncretism Unlocks
 */
import { ParentComponent } from "solid-js";
import { TooltipBaseProps, TooltipHorizontalPosition, TooltipVerticalPosition } from "/core/ui-next/components/tooltip.js";
interface SyncretismTooltipProps extends Omit<TooltipBaseProps, "initialVPosition" | "initialHPosition" | "offset"> {
    initialVPosition?: TooltipVerticalPosition;
    initialHPosition?: TooltipHorizontalPosition;
    offset?: number;
    civilizationType: string;
}
export declare const SyncretismTooltipComponent: ParentComponent<SyncretismTooltipProps>;
export declare const SyncretismTooltip: any;
export {};
