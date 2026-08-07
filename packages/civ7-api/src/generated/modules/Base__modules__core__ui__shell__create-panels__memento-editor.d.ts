/**
 * @file memento-editor.ts
 * @copyright 2024, Firaxis Games
 * @description Allows selection of mementos
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import Panel from "/core/ui/panel-support.js";
export declare class Memento extends FxsActivatable {
    private _mementoData?;
    private iconEle;
    private focusRing;
    private selectionRing;
    private _selected;
    set mementoData(value: MementosUIData | undefined);
    get mementoData(): MementosUIData | undefined;
    set selected(value: boolean);
    get selected(): boolean;
    constructor(root: ComponentRoot<Memento>);
    setHidden(isHidden: boolean): void;
    setAvailable(isAvailable: boolean): void;
    private updateData;
}
export declare class MementoEditor extends Panel {
    private readonly isMobileExperience;
    private outerSlot;
    private headerText;
    private mementoSlotEles;
    private activeSlot?;
    private mementosData;
    private mementoEles;
    private confirmButton;
    private cancelButton;
    private engineInputListener;
    private navigateInputListener;
    constructor(root: ComponentRoot<MementoEditor>);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    setPanelOptions(_panelOptions: object): void;
    private sortMementos;
    private applySelections;
    private selectNextSlot;
    private selectPreviousSlot;
    private selectSlotOffset;
    private handleSlotSelected;
    private handleMementoSelected;
    private filterMementos;
    private confirmSelections;
    private cancelSelections;
    private onNavigateInput;
    private onEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "memento-item": ComponentRoot<Memento>;
        "memento-editor": ComponentRoot<MementoEditor>;
    }
}
