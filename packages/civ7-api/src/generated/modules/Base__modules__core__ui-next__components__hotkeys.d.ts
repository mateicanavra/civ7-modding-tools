import { GameActionName } from "/core/ui-next/services/actionButtons.js";
export interface HotkeyDefinition {
    hotkeyAction: GameActionName;
    onActivate?: () => void;
    navTrayText?: string;
    disabled?: boolean;
}
export interface HotkeyProps {
    hotkeys: HotkeyDefinition[];
}
export declare const Hotkeys: any;
export interface InlineHotkeyProps extends HotkeyDefinition {
    class?: string;
}
export declare const InlineHotkey: any;
