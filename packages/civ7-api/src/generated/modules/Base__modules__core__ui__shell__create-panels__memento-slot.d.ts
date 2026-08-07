/**
 * @file memento-slot.ts
 * @copyright 2024, Firaxis Games
 * @description Displays information for a given memento slot
 */
import { FxsActivatable } from "/core/ui/components/fxs-activatable.js";
import { MementoSlotData } from "/core/ui/shell/create-panels/leader-select-model.js";
export declare const MementoSlotSelectedEventName = "memento-slot-selected";
export declare class MementoSlot extends FxsActivatable {
    private backgroundEle;
    private iconEle;
    private labelEle;
    private _slotData?;
    private _slottedMemento?;
    private _selected;
    private mementoDisplayData;
    set slotData(value: MementoSlotData | undefined);
    get slotData(): MementoSlotData | undefined;
    set selected(value: boolean);
    get selected(): boolean;
    constructor(root: ComponentRoot<MementoSlot>);
    setActiveMemento(mementoId: string): boolean;
    private updateCurrentMemento;
    private getMementoSlotIcon;
    private getToolTip;
    private getLabel;
}
declare global {
    interface HTMLElementTagNameMap {
        "memento-slot": ComponentRoot<MementoSlot>;
    }
}
