import { Context, type JSX } from "solid-js";
import { Accessor } from "solid-js";
/**
 * Steps to create and use a trigger context:
 * 1. Create a new context with a provider value which implements TriggerHost, and handles triggers
 * 2. Create a trigger component by calling CreateTrigger() with the context from above
 * 3. Create your components in a way so the context contains a trigger which contains an activatable:
 *      <Context><Trigger><Activatable /></Trigger></Context>
 * 4. When the Activatable triggers a triggerable event, the context will also get triggered
 */
export declare enum TriggerType {
    Activate = 0,
    Focus = 1,
    Blur = 2
}
/**
 * The base interface for contexts which listen to triggers
 */
export interface TriggerHost {
    /**
     * Called when a trigger is activated
     * @param name The name of the trigger
     * @param type The type of the trigger
     * @param source The source (e.g., HTMLElement, PlotCoord) which activated the trigger
     */
    onTrigger(name: string, type: TriggerType, source: HTMLElement | undefined): void;
}
/**
 * Handles trigger activations.
 * Trigger events will bubble up the solid render tree, and trigger all matching trigger hosts along the way.
 */
export declare class TriggerActivationContextProvider {
    private host;
    private parent;
    readonly name: Accessor<string>;
    constructor(host: TriggerHost | undefined, parent: TriggerActivationContextProvider | undefined, name: Accessor<string>);
    trigger(type: TriggerType, source: HTMLElement | undefined): void;
}
export declare const TriggerActivationContext: any;
export interface TriggerProps extends JSX.HTMLAttributes<HTMLDivElement> {
    name: string;
}
/**
 * Creates a trigger element for a given trigger host context
 * @param context The trigger host context for this trigger - the host context determines what actions this trigger activates
 * @returns A Trigger component for the given trigger host context
 */
export declare function createTrigger<T extends TriggerHost>(context: Context<T | undefined>): ParentComponent<TriggerProps>;
