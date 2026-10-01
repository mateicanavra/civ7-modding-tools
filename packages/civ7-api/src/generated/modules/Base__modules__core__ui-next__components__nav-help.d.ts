import { JSX } from "solid-js";
export interface NavHelpProps {
    /** Sets the DOM class attribute  */
    class?: string;
    /** The name of the action to show the icon for  */
    actionName?: string;
    /**  Is the nav help disabled (hides the nav help)?  */
    disabled?: boolean;
    /** Use the specified input context instead of the active one. */
    inputContext?: InputContext;
    /** Enables hold animation using a ring meter. */
    isHoldAction?: boolean;
    /** Duration of the hold in milliseconds. Used to drive the ring meter fill animation. */
    holdTimeMs?: number;
}
export type KBMNavHelpProps = JSX.HTMLAttributes<HTMLDivElement> & {
    /** The name of the action to show the icon for */
    actionName: string;
    /** Is the nav help disabled (hides the nav help)? */
    disabled?: boolean;
    isHoldAction?: boolean;
    holdTimeMs?: number;
};
/**
 * A controller nav help component.
 * Used to display a helper icon for controller input.
 * If actionName is not set, it will attempt to use the hotkey action from the nearest Activatable ancestor (or other HotkeyIconContext).
 * ```tsx
 * // Example - Use icon from button hotkey
 * <Button hotkeyAction="shell-action-1"><NavHelp /></Button>
 * // Example - Specify icon directly
 * <NavHelp actionName="shell-action-1" />
 * ```
 * Default implementation: {@link IconComponent}
 * @param {IconProps} props See {@link IconProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.actionName The name of the action to show the icon for. Default: inherit from HotkeyIconContext
 * @param {string} props.disabled Is the nav help disabled (hides the nav help)? Default: false
 */
export declare const NavHelp: any;
/**
 * A keyboard/mouse nav help component.
 * Used to display helper icons for keyboard and mouse input.
 * For keyboard keys, displays the key character on top of a keyboard icon asset.
 * For mouse buttons, displays the appropriate mouse icon asset.
 * ```tsx
 * // Example
 * <KBMNavHelp actionName="keyboard-inspect-tooltip" class="size-6" />
 * ```
 * @param {KBMNavHelpProps} props See {@link KBMNavHelpProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.actionName The name of the action to show the icon for (required)
 * @param {string} props.class CSS classes to apply to the component
 * @param {boolean} props.disabled Is the nav help disabled (hides the nav help)? Default: false
 */
export declare const KBMNavHelp: any;
