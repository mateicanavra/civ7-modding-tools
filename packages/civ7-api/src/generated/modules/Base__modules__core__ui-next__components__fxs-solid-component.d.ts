import { JSXElement } from "solid-js";
export type SolidRenderFunction = (attrs: Readonly<Record<string, string | null>>, element?: Element) => JSXElement;
export interface LegacySolidComponentOptions {
    attrs?: Record<string, string | null>;
    classNames?: string[];
    calleeURLOrPriority?: string | number;
    tabIndex?: number;
    initializeImmediately?: boolean;
}
export declare class SolidAdapterContextProvider {
    readonly rootElement: ComponentRoot<FxsSolidComponent>;
    constructor(rootElement: ComponentRoot<FxsSolidComponent>);
}
export declare const SolidAdapterContext: any;
declare class FxsSolidComponent extends Component {
    private dispose;
    private onActivatableFocusEventListener;
    private reactiveAttrs;
    private children;
    onAttach(): void;
    onAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null): void;
    onDetach(): void;
    onFocus(): void;
    onReceiveFocus(): void;
}
/***
 * Wraps a solid component into a legacy component
 * @param name - The name of the legacy component to create
 * @param options - The component options to use when registering the component
 *   - attrs - A list of attributes with defaults the legacy component can have
 *             These will be tracked reactively and provided to the render function
 *   - classNames - A list of class names to apply to the legacy component
 *   - calleeURLOrPriority - A URL or priority, used in determining override order of the legacy component
 *   - tabIndex - The tab index to apply to the legacy component
 * @param renderFunction - The solid js component render function
 *   - This will be called in a reactive scope
 *   - The first parameter attr is a reactive proxy to the legacy component attributes - these must first be defined in options.attrs.
 *   - The second paramter element is the root element of the legacy component
 */
export declare function defineLegacyComponent(name: string, options: LegacySolidComponentOptions, renderFunction: SolidRenderFunction): void;
export {};
