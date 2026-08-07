/**
 * production-tooltip.tsx
 * Solid-based tooltips for production chooser entries.
 */
import { ParentComponent } from "solid-js";
import { TooltipBaseProps, TooltipHorizontalPosition, TooltipVerticalPosition } from "/core/ui-next/components/tooltip.js";
import { ProductionPanelCategory } from "/base-standard/ui/production-chooser/production-chooser-helpers.js";
import type { AdvisorRecommendations } from "/base-standard/ui/tutorial/advisor-utilities.js";
type MaybeString = string | null | undefined;
interface ProductionTooltipProps extends Omit<TooltipBaseProps, "initialVPosition" | "initialHPosition" | "offset"> {
    initialVPosition?: TooltipVerticalPosition;
    initialHPosition?: TooltipHorizontalPosition;
    offset?: number;
    category?: ProductionPanelCategory | string | null;
    type?: MaybeString;
    name?: MaybeString;
    description?: MaybeString;
    tooltipDescription?: MaybeString;
    recommendations?: AdvisorRecommendations[];
    isPurchase?: boolean;
    cost?: string;
    warehouseCount?: MaybeString;
    highestAdjacency?: MaybeString;
    canGetWarehouseBonuses?: boolean;
    canGetAdjacencyBonuses?: boolean;
    projectGrowthType?: MaybeString;
}
export declare const ProductionTooltipComponent: ParentComponent<ProductionTooltipProps>;
export declare const ProductionTooltip: any;
export {};
