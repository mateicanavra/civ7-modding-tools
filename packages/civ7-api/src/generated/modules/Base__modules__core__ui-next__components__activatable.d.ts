import { type JSX } from "solid-js";
import { type InputEngineEvent } from "/core/ui/input/input-support.js";
export declare const PROTECTED_IMPORTS: any[];
export declare const EMPTY_ACTIVATABLE_AUDIO: ActivatableAudio;
export interface ActivatableAudio {
    /** Audio group override */
    group?: string;
    /** Audio override for when the activatable finishes activating */
    onActivate?: string;
    /** Audio override for when the activatable starts activating */
    onPress?: string;
    /** Audio override for when the activatable is unable to activate */
    onError?: string;
    /** Audio override for when the activatable gains controller focus */
    onFocus?: string;
}
export interface ActivatableProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     * The name to use as the component when resolving audio events.
     * Otherwise, will use props.name, or "Activatable" if that is not set.
     */
    audioComponentAlias?: string;
    /**
     * The name to use as the component when resolving VFX events.
     * Otherwise, will use props.name, or "Activatable" if that is not set.
     */
    vfxComponentAlias?: string;
    /** Audio overrides for this control - See {@link ActivatableAudio} for a full list. */
    audio?: ActivatableAudio;
    /** Is this control disabled for audio? It will produce error sounds as if the activatable were disabled. Default: false */
    disableAudio?: boolean;
    /** Is this control disabled both visually and for input? Default: false */
    disabled?: boolean;
    /** Is controller focus disabled for this control? Default: false */
    disableFocus?: boolean;
    /** Is controller visually disabled for this control? Default: false */
    disableVisual?: boolean;
    /** Should we suppress the pointer/disabled cursor? Used when activatables are present for gamepad purposes only. Default: false */
    suppressPointerChanges?: boolean;
    /** Is controller focus disabled for this control? Default: false */
    isFeedbackEnabled?: boolean;
    /** Disable trigger activation for this control. Default: false */
    disableTrigger?: boolean;
    /** The name of an input action which activates this component. This is only active when the activatable is focused. Default: accept */
    actionKey?: string;
    /** The name of a hotkey action which activates this component. This is active anywhere in the parent hotkey context. Default: undefined */
    hotkeyAction?: string;
    /** The name of the activatable; set as the data-name property - useful for debugging or searching the DOM tree. Default: Activatable */
    name?: string;
    /** The text which appears on the navTray with the given hotkeyAction. This will automatically hide this button. Default: undefined */
    navTrayText?: string;
    /** Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction */
    onActivate?: () => void;
    /** Event which triggers when this control loses controller focus */
    onBlur?: () => void;
    /** Event which triggers when this control gains controller focus */
    onFocus?: () => void;
    /** Auto focus this element? */
    autoFocus?: boolean;
    /** Engine input passthrough */
    "on:engine-input"?: (e: InputEngineEvent) => void;
}
/**
 * The base Activatable jsx component.
 * Used as the base for all components which require user interaction, like buttons and selectors.
 * Does not provide any style on its own.
 * ```tsx
 * // Example - Activatable Text
 * <Activatable onActivate={() => console.log("activated")}>I am activatable!</Activatable>
 * ```
 * Default implementation: {@link ActivatableComponent}
 * @param {ActivatableProps} props See {@link ActivatableProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {boolean} props.disabled Is this control disabled both visually and for input? Default: false
 * @param {string} props.hotkeyAction The name of a hotkey action which activates this component. Default: undefined
 * @param {string} props.name The name of the component set as the data-name property - useful for debugging or searching the DOM tree. Default: "Activatable"
 * @param {() => void} props.onActivate Event which triggers when the control is activated either through hotkey, mouse click, touch, or other user interaction. Default: undefined
 */
export declare const Activatable: any;
