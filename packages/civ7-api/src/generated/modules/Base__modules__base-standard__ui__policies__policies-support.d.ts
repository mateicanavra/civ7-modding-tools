/**
 * @file Helper functions and tools for policies, traditions and crises
 * @copyright 2026 Firaxis Games
 * @description Handles tabs for government panel
 */
export declare function getCivIconFromPolicy(card: TraditionDefinition): string;
export declare function getAdditionalPolicyIcon(card: TraditionDefinition): string;
export declare function getCivBGFromPolicy(card: TraditionDefinition): string;
export declare const calculateGovtCardHeights: (root: HTMLElement) => void;
export declare const activePolicyCards: any, setActivePolicyCards: any;
export declare const availablePolicyCards: any, setAvailablePolicyCards: any;
export declare const activeTraditionCards: any, setActiveTraditionCards: any;
export declare const availableTraditionCards: any, setAvailableTraditionCards: any;
export declare const activeCrisisCards: any, setActiveCrisisCards: any;
export declare const availableCrisisCards: any, setAvailableCrisisCards: any;
export declare const policiesFocus: any, setPolicySlotsFocused: any;
export declare const traditionsFocus: any, setTraditionSlotsFocused: any;
export declare const maxGovtCardHeight: any, setGovtCardHeight: any;
