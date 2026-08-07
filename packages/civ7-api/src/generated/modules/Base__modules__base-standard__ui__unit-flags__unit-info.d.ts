/**
 * @file unit-info
 * @copyright 2021, Firaxis Games
 * @description Additional (3d model, Fx, etc..) UI for a unit's information
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
declare class Unit3DInfo {
    private componentID;
    private movementModelGroup;
    private _enabled;
    set enabled(isEnabled: boolean);
    constructor(componentID: ComponentID);
    Destroy(): void;
    /**
     * Place pips on the hex based on remaining movement.
     * @param movesRemaining
     */
    setMoves(movesRemaining: number): void;
    private get unit();
}
export { Unit3DInfo as default };
