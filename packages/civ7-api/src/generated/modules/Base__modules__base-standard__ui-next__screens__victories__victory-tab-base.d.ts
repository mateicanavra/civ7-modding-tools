import { Component, JSX, ParentComponent } from "solid-js";
import { TooltipBaseProps } from "/core/ui-next/components/tooltip.js";
import { SpreadsheetProps, VictoryRowPlayer, VictoryRulesTooltipProps, VictoryTabType } from "/base-standard/ui-next/screens/victories/victories-screen-model.js";
interface VictoryTabBaseProps extends JSX.HTMLAttributes<HTMLDivElement> {
    title: string;
    titleColorClass: string;
    header: string;
    rules: string;
    background: string;
    targetScore: number;
    preScrollContent?: JSX.Element;
    showPointsNeeded?: boolean;
    alternatePointsContent?: JSX.Element;
    pointsNeededText?: string;
}
interface VictoryRowProps extends JSX.HTMLAttributes<HTMLDivElement> {
    class?: string;
    rowId: number;
    columnClassOverride?: string;
    playerInfo: VictoryRowPlayer;
    divider: boolean;
    rowType: VictoryTabType;
    skipContentColumn?: boolean;
    skippedFirstContent?: JSX.Element;
    showTooltip?: boolean;
    omitBottomLine?: boolean;
    activateInfo?: (playerId: PlayerId) => void;
}
interface SpreadsheetTooltipProps extends TooltipBaseProps {
    data: SpreadsheetProps;
}
export declare const VictoryTabBase: Component<VictoryTabBaseProps>;
export interface VictoryHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
    showDividersAroundChildren?: boolean;
    childContainerPosition?: "center" | "end";
    skipContentColumn?: boolean;
    hideContentColumnDivider?: boolean;
}
export declare const VictoryHeader: Component<VictoryHeaderProps>;
export declare const VictoryRow: Component<VictoryRowProps>;
export declare const VictoryRulesTooltip: Component<VictoryRulesTooltipProps>;
export declare const SpreadsheetTooltip: ParentComponent<SpreadsheetTooltipProps>;
export {};
