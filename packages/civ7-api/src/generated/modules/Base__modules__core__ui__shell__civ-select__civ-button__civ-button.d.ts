/**
 * @file civ-button.ts
 * @copyright 2020-2024, Firaxis Games
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { CivData } from "/core/ui/shell/create-panels/age-civ-select-model.js";
export declare class CivButton extends FxsActivatable {
    private _civData;
    private _isSelected;
    private _isLocked;
    private iconEle;
    set isSelected(value: boolean);
    get isSelected(): boolean;
    set isLocked(value: boolean);
    get isLocked(): boolean;
    set civData(civData: CivData);
    get civData(): CivData;
    constructor(root: ComponentRoot<CivButton>);
}
declare global {
    interface HTMLElementTagNameMap {
        "civ-button": ComponentRoot<CivButton>;
    }
}
