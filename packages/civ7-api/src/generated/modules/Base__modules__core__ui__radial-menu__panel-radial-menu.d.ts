/**
 * @file panel-radial-menu.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Gamepad enabled menu that allows radial selections.  Supports multiple-menus via tabs.
 */
export declare enum NavigationType {
    NONE = "",
    CONTEXT = "context",
    DIPLOMACY = "diplomacy",
    INTERFACE = "interface",
    FOCUS = "focus"
}
export interface Menu {
    title: string;
    items?: Item[];
}
export interface Item {
    title: string;
    subtitle: string;
    icon1: string;
    icon2: string;
    fgColor: string;
    bgColor: string;
    ratio: number;
    navigation: Navigation;
    tutHidderId: string;
    description: Function;
    onClick?: Function;
    positionDeg?: number;
    startDeg?: number;
    isHidden?: boolean;
    excludedAge?: AgeType;
}
export interface Navigation {
    type: NavigationType;
    value(): string;
    createsMouseGuard?: boolean;
    useSequencer?: boolean;
}
