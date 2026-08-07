/**
 * @file framework.ts
 * @copyright 2021-2024, Firaxis Games
 * @description A central storage location for singleton 'manager' instances and entry point into the UI framework.
 */
import type ContextManager from "/core/ui/context-manager/context-manager.js";
import type DialogManager from "/core/ui/dialog-box/manager-dialog-box.js";
declare const Framework: {
    readonly ContextManager: typeof ContextManager;
    readonly DialogManager: typeof DialogManager;
};
export declare function setContextManager(value: typeof ContextManager): void;
export declare function setDialogManager(value: typeof DialogManager): void;
export { Framework };
