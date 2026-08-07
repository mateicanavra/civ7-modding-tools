/**
 * @file view-city.ts
 * @copyright 2021 - 2024, Firaxis Games
 * @description When viewing a particular city.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import { IGameView, ViewCallback, ViewRules } from "/core/ui/views/view-manager.js";
export declare const FocusCityViewEventName: "focus-city-view";
interface FocusCityViewEventDetail {
    source: "right" | "left";
    destination: "left" | "left-queue" | "center" | "right";
}
export declare class FocusCityViewEvent extends CustomEvent<FocusCityViewEventDetail> {
    constructor(detail: FocusCityViewEventDetail);
}
export declare class CityView implements IGameView {
    getName(): string;
    getInputContext(): InputContext;
    getHarnessTemplate(): string;
    enterView(): void;
    exitView(): void;
    addEnterCallback(_func: ViewCallback): void;
    addExitCallback(_func: ViewCallback): void;
    /**
     * @returns true if still live, false if input should stop.
     */
    readInputEvent(inputEvent: InputEngineEvent): boolean;
    getRules(): ViewRules[];
    handleReceiveFocus(): void;
    handleLoseFocus(): void;
}
declare global {
    interface WindowEventMap {
        "focus-city-view": FocusCityViewEvent;
    }
}
export {};
