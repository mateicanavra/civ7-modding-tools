/**
 * @file mp-browser-chooser-item.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Game chooser item for multiplayer browser screen.
 */
import { ChooserItem } from "/base-standard/ui/chooser-item/chooser-item.js";
import { ChooserNode } from "/base-standard/ui/chooser-item/model-chooser-item.js";
export declare const ActionConfirmEventName: "browser-item-action-confirm";
export declare class ActionConfirmEvent extends CustomEvent<never> {
    constructor();
}
export declare enum SortOptions {
    NONE = 0,
    GAME_NAME = 1,
    RULE_SET = 2,
    MAP_TYPE = 3,
    GAME_SPEED = 4,
    PLAYERS = 5,
    CONTENT = 6
}
export declare const mapSortOptionsToFlex: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
};
export interface MPBrowseChooserNode extends ChooserNode {
    gameName: string;
    eventName: string;
    ruleSet: string;
    mapType: string;
    gameSpeed: string;
    disabledContent: ModInfo[];
    mods: ModConfiguration[];
    players: string;
    savedGame: boolean;
    hostingPlatform: HostingType;
    hostFriendID_Native: string;
    hostFriendID_T2GP: string;
    hostDisplayName: string;
}
export declare class MPBrowserChooserItem extends ChooserItem {
    get mpBrowserChooserNode(): MPBrowseChooserNode | null;
    set mpBrowserChooserNode(value: MPBrowseChooserNode | null);
    private gameName;
    private event;
    private ruleSet;
    private mapType;
    private gameSpeed;
    private players;
    private crossplay;
    private background;
    private handleDoubleClick;
    private handleFocusIn;
    private handleActiveDeviceChange;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    render(): void;
    private updateData;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private onActiveDeviceChange;
    private isMissingMods;
    private isDisabled;
    private updateRoot;
    private updateBackground;
    private updateEvent;
    private updateCrossplay;
    private onFocusIn;
    private onDoubleClick;
}
declare global {
    interface HTMLElementTagNameMap {
        "mp-browser-chooser-item": ComponentRoot<MPBrowserChooserItem>;
    }
    interface HTMLElementEventMap {
        [ActionConfirmEventName]: ActionConfirmEvent;
    }
}
