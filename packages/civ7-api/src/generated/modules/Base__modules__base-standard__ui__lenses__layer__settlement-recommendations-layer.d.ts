/**
 * @file settlement-recommendations-layer.ts
 * @copyright 2024, Firaxis Games
 * @description Lens layer to recommended settlement locations for settler units
 */
import { ILensLayer } from "/core/ui/lenses/lens-manager.js";
export declare class SettlementRecommendationsLayer implements ILensLayer {
    static readonly instance: SettlementRecommendationsLayer;
    settlementRecommendations: GetBestSettleLocationsResult[];
    initLayer(): void;
    applyLayer(): void;
    removeLayer(): void;
    getRecommendationResult(x: number, y: number): GetBestSettleLocationsResult | undefined;
}
declare global {
    interface LensLayerTypeMap {
        "fxs-settlement-recommendations-layer": SettlementRecommendationsLayer;
    }
}
