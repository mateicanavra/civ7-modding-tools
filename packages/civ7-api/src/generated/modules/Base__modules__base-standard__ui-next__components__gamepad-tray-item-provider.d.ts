import { GameActionName } from "/core/ui-next/services/actionButtons.js";
export interface GamepadTrayItemAudio {
    /** Audio override for when the activatable finishes activating */
    onActivate?: string;
    /** Audio override for when the activatable starts activating */
    onPress?: string;
    /** Audio override for when the activatable is unable to activate */
    onError?: string;
}
export interface GamepadTrayItem {
    /** The name of the gamepad tray item; set as the data-name property in an inner div in the Activatable component -
     * useful for debugging or searching the DOM tree. */
    name: string;
    /** The name of a hotkey action which activates this component. */
    hotkeyAction: GameActionName;
    /** The text which appears on the navTray with the given hotkeyAction. */
    navTrayText: string;
    /** Event which triggers when the control is activated through hotkey. Leave undefined to show an item in the
     * tray that is handled elswhere */
    onActivate?: () => void;
    /** Audio overrides for this item - See {@link GamepadTrayItemAudio} for a full list. */
    audio?: GamepadTrayItemAudio;
}
export declare const GamepadTrayItemProvider: any;
