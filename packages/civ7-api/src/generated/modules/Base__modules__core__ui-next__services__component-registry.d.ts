import { Component } from "solid-js";
import { PreloadedImage } from "/core/ui-next/utilities/image-cache.js";
import { PreloadedStyle } from "/core/ui-next/utilities/style-cache.js";
type WrappedComponent<T extends Record<string, any>, U extends Component<T>> = {
    factoryName: string;
    factory: U;
    overridePriority: number;
    cachedImages: Promise<PreloadedImage[]> | undefined;
    cachedStyles: Promise<PreloadedStyle[]> | undefined;
} & U;
export declare const componentRegistered: any, setComponentRegistered: any;
export interface ComponentOptions<T extends Record<string, any>, U extends Component<T>> {
    name: string;
    createInstance: U;
    overridePriority?: number;
    styles?: string[];
    images?: string[];
}
/**
 * The Component Registry
 *
 * The component registry can be used to preload component resources and to generate overridable components
 *
 * To generate a component overrides, define a new component with the same name and higher priority:
 * ```tsx
 * export const OriginalComponent = ComponentRegistry.register("Original", Original);
 * <OriginalComponent /> // This will be an instance of OriginalComponent
 * ...
 * export const OriginalOverrideComponent = ComponentRegistry.register("Original", OriginalOverride, 1);
 * <OriginalComponent /> // This will be an instance of OriginalOverrideComponent
 * <OriginalOverrideComponent /> // This will be an instance of OriginalOverrideComponent
 * ```
 * In the example above, both OriginalComponent and OriginalOverrideComponent will create an OriginalOverrideComponent when called.
 */
declare class ComponentRegistryImpl {
    componentFactories: any;
    /**
     * Registers a component with the component registry.
     * Components can be overriden (for example, by mods) by setting a higher priority in options
     * See {@link ComponentRegistryImpl} for more info
     * ```ts
     * import exampleStyle from "component/example-component.scss?url";
     * export Example = RegisterComponent({
     *   name: "ExampleComponent",
     *   createInstance: ExampleComponent,
     *   images: ["blp:example-image.png", ...],
     *   styles: [exampleStyle, ...]
     *   overridePriority: 0
     * })
     * ```
     * @param options The component options to set
     * @returns The registered overridable component
     */
    register<T extends Record<string, any>, U extends Component<T>>(options: ComponentOptions<T, U>): U;
    /**
     * A simplified way to register a component if no options are required
     * ```ts
     * export Example = RegisterComponent("ExampleComponent", ExampleComponent);
     * ```
     * @param name The name of the component - only used for registration and overrides
     * @param createInstance The component factory function
     * @param overridePriority The component registered with the highest override priority will be used. Default: 0
     * @returns The registered overridable component
     */
    register<T extends Record<string, any>, U extends Component<T>>(name: string, createInstance: U, overridePriority?: number): U;
    /**
     * Gets a registered component from the component registry.
     * Will return a wrapper that points the component factory with the highest override priority.
     * @param name The name of the component to get
     * @returns The registered component or undefined if no registration was not found
     */
    get<T extends Record<string, any>, U extends Component<T>>(name: string): WrappedComponent<T, U> | undefined;
    /**
     * Returns a promise that resolved when all styles and images are preloaded for a give list of components
     * @param components The list of components to preload styles and images for
     * @returns A promise that resolves when all associated styles and images are loaded
     */
    preloadComponents(...components: WrappedComponent<any, any>[]): any;
    private wrapComponentFactory;
}
export declare const ComponentRegistry: ComponentRegistryImpl;
export {};
