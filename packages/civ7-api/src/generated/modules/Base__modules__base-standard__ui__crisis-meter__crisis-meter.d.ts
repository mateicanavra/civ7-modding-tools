/**
 * @file crisis-meter.ts
 * @copyright 2025, Firaxis Games
 * @description Crisis ring meter control that shows when a crisis will occur on the ring
 */
import { FxsRingMeter } from "/core/ui/components/fxs-ring-meter.js";
export declare class CrisisMeter extends FxsRingMeter {
    static readonly stages: readonly [
        {
            readonly tooltip: "LOC_UI_POLICIES_CRISIS_BEGINS";
            readonly triggerPercent: any;
        },
        {
            readonly tooltip: "LOC_UI_POLICIES_CRISIS_INTENSIFIES";
            readonly triggerPercent: any;
        },
        {
            readonly tooltip: "LOC_UI_POLICIES_CRISIS_CULMINATES";
            readonly triggerPercent: any;
        }
    ];
    onInitialize(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "crisis-meter": ComponentRoot<CrisisMeter>;
    }
}
