import { JSX } from "solid-js";
import { FocusNavigationRulesMap } from "/core/ui-next/services/focus.js";
import { PropsRef } from "/core/ui-next/utilities/solid-utilities.js";
export declare class PanelStackContextProvider {
    private onChildClosed;
    constructor(onChildClosed: () => void);
    triggerChildClosed(): void;
}
export declare const PanelStackContext: any;
export interface PanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     *  The name of the panel. This is used for various tracking contexts like focus.
     *  Because of this, it should never be changed after initialization.
     */
    name: string;
    /** Sets the DOM class attribute  */
    class?: string;
    /** Gets a reference of the component. For more info see {@link https://docs.solidjs.com/concepts/refs Refs}  */
    ref?: PropsRef<HTMLDivElement>;
    /** The navigation order of the component. Default: Vertical */
    navRules?: FocusNavigationRulesMap;
    /** Gets the id of the panel. Should match the id used to push this panel into the context manager */
    id: string;
    /** The cancel input handler - if not set the default behavior is to close the panel */
    onCancelInput?: () => void;
    /** Auto focus this element? - default: true */
    autoFocus?: boolean;
    /** Automatically appy an input context when this view is active */
    inputContext?: InputContext;
    onContextChanged?: (activatedElement: Element, deactivatedElement: Element) => void;
}
/**
 * The parent component for all top-level screens and panels.
 * Sets up contexts for focus, input, tooltips and hotkeys.
 * Only a single panel will be active at any given time, allowing for controller and hotkey input.
 * Panels should not be nested.
 * ```tsx
 * <Panel name="tech-tree">
 *  ...
 * </Panel>
 * ```
 * Default implementation: {@link PanelComponent}
 * @param {PanelProps} props See {@link PanelProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.name The name of the panel. This is used for various tracking contexts like focus.
 */
export declare const Panel: any;
