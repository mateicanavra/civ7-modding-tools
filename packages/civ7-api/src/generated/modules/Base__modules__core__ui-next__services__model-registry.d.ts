import { Accessor } from "solid-js";
export declare enum ModelLifecycle {
    /** A single model will be created, shared and persisted */
    Singleton = 0,
    /** A single model will be created at any given time and shared. It will be destroyed when it is not in active use. */
    SharedInstance = 1,
    /** A new model will be created every time get is called on the model */
    PerInstance = 2
}
export interface ModelFactory<T extends Record<string, any>> {
    readonly get: Accessor<T>;
}
/**
 * The model Registry
 *
 * The model registry can be used to register and generate overridable models
 *
 * To generate a model override, define a new model with the same name and higher priority:
 * ```ts
 * export const OriginalModel = ModelRegistry.register("ModelName", ModelLifecycle.Singleton, () => modelInstance);
 * ...
 * export const OverrideModel = ModelRegistry.register("ModelName",  ModelLifecycle.Singleton, () => overrideInstance, 1);
 * ```
 * In the example above, both OriginalModel and OverrideModel will create an OverrideComponent when called.
 */
declare class ModelRegistryImpl {
    modelFactories: any;
    private rootDisposeFn;
    private isInitialized;
    constructor();
    /**
     * Registers a model with the model registry.
     * Models can be overriden (for example, by mods) by setting a higher priority in options
     * See {@link ModelRegistryImpl} for more info
     * ```ts
     * export const ExampleModel = ModelRegistry.register("ExampleModel", ModelLifecycle.PerInstance, createExampleModel), overridePriority: 0);
     * ```
     * @param name The name of the model - only used for registration and overrides
     * @param lifecycle Is the model a singleton or is it a per instance model?
     * @param factory The model factory function
     * @param overridePriority The model registered with the highest override priority will be used. Default: 0
     *
     * @returns The registered overridable component
     */
    register<T extends Record<string, any>>(name: string, lifecycle: ModelLifecycle, factory: () => T, overridePriority?: number): ModelFactory<T>;
    /**
     * Gets a registered model from the model registry.
     * Will return a model that points the model factory with the highest override priority.
     * @param name The name of the model to get
     * @returns The registered model or undefined if no registration was not found
     */
    get<T extends Record<string, any>>(name: string): ModelFactory<T> | undefined;
    /**
     * Cleans up the model registry solid root
     */
    destroy(): void;
    private updateModel;
    private resolveModel;
}
export declare const ModelRegistry: ModelRegistryImpl;
export {};
