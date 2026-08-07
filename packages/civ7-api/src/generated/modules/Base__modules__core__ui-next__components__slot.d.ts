import { Setter, type JSX } from "solid-js";
import { FocusContextProvider, FocusNavigationRulesMap, FocusSortOrder } from "/core/ui-next/services/focus.js";
export declare const PROTECTED_IMPORTS: any[];
export interface BaseSlotProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     * Name is used for debugging purposes. If unset, slot will just be called "VSlot" or "HSlot"
     */
    name?: string;
    /**
     * Is focus disabled for this slot?
     * Affects visual style of components within the slot.
     */
    disabled?: boolean;
    /**
     * Is focus disabled for this slot?
     * Does not Affect the visual style of components within the slot.
     */
    disableFocus?: boolean;
    /**
     * Determines the sort order of focusables in the slot
     * Note: Sort order is not reactive after initilization
     */
    sortOrder?: FocusSortOrder;
    /**
     * Should navigation be reversed?
     */
    isNavigationReversed?: boolean;
    /**
     * When true, navigation is locked to this slot and cannot escape.
     * All navigation attempts will be marked as handled.
     */
    lockNavigation?: boolean;
    /**
     * Setter that gets called with the focus context for the slot
     */
    setFocusContext?: Setter<FocusContextProvider | undefined>;
    /**
     * Auto focus this element?
     * Note: This must initially be set to true or false to react to changes
     * If set to undefined initally, this will NOT register updates.
     */
    autoFocus?: boolean;
}
export interface SlotProps extends BaseSlotProps {
    /**
     * The name of the slot; set as the data-name property - useful for debugging or searching the DOM tree. Default: Activatable
     */
    name?: string;
    /**
     * A map of focus navigation rules used to define the behavior of the slot.
     */
    navRules: FocusNavigationRulesMap;
}
/**
 * The base slot component. Should not be used directly, except by other slot implmentations.
 * Default implementation: {@link SlotComponent}
 * @param {BaseSlotProps} props See {@link BaseSlotProps} for a full list of properties
 */
export declare const Slot: any;
/**
 * The vertically oriented slot component.
 * Allows for controller navigation horizontally.
 * ```tsx
 * <VSlot>
 * ...
 * </VSlot>
 * ```
 * Default implementation: {@link VSlotComponent}
 * @param {SlotProps} props See {@link SlotProps} for a full list of properties
 */
export declare const VSlot: any;
/**
 * The horizontally oriented slot component.
 * Allows for controller navigation horizontally.
 * ```tsx
 * <HSlot>
 * ...
 * </HSlot>
 * ```
 * Default implementation: {@link HSlotComponent}
 * @param {SlotProps} props See {@link SlotProps} for a full list of properties
 */
export declare const HSlot: any;
export interface SpatialSlotProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     * Is focus disabled for this slot?
     * Affects visual style of components within the slot.
     */
    disabled?: boolean;
    /**
     * Is focus disabled for this slot?
     * Does not Affect the visual style of components within the slot.
     */
    disableFocus?: boolean;
    /**
     * The name of the slot; set as the data-name and section-id. Must be set for spatial slots.
     */
    name: string;
    /**
     * Auto focus this element?
     */
    autoFocus?: boolean;
}
export declare const SpatialSlot: any;
