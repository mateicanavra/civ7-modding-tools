/**
 * @copyright 2025, Firaxis Games
 * @description Utilities for common functions when interacting with settlements.
 */
export declare function compareSettlementTypes(settlementAId: ComponentID, settlementBId: ComponentID, options?: {
    ascending: boolean;
}): any;
export declare function compareSettlementNames(settlementAId: ComponentID, settlementBId: ComponentID, options?: {
    ascending: boolean;
}): any;
export interface SettlementIconInfo {
    color: string;
    icon: string;
}
export declare function getSettlementIconInfo(cityId: ComponentID): SettlementIconInfo | null;
