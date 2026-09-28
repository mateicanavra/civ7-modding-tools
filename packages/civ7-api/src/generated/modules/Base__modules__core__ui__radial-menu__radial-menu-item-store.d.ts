/**
 * @file radial-menu-item-store.ts
 * @copyright 2026, Firaxis Games
 * @description Registration store for radial menu items. Allows modules to register menus and
 * items without coupling to the panel implementation.
 */
export declare enum NavigationType {
    NONE = "",
    CONTEXT = "context",
    DIPLOMACY = "diplomacy",
    INTERFACE = "interface",
    FOCUS = "focus"
}
export interface Navigation {
    type: NavigationType;
    value(): string;
    createsMouseGuard?: boolean;
    useSequencer?: boolean;
}
export interface RadialMenuItemDefinition {
    title: string;
    subtitle?: string;
    icon1?: string;
    icon2?: string;
    fgColor?: string;
    bgColor?: string;
    ratio?: number;
    navigation: Navigation;
    tutHidderId?: string;
    description?: () => string;
    sortOrder: number;
    excludedAge?: AgeType;
    requiredCapabilities?: HashId[];
    isHidden?: boolean;
}
export interface RadialMenuDefinition {
    symbol: symbol;
    title: string;
    sortOrder: number;
}
/** Reactive accessor for the full list of radial menu definitions. */
export declare const getRadialMenus: () => any;
/**
 * Registers a new radial menu tab. Any items previously registered against this symbol
 * via `registerRadialMenuItem` are flushed from the pending queue into the new menu.
 * @param definition - Menu definition including a caller-owned symbol and display title.
 */
export declare function registerRadialMenu(definition: RadialMenuDefinition): void;
/**
 * Clears all items from a registered radial menu.
 * @param menuSymbol - The symbol of the menu to clear.
 */
export declare function clearRadialMenuItems(menuSymbol: symbol): void;
/**
 * Registers an item into a radial menu identified by its symbol.
 * If the menu has not yet been registered, the item is held in a pending queue and
 * will be added automatically when `registerRadialMenu` is called with the matching symbol.
 * @param menuSymbol - The symbol of the target menu (e.g. `GameSymbol`).
 * @param item - The item definition to add.
 */
export declare function registerRadialMenuItem(menuSymbol: symbol, item: RadialMenuItemDefinition): void;
