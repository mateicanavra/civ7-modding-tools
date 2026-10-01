/**
 * @file trade-route-model.ts
 * @copyright 2025, Firaxis Games
 * @description Select and get info on trade trade routes
 */
export interface IProjectedTradeRoute {
    index: number;
    city: City;
    cityPlotIndex: PlotIndex;
    leaderIcon: string;
    leaderName: string;
    status: TradeRouteStatus;
    statusIcon: string;
    statusText: string;
    statusTooltip: string;
    statusTooltipReason: string;
    importPayloads: ResourceDefinition[];
    exportYields: YieldAmount[];
    exportYieldsString: string;
    pathPlots: number[];
}
declare class TradeRoutesModelImpl {
    private projectedTradeRoutes;
    private isModern;
    private tradeRouteModelGroup;
    private tradeRoutePathColor;
    getTradeRoute(tradeRouteIndex: number): IProjectedTradeRoute;
    getProjectedTradeRoutes(): IProjectedTradeRoute[];
    /**
     * Process a trade route.
     * @param tradeRoute Which trade route to process.
     * @returns true if successful, false on error
     */
    private calculateRoute;
    calculateProjectedTradeRoutes(): Promise<IProjectedTradeRoute[]>;
    getTradeRouteStatusIcon(status: TradeRouteStatus, isLandRoute: boolean): "TRADE_ROUTE_LAND" | "TRADE_ROUTE_SEA" | "TRADE_ROUTE_WAR" | "TRADE_ROUTE_OUT_OF_RANGE" | "TRADE_ROUTE_ALLIANCE" | "";
    private getTradeActionText;
    showTradeRouteVfx(plots: PlotIndex[]): void;
    clearTradeRouteVfx(): void;
    private getPathVFXforPlot;
    private getDirectionNumberFromDirectionType;
}
/**
 * Gets the name of the resource type icon.
 *
 * @param resource
 * @param targetCity
 * @returns "RESOURCECLASS_TREASURE_FLEET" if it's a treasure fleet resource, resource.ResourceClassType if not.
 */
export declare function getResourceTypeIcon(resource: ResourceDefinition, targetCity: City): string;
export declare const TradeRoutesModel: TradeRoutesModelImpl;
export {};
