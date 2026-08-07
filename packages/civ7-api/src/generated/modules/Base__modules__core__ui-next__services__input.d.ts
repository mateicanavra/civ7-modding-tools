/**
 * @file input.ts
 * @copyright 2026, Firaxis Games, Inc.
 * @description
 * Provides a context for tracking the active input device and layout in a Solid.js application.
 * It listens for changes in the input source and updates the active input device and layout accordingly.
 * It also provides utility functions to check which input device is currently active.
 * Additionally, it defines an EngineInputProxyProvider class that allows registering and unregistering handlers for engine input events.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export declare function useActiveInputContext(): any;
export declare const ActiveInputDevice: any;
export declare const ActiveInputDeviceLayout: any;
export declare const IsControllerActive: any;
export declare const IsTouchActive: any;
export declare const IsHybridActive: any;
export declare const IsKeyboardActive: any;
export declare const IsMouseActive: any;
export type EngineInputProxyHandler = (event: InputEngineEvent) => void;
export declare class EngineInputProxyProvider {
    private handlers;
    unregisterHandler(handler: EngineInputProxyHandler): void;
    registerHandler(handler: EngineInputProxyHandler): void;
    triggerEngineInput(event: InputEngineEvent): void;
}
export declare const EngineInputProxyContext: any;
