/**
 * UI VFX Manager
 * @copyright 2020-2026, Firaxis Games
 *
 * Centralized manager that provides a simple interface for showing VFX in the UI.
 */
declare class UiVFXManager {
    private static instance;
    private uiVFXModelGroup;
    constructor();
    onReady(): void;
    addScreenVFX(vfxName: string, minXY: float2, maxXY: float2, constants?: Record<string, number | number[]>): void;
    addScreenVFXToRect(vfxName: string, controlRect: DOMRect, constants?: Record<string, number | number[]>): void;
    clearScreenVFX(): void;
    triggerScreenVFX(vfxName: string, minXY: float2, maxXY: float2, constants?: Record<string, number | number[]>): void;
    triggerScreenVFXToRect(vfxName: string, controlRect: DOMRect, constants?: Record<string, number | number[]>): void;
}
declare const UiVfx: UiVFXManager;
export { UiVfx };
