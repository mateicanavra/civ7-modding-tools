/**
 * @file input-events.ts
 * @copyright 2026, Firaxis Games, Inc.
 */
export interface ActiveDeviceTypeChangedEventDetail {
    deviceType: InputDeviceType;
    gamepadActive: boolean;
}
export declare const ActiveDeviceTypeChangedEventName: "active-device-type-changed";
export declare class ActiveDeviceTypeChangedEvent extends CustomEvent<ActiveDeviceTypeChangedEventDetail> {
    constructor(deviceType: InputDeviceType, gamepadActive: boolean);
}
export interface MoveSoftCursorEventDetail {
    status: InputActionStatuses;
    x: number;
    y: number;
}
export declare class MoveSoftCursorEvent extends CustomEvent<MoveSoftCursorEventDetail> {
    constructor(status: InputActionStatuses, x: number, y: number);
}
declare global {
    interface WindowEventMap {
        "active-device-type-changed": ActiveDeviceTypeChangedEvent;
        "move-soft-cursor": MoveSoftCursorEvent;
    }
}
