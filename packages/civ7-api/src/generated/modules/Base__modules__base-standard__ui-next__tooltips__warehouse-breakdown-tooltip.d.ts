/**
 * warehouse-breakdown-tooltip.tsx
 * Solid-based tooltips for breaking down warehouse counts in a settlement
 */
import { ParentComponent } from "solid-js";
import { TooltipBaseProps, TooltipHorizontalPosition, TooltipVerticalPosition } from "/core/ui-next/components/tooltip.js";
import { WarehouseData } from "/base-standard/ui/city-details/model-city-details.js";
interface WarehouseBreakdownTooltipProps extends Omit<TooltipBaseProps, "initialVPosition" | "initialHPosition" | "offset"> {
    initialVPosition?: TooltipVerticalPosition;
    initialHPosition?: TooltipHorizontalPosition;
    offset?: number;
    warehouseCounts: Map<string, WarehouseData>;
}
export declare const WarehouseBreakdownTooltipComponent: ParentComponent<WarehouseBreakdownTooltipProps>;
export declare const WarehouseBreakdownTooltip: any;
export {};
