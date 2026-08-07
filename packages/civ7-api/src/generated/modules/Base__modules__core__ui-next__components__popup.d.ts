import { JSX, ParentComponent, Setter } from "solid-js";
import { TriggerHost, TriggerProps, TriggerType } from "/core/ui-next/components/trigger.js";
export declare class PopupContextProvider implements TriggerHost {
    private _active;
    private _setActive;
    private _target;
    private _setTarget;
    private _isActive;
    private _output;
    private _setOutput;
    get isActive(): (name: string | undefined) => boolean;
    get target(): Accessor<any>;
    get active(): Accessor<string | undefined>;
    get output(): Accessor<any>;
    constructor();
    setOutput(element: HTMLDivElement): void;
    close(target?: string): void;
    onTrigger(name: string, type: TriggerType, target: HTMLElement | undefined): void;
}
export declare const PopupContext: any;
export declare function usePopupContext(): any;
export interface PopupProps {
    setPopupContext?: Setter<PopupContextProvider | undefined>;
}
export interface PopupOutputProps {
    class?: string;
}
export interface PopupItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The name of the tooltip. This is used for triggers and querries so it is not reactive and should not be changed after being set */
    name: string;
    /** The handler that gets called when this popup closes */
    onClose?: () => void;
    /** The handler that gets called when this popup opens */
    onOpen?: () => void;
}
export type PopupComponents = ParentComponent<PopupProps> & {
    /**
     * The tooltips trigger component.
     * Can be used to trigger the tooltip with the same name to be displayed.
     * By default, tooltips have no frame, use {@link Tooltip.Frame} to add a basic frame.
     * ```tsx
     * <Tooltip.Trigger name="example-tooltip">
     *   <Button>Hover Me</Button>
     * </Tooltip.Trigger>
     * <Tooltip name="example-tooltip">I am a tooltip</Tooltip>
     * ```
     * @param {TriggerProps} props See {@link TriggerProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.name The name of the tooltip to display.
     */
    Trigger: ParentComponent<TriggerProps>;
    Output: ParentComponent<PopupOutputProps>;
    Item: ParentComponent<PopupItemProps>;
};
/**
 * A custom tooltip component.
 * Can be used to display any information as a tooltip, relative to a trigger component.
 * ```tsx
 * <Tooltip.Trigger name="example-tooltip">
 *   <Button>Hover Me</Button>
 * </Tooltip.Trigger>
 * <Tooltip name="example-tooltip">I am a tooltip</Tooltip>
 * ```
 * Default implementation: {@link TooltipComponent}
 * @param {TooltipProps} props See {@link TooltipProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.name The name of the tooltip. This is used for triggers and querries so it is not reactive and should not be changed after being set
 */
export declare const Popup: PopupComponents;
