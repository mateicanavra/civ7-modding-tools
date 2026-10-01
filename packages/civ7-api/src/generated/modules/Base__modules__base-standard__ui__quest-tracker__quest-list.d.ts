/**
 * @file quest-list.ts
 * @copyright 2023-2026, Firaxis Games
 * @description Abbreivated list of quest items.
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import Panel from "/core/ui/panel-support.js";
export declare class QuestList extends Panel {
    private questItemContainer;
    private questItemList;
    private questItemElements;
    private questVisibilityToggle;
    private bgQuestext;
    private questVisibilityNavHelp;
    private dirty;
    private listVisibilityToggleListener;
    private engineInputListener;
    private activeDeviceTypeListener;
    private updateListener;
    private readonly activeLensChangedListener;
    private visibleQuests;
    onInitialize(): void;
    private onEngineInput;
    onAttach(): void;
    onDetach(): void;
    private onActiveLensChanged;
    private onActiveDeviceTypeChanged;
    listVisibilityToggle(): void;
    private onUnitAddedRemoved;
    private queueUpdate;
    private updateQuestContainerVisibility;
    private updateQuestList;
    private updateGate;
    private onSelectQuest;
    private onCancelSelectQuest;
    private onPlayerTurnActivated;
    private render;
}
/**
 * QuestItemElement
 */
declare class QuestItemElement extends FxsActivatable {
    onInitialize(): void;
    render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "quest-list": ComponentRoot<QuestList>;
        "quest-item": ComponentRoot<QuestItemElement>;
    }
}
export {};
