/**
 * @file utilities-data.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Utilties for working with custom data types and classes
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare class DatabaseCache {
    private dbName;
    private dbChanges;
    private dbCachedResults;
    constructor(dbName: Database.DbName);
    query(sql: string): Database.DbRow[];
    private checkCache;
    protected wipeCache(): void;
}
export declare namespace TradeRoute {
    function isWithCity(route: TradeRoute, cityId: ComponentID | null): boolean;
    function getOppositeCity(route: TradeRoute, cityId: ComponentID): City | null;
    function getCityPayload(route: TradeRoute, cityId: ComponentID): TradeRoutePayload | null;
}
/**
 * Get a global parameter an guarantees to return a number.
 * @param name Name of the global parameter to grab.
 * @returns -1 if value doesn't exist, otherwise the value stored.
 */
export declare function getGlobalParamNumber(name: string): number;
