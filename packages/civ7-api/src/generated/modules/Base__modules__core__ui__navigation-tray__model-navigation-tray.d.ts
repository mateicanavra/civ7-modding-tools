/**
 * @file model-navigation-tray.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Shows the button-hotkey association for activating items in a confined "tray" area.
 */
import { GameActionName } from "/core/ui-next/services/actionButtons.js";
export declare enum NavigationTrayOrientation {
    Column = 0,
    Row = 1
}
interface ActionStack {
    action: GameActionName;
    locKeys: string[];
}
declare class NavigationTrayModel {
    private isGamepadActive;
    private inputContextWorld;
    private activeDeviceTypeListener;
    /** List of actions keyed by the input action with a list of loc keys to display, most recently added is displayed */
    private actionStacks;
    /**
     * Persistent entries that are not cleared by {@link clear}.
     * Regular entries in actionStacks take priority over persistent ones for the same action.
     */
    private persistentActionStacks;
    private entries;
    private onUpdate?;
    private updateGate;
    constructor();
    get isTrayRequired(): boolean;
    get isTrayActive(): boolean;
    get isInputWorld(): boolean;
    private isEmpty;
    set updateCallback(callback: (model: NavigationTrayModel) => void);
    addOrUpdateGenericAccept(): void;
    removeGenericAccept(): void;
    addOrUpdateGenericOK(): void;
    removeGenericOK(): void;
    addOrUpdateGenericSelect(): void;
    addOrUpdateGenericDeselect(): void;
    removeGenericSelect(): void;
    addOrUpdateGenericBack(): void;
    removeGenericBack(): void;
    addOrUpdateGenericCancel(): void;
    removeGenericCancel(): void;
    addOrUpdateGenericClose(): void;
    removeGenericClose(): void;
    addOrUpdateAccept(key: string): void;
    removeAccept(): void;
    addOrUpdateCancel(key: string): void;
    removeCancel(): void;
    addOrUpdateShellAction1(key: string): void;
    removeShellAction1(): void;
    addOrUpdateShellAction2(key: string): void;
    removeShellAction2(): void;
    addOrUpdateShellAction3(key: string): void;
    removeShellAction3(): void;
    addOrUpdateNextAction(key: string): void;
    removeNextAction(): void;
    addOrUpdateNavPrevious(key: string): void;
    removeNavPrevious(): void;
    addOrUpdateNavNext(key: string): void;
    removeNavNext(): void;
    addOrUpdateNavShellPrevious(key: string): void;
    removeNavShellPrevious(): void;
    addOrUpdateNavShellNext(key: string): void;
    removeNavShellNext(): void;
    addOrUpdateNavMove(key: string): void;
    removeNavMove(): void;
    addOrUpdateNavBeam(key: string): void;
    removeNavBeam(): void;
    addOrUpdateToggleTooltip(key: string): void;
    removeToggleTooltip(): void;
    /**
     * Add or update a persistent entry that survives {@link clear} calls.
     * Regular entries added via {@link addOrUpdateEntry} take priority over persistent entries for the same action.
     */
    addPersistentEntry(key: string, action: GameActionName): void;
    /**
     * Remove the most recently added persistent entry for the given action.
     * If no persistent entries remain for the action, it is removed from the persistent list.
     */
    removePersistentEntry(action: GameActionName): void;
    addOrUpdateCameraPan(key: string): void;
    removeCameraPan(): void;
    addOrUpdateSysMenu(key: string): void;
    addOrUpdateCenterPlotCursor(key: string): void;
    addOrUpdateNotification(key: string): void;
    removeSysMenu(): void;
    getActionStack(action: string): {
        actionStack?: ActionStack;
        actionStackIndex: number;
    };
    private getPersistentActionStack;
    addOrUpdateEntry(key: string, action: GameActionName): void;
    removeEntry(action: string): void;
    clear(): void;
    private update;
    private onActiveDeviceTypeChanged;
    private onActiveContextChanged;
    private onInputActionBinded;
    private onInputContextChanged;
}
declare const NavTray: NavigationTrayModel;
export { NavTray as default };
