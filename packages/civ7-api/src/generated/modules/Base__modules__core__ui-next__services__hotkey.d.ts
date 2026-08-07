import { Accessor } from "solid-js";
import { InputEngineEvent, NavigateInputEvent } from "/core/ui/input/input-support.js";
import { GameActionName } from "/core/ui-next/services/actionButtons.js";
export declare class HotkeyContextProvider {
    private parentContext?;
    private hotkeyHandlers;
    private navTrays;
    private isActive;
    constructor(parentContext?: HotkeyContextProvider | undefined);
    mount(): void;
    cleanup(): void;
    registerHotkey(eventName: GameActionName, handler: () => void): void;
    unregisterHotkey(eventName: GameActionName): void;
    registerNavtray(eventName: GameActionName, description: string): void;
    unregisterNavtray(eventName: GameActionName): void;
    onInput(event: InputEngineEvent | NavigateInputEvent): boolean;
    hide(): void;
    show(): void;
    refresh(): void;
}
export interface HotkeyIconContextProvider {
    actionName: Accessor<string | undefined>;
    disabled: Accessor<boolean | undefined>;
}
export declare const HotkeyContext: any;
export declare const HotkeyIconContext: any;
export declare function useHotkeyContext(): any;
export type HotkeyArgs = Accessor<[
    GameActionName | undefined,
    () => boolean,
    (() => void) | undefined
]>;
export type NavTrayArgs = Accessor<[
    GameActionName | undefined,
    () => boolean,
    string | undefined
]>;
export declare function registerHotkey(element: HTMLElement, args: HotkeyArgs): void;
export declare function registerNavTray(element: HTMLElement, args: NavTrayArgs): void;
