/**
 * @file model-radial-menu.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Underlying data model for the gamepad radial menu.
 */
declare class RadialMenuModel {
    private canUseRadialMenu;
    private engineInputListener;
    private interfaceModeChangedListener;
    private onUpdate?;
    private updateGate;
    set updateCallback(callback: (model: RadialMenuModel) => void);
    /**
     * Does the player have at least one city?
     * @returns true if player has 1 or more cities, false otherwise
     */
    private isAtLeastOneCity;
    private isTutorialDisabled;
    constructor();
    private update;
    private onEngineInput;
    private onCityInitialized;
    private onUpdateTutorialLevel;
    private onInterfaceModeChanged;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleEngineInput;
}
declare const RadialMenu: RadialMenuModel;
export { RadialMenu as default };
