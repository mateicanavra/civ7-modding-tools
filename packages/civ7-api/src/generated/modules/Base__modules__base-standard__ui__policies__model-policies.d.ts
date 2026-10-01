/**
 * @file Policies Screen Model
 * @copyright 2020-2026 Firaxis Games
 * @description Handles data for policies and traditions
 */
import { Accessor, Setter } from "solid-js";
import { FocusContextProvider } from "/core/ui-next/services/focus.js";
export interface PolicyCardContext {
    activePolicies: TraditionDefinition[];
    availablePolicies: TraditionDefinition[];
    activeTraditions: TraditionDefinition[];
    availableTraditions: TraditionDefinition[];
    activeCrisisPolicies: TraditionDefinition[];
    availableCrisisPolicies: TraditionDefinition[];
    newCards: TraditionDefinition[];
    numSlots: number;
    policySlots: number;
    tradSlots: number;
    crisisSlots: number;
    canSwapPolicies: boolean;
    canSwapCrisis: boolean;
    confirmDisable: boolean;
    onCardClick: (card: TraditionDefinition, active: boolean, tradSlot: boolean) => void;
    onConfirmClick: () => void;
    onCloseClick: () => void;
    isSmallScreen: () => boolean;
    clearArrays: () => void;
    canSlotCard: (card: TraditionDefinition) => boolean;
    setActiveFocus: Setter<FocusContextProvider | null>;
    getActiveFocus: Accessor<FocusContextProvider | null>;
    setAvailablePolicyFocus: Setter<FocusContextProvider | null>;
    getAvailablePolicyFocus: Accessor<FocusContextProvider | null>;
    setAvailableTraditionFocus: Setter<FocusContextProvider | null>;
    getAvailableTraditionFocus: Accessor<FocusContextProvider | null>;
    autoFocusCard: number;
}
export declare enum PolicyCardIdeology {
    NONE = 0,
    COMMUNISM = 1,
    DEMOCRACY = 2,
    FASCISM = 3,
    TRADITION = 4
}
export interface AvailablePolicyProps {
    data: TraditionDefinition[];
}
export interface ActivePolicyProps {
    data: TraditionDefinition[];
}
export declare function createPoliciesModel(): any;
export declare const PoliciesModel: any;
export declare const PoliciesModelContext: any;
export declare function usePoliciesModelContext(): any;
