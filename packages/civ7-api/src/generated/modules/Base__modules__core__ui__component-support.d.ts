/**
 * @file component-support.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Definition for Component, base class for all 2D UI pieces
 */
declare const USE_OLD_FOCUS_LISTENERS = true;
interface ILiteEvent<T> {
    on(handler: (data: T) => void): void;
    off(handler: (data: T) => void): void;
}
declare class LiteEvent<T> implements ILiteEvent<T> {
    private handlers;
    on(handler: (data: T) => void): void;
    off(handler: (data: T) => void): void;
    trigger(data: T): void;
    expose(): ILiteEvent<T>;
}
declare class Subject<T> {
    private _value;
    private handlers;
    constructor(_value: T);
    get value(): T;
    set value(data: T);
    on(handler: (data: T) => void): void;
    off(handler: (data: T) => void): void;
}
/**
 * Obtain the content of a resource in the background.
 * @param url The url of the resource to obtain.
 */
declare function asyncLoad(url: string): Promise<string>;
/**
 *
 */
declare const MAX_WAIT_TIMEOUT_MS: DOMHighResTimeStamp;
/**
 * Wait across frames until a value is no longer null.
 * @example this.waitUntilValue(() => { return componentRoot.component; }).then((component) => { console.log("component is not null!", component)});
 */
declare function waitUntilValue<T>(f: () => T | null, maxFrameCount?: number): Promise<NonNullable<T>>;
/**
 * Executes a function when an element with 'truncate' CSS class is has active text overflow.
 * @param element Element to check for ellipsis truncation
 * @param callback Function to execute if the ellipsis is active
 */
declare function executeWhenEllipsisIsActive(element: HTMLElement, callback: () => void): void;
/**
 * delays a callback by the specified number of frames.
 *
 * @param callback function to call after delay
 * @param count number of frames to delay by
 * @param callbackArguments arguments passed to callback function
 */
declare function delayByFrame<T extends unknown[]>(callback: (...params: T) => void, count?: number, ...callbackArguments: T): void;
declare const LAYOUT_FRAME_DELAY = 2;
declare function waitForLayout(callback: () => void): void;
declare function waitForLayout(): Promise<void>;
declare function handlePromiseRejection(reason: unknown): void;
/**
 * Common function or emptying out children; guarnteed to be the fastest.
 * @param container The HTML element to remove all children from.
 */
declare function removeAllChildren(container: HTMLElement): void;
interface ComponentPropertyDefinition {
    name: string;
    description?: string;
    readOnly?: boolean;
}
interface ComponentAttributeDefinition {
    name: string;
    description?: string;
    required?: boolean;
}
type stringOrFunction = string | (() => string[]);
interface ComponentDefinition {
    /** Warning: There is no inheritance mechanism here!
     * If a component inherits from another, its ComponentDefinition will NOT include anything from its base
     * but override it.
     * Said otherwise, ComponentDefinition attributes are mapped per component name
     * (cf. ComponentManager::define()) regardless of classes hierarchy.
     *
     * So ComponentDefinition attribute values to keep from the base class, such as 'tabIndex', will have
     * to be copied in the child class ComponentDefinition.
     *
     * Special case:
     * Thought we should avoid copying 'classNames' content from base to children classes.
     * Lookup for each CSS class could get expensive if there are too many and it could be in conflict
     * with the HUD custom layout feature.
     * If inheritance had to be tested, such as for FxsSlot classes in Navigation::isFocusable(),
     * we would have to add a dedicated attribute, such as 'slot', set during the base class initialization.
     */
    createInstance: new (root: ComponentRoot) => Component;
    /**
     * A helpful description of the component to assist with designer tools.
     */
    description?: string;
    /**
     * Optional list of URLs that reference required css files.
     * The component will not be fully initialized until all css files have been loaded in order to ensure accuracy.
     */
    styles?: string[];
    /**
     * Per-theme list of URLs that reference css files.
     * The component will not be fully initialized until all css files for the current theme have been loaded in order to ensure accuracy.
     * If a theme change occurs, the new theme's CSS files will be loaded automatically.
     */
    /**
     * Optional list of classnames that will automatically be added to the html element prior to initialization.
     */
    classNames?: string[];
    /**
     * Optional list of URLs that reference external content html files.
     * The component will not be fully initialized until all content has been loaded.
     * The content will be appended to the component prior to initialization.
     */
    content?: string[];
    /**
     * Similar to content, but for providing raw html, rather than a URL.
     */
    innerHTML?: string[];
    /**
     * An optional list of URLs or functions that reference image files.
     * These images will be pre-loaded and kept in cache on the DOM so that they
     * can be ready the moment the component is attached.
     */
    images?: stringOrFunction[];
    /**
     * HTML content that gets inserted into the component upon creation.
     * This property is updated with resolved data from the `content` property.
     */
    contentTemplates?: HTMLTemplateElement[];
    /**
     * Optional list of required components that must be defined prior to this component being used.
     * All components must be defined before the component will be initialized.
     */
    requires?: string[];
    /**
     * Annotates what components could possibly be opened by this component. The possibilities will be forwarded to the engine to
     * 	facilitate defining component relationships. This is required because we don't use a compilation step
     * 	to create a component hierarchy
     *
     * For each declared component, hooks will be supplied to declare at runtime whether a component is dependent. Also hooks will
     * 	be provided for opening the component
     */
    opens?: string[];
    /**
     * Declares a list of known attributes that the component may listen to.
     */
    attributes?: ComponentAttributeDefinition[];
    /**
     * If defined, component can take focus when using gamepad. (Value is typically -1)
     */
    tabIndex?: number;
    /**
     * Whether or not to skip the postOnAttach process that calls `onAttributeChanged` for each defined attribute.
     */
    skipPostOnAttach?: boolean;
    /**
     * This field is used to assist with overriding components.
     */
    priority?: number;
    /**
     * Initialize the component immediately.
     * This results in the web component being immediately initialized and would prevent any overriding behavior to happen.
     * This is rarely needed, usually only for components that may be used by the loading screen.
     */
    initializeImmediately?: boolean;
}
declare enum ActiveComponentCallback {
    Initialize = 0,
    Attach = 1,
    Detach = 2
}
/**
 * Base class for the HTML portion of components
 */
declare abstract class ComponentRoot<C extends Component = Component> extends HTMLElement {
    private _isInitialized;
    private _isMutator;
    private _component?;
    private _decorators;
    private _typeName;
    private whenCreatedListeners;
    private engineListenerHandles;
    private windowListeners;
    private mutationObserver;
    private mutationCallback;
    /**
     * Set when attach callbacks are invoked.
     * Used to prevent detach callbacks from getting unnecessarily called during rapid DOM manipulation.
     */
    private activeCallback;
    private isAttached;
    constructor(typeName: string);
    receiveFocus(): void;
    loseFocus(): void;
    destroy(): void;
    listenForEngineEvent(name: string, callback: (args: unknown) => void, context?: unknown): void;
    listenForWindowEvent(name: string, callback: (args: unknown) => void, useCapture?: boolean): void;
    redirectChildrenToContent(elOrFunc: HTMLElement | ((node: Node) => void)): void;
    private initialize;
    private cleanupEventisteners;
    private cleanupObservers;
    private doAttach;
    private doDetach;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(): void;
    /**
     * Returns the type's name of the component.
     * Use this instead of tagName since some browsers may alter the tag name.
     */
    get typeName(): string;
    /**
     * The main controller of the component.
     *
     * @throws if the component is not yet initialized. Make sure the element is connected to the DOM first.
     */
    get component(): C;
    /**
     * The main controller of the component.
     *
     * This value may be undefined if the component has not been connected to the DOM.
     */
    get maybeComponent(): C | undefined;
    /**
     * Additional decorators of the component.
     */
    get decorators(): ComponentDecorator[];
    /**
     * Determine if component has been through the initialization step.
     */
    get isInitialized(): boolean;
    /**
     * Call a function when the component has been created.
     */
    whenComponentCreated(func: (c: C) => void): void;
    private polyfillComponentCreatedEvent;
    /**
     * @deprecated Use `whenComponentCreated` instead.
     */
    get componentCreatedEvent(): {
        on: any;
    };
    /**
     * HTML DOM callback
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
}
interface SetActivatedComponentEventDetail {
    component: Component | null;
}
declare const SetActivatedComponentEventName: "set-activated-component";
declare class SetActivatedComponentEvent extends CustomEvent<SetActivatedComponentEventDetail> {
    constructor(component: Component | null);
}
interface ActivatedComponentChangeEventDetail {
    component: Component | null;
}
declare const ActivatedComponentChangeEventName: "activated-component-changed";
declare class ActivatedComponentChangeEvent extends CustomEvent<ActivatedComponentChangeEventDetail> {
    constructor(component: Component | null);
}
type OptionalOpenCallback = (() => void) | undefined;
interface UIAudioEvents {
    "audio-base": Record<string, string | undefined>;
    [group: string]: Record<string, string | undefined> | undefined;
}
declare class Component {
    static audio?: UIAudioEvents;
    protected _audioGroup?: string | null;
    private set audioGroup(value);
    private get audioGroup();
    private receiveFocusEventListener;
    private loseFocusEventListener;
    private detroyEventListener;
    constructor(root: ComponentRoot);
    readonly Root: ComponentRoot<this>;
    /**
     * @brief Is called when a component is resolved and properly defined
     * @param _name The defined name of the component
     */
    static onDefined(_name: string): void;
    /** Called each time the component is re-attached to the DOM */
    onAttach(): void;
    /** Called just after the onAttach()
     * THIS METHOD SHOULD NEVER BE OVERRIDDEN.
     * (but there is currently no such thing than "final" keyword in Typescript)
     * onAttach() should instead.
     * At minimum, overrides should ALWAYS call super.postOnAttach()
     */
    postOnAttach(): void;
    /** Called only once, and immediately before the first time the component is inititalize. */
    onInitialize(): void;
    /**
     * Plays the most specific sound associated with this component's audio group if it exists, otherwise plays the sound from 'audio-base'
     *
     * @param id the ui audio event name
     */
    playSound(id: string): void;
    /**
     * Plays the most specific sound associated with this component's audio group if it exists, otherwise plays the sound from 'audio-base'
     *
     * @param id the ui audio event name
     * @param idKeyAttr specfies an attribute to use to override the id
     *
     * @deprecated The standard group resolution should be used instead. For example,
     * override the `audio-activate` id by adding a new `data-audio-activate` key with the more specific sound to your audio group in audio-base.json
     */
    playSound(id: string, idKeyAttr: string): void;
    /** @description Component is disconnecting from the DOM, but may be re-attached later. (Do not assume destruction... yet.) */
    onDetach(): void;
    /** @description this component should be considered unable to be used for future use */
    Destroy(): void;
    /** @description Called when gamepad focus is given. */
    onReceiveFocus(): void;
    /** @description Called when gamepad focus is lost. */
    onLoseFocus(): void;
    initializeEventListeners(): void;
    cleanupEventListeners(): void;
    /**
     * Called when another component is activated
     * Only if the component registered himself in the 'set-activated-component' event
     * */
    onDeactivated(): void;
    /**
     * Called when an attribute changes.
     * NOTE: Attributes must be declared in the component definition in order to be called.
     * @param name The name of the attribute that changed.
     * @param oldValue The value before the change.
     * @param newValue The value after the change.
     */
    onAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null): void;
    /**
     * Return debugging human-friendly string of info.
     */
    toString(): string;
    /**
     * @summary
     */
    private notifyOpenAvailability;
    /**
     *  @summary Helper for generating an updated list of 'open' mappings from a component and executing
     * 	the right one. This function is only ever executed from an engine event, requiring debug support
     */
    private processOpenCallback;
    /**
     * @summary Creates a defaulted runtime object of the `open` values given at Component definition
     */
    private createCallbacksObject;
    /**
     * @summary A Component hook to allow associating a callback to the other components defined in the `Definition.opens` field.
     * @param callbacks A mapping of all the `opens` values to an undefined callback. Fills in the callback value if relevant
     *
     * NOTE: I would prefer to have the `Record` be a type dependent on the Component's definition,
     * 	but that requires refactoring the Component class to be a generic
     */
    generateOpenCallbacks(_callbacks: Record<string, OptionalOpenCallback>): void;
    /**
     * @summary Creates and populates a callback mapping with the latest state provided by the Component
     */
    private refreshCallbacksObject;
}
interface ComponentDecorator {
    readonly Root: ComponentRoot;
    beforeAttach(): void;
    afterAttach(): void;
    beforeDetach(): void;
    afterDetach(): void;
    /**
     * Called when an attribute changes.
     * NOTE: Attributes must be declared in the component definition in order to be called.
     * @param name The name of the attribute that changed.
     * @param oldValue The value before the change.
     * @param newValue The value after the change.
     */
    onAttributeChanged(name: string, oldValue: string, newValue: string): void;
}
type ComponentDecoratorProvider = (base: Component) => ComponentDecorator;
declare class ComponentData {
    private _definition?;
    private _whenInitialized;
    private _initialized_resolve;
    private _initialized_reject;
    private _isInitialized;
    private _isInitializing;
    private _decorators;
    private _decoratorsAdded;
    constructor();
    get isInitialized(): boolean;
    get isInitializing(): boolean;
    set isInitializing(v: boolean);
    get definition(): ComponentDefinition | undefined;
    set definition(v: ComponentDefinition | undefined);
    get whenInitialized(): Promise<ComponentDefinition>;
    resolveInitialization(): void;
    rejectInitialization(reason: string): void;
    getDecorators(): ComponentDecoratorProvider[];
    addDecorator(decorator: ComponentDecoratorProvider): void;
    get decoratorsAdded(): ILiteEvent<ComponentDecoratorProvider>;
}
declare const ComponentValueChangeEventName: "component-value-changed";
/**
 * ComponentValueChangeEvent is a custom event that is fired when a component's value changes.
 *
 * You can create type aliases for specific values:
 *
 * ```ts
 * type CheckboxValueChangedEvent = ComponentValueChangeEvent<{ value: boolean }>;
 * ```
 *
 * And then use it like this:
 *
 * ```ts
 * const event = new CheckboxValueChangedEvent({ value: true });
 * this.sendValueChange(event);
 * ```
 *
 * And then listen for it like this:
 *
 * ```ts
 * this.Root.addEventListener(ComponentValueChangeEventName, (event: CheckboxValueChangedEvent) => {
 *    console.log(`Checkbox value changed to ${event.detail.value}`);
 * });
 * ```
 */
declare class ComponentValueChangeEvent<T> extends CustomEvent<T> {
    constructor(detail: T);
}
interface HTMLElementEventMap {
    [ComponentValueChangeEventName]: ComponentValueChangeEvent<unknown>;
    [SetActivatedComponentEventName]: SetActivatedComponentEvent;
    [ActivatedComponentChangeEventName]: ActivatedComponentChangeEvent;
}
/**
 * ChangeNotificationComponent is the base class for components that can signal a value change.
 */
declare class ChangeNotificationComponent<T = unknown> extends Component {
    private valueChangeListener;
    /**
     * Set the external HTML element to be signaled when a value changes.
     * @param element that will listen for change
     */
    setValueChangeListener(element: HTMLElement | null): void;
    /**
     * Signal a value change event.
     * @param event The filled-out ComponentValueChangeEvent to send.
     * @returns true if the event was not cancelled.
     */
    sendValueChange<Detail extends T>(event: ComponentValueChangeEvent<Detail>): boolean;
}
interface PreloadedImage {
    URL: string;
    loaded: boolean;
    components: string[];
    image: HTMLImageElement;
    promise: Promise<void>;
}
declare class ImageCache {
    private _cachedImages;
    /**
     * Load an image.
     * @param url The url of the image to be loaded.
     * @param component The optional component referencing the image, used for debugging.
     * @returns A promise for when the image is loaded or null if the url is invalid.
     */
    loadImage(url: string, component?: string): Promise<void> | boolean;
    /**
     * Returns true if the image has successfully been loaded.
     */
    isImagePreloaded(url: string): boolean;
    unloadAllImages(): void;
}
declare class ComponentManager {
    private static _instance;
    private _sources;
    private _componentData;
    private _componentInitialized;
    private _imageCache;
    private constructor();
    static getInstance(): ComponentManager;
    /**
     * Provide a definition for a component.
     * Can only be called once per-component.
     * @param name The name of the component.
     */
    define(name: string, definition: ComponentDefinition): void;
    /**
     * Returns true if the component is fully defined.
     * @param name The name of the defined component.
     */
    isDefined(name: string): boolean;
    /**
     * Returns the definition of a component.
     * @param name The name of the defined component.
     */
    getDefinition(name: string): ComponentDefinition | undefined;
    /**
     * Returns all component definitions.
     */
    getDefinitions(): ComponentDefinition[];
    /**
     * Returns a promise that will be resolved when the component has been initialized.
     * @param name The name of the component to listen for.
     */
    whenInitialized(name: string): Promise<ComponentDefinition>;
    /**
     * Triggered when a component has been defined.
     */
    get componentInitialized(): ILiteEvent<string>;
    initializeComponents(): any;
    initializeComponent(name: string, data: ComponentData, shouldLog: boolean): any;
    /**
     * Appends a script to the body of the document with defer="true" and src set to the provided `source`.
     * @param source The source url to load.
     */
    loadSource(url: string, module?: boolean): Promise<void> | boolean;
    loadStyle(url: string): Promise<void> | boolean;
    /**
     * Returns true if the source has been loaded.
     * NOTE: The source string must be an equal match.
     * @param source The source url.
     */
    isSourceLoaded(source: string): boolean;
    /**
     * Preload an image.
     * @param url The url of the image to be preloaded.
     * @param component The component referencing the image, used for debugging.
     * @returns A promise for when the image is loaded or null if the url is invalid.
     */
    preloadImage(url: string, component: string): Promise<void> | boolean;
    /**
     * Returns true if the image has successfully been loaded.
     */
    isImagePreloaded(url: string): boolean;
    /**
     * Registers a decorator with a declared component.
     * NOTE: This will not construct a decorator existing component instances.
     * @param name The name of the component.
     * @param decorator A method to generate the decorator instance.
     */
    decorate(name: string, provider: ComponentDecoratorProvider): void;
    /**
     * Returns a list of all decorator providers for a given component.
     * @param name The name of the component.
     */
    getDecoratorProviders(name: string): ComponentDecoratorProvider[];
}
declare class LocalizationDataBoundAttributeHandler implements AttributeHandler {
    private state;
    /**
     * This will be executed only once per element when the attribute attached to it is bound with a model.
     * Set up any initial state, event handlers, etc. here.
     * @param element
     * @param value
     */
    init(element: HTMLElement, value: string): void;
    /**
     * This will be executed only once per element when the element is detached from the DOM.
     * Clean up state, event handlers, etc. here.
     * @param element
     */
    deinit(_element: HTMLElement): void;
    /**
     * This will be executed everytime that the model which the attribute is attached to is synchronized.
     * @param element
     * @param value
     */
    update(element: HTMLElement, value: string): void;
}
declare class ComponentDataBoundAttributeHandler implements AttributeHandler {
    /**
     * This will be executed only once per element when the attribute attached to it is bound with a model.
     * Set up any initial state, event handlers, etc. here.
     * @param element
     * @param value
     */
    init(element: HTMLElement, value: any): void;
    /**
     * This will be executed only once per element when the element is detached from the DOM.
     * Clean up state, event handlers, etc. here.
     * @param element
     */
    deinit(_element: HTMLElement): void;
    /**
     * This will be executed everytime that the model which the attribute is attached to is synchronized.
     * @param element
     * @param value
     */
    update(element: HTMLElement, value: any): void;
}
/**
 * A helper component to fetch snippets of html.
 */
declare const onFxsIncludeContentLoad_Success: CustomEvent;
declare const onFxsIncludeContentLoad_Fail: CustomEvent;
declare class FxsInclude extends HTMLElement {
    connectedCallback(): void;
}
declare const Controls: ComponentManager;
declare class Loading {
    private static processInitialScriptsRAF;
    static isInitialized: boolean;
    static whenInitialized: any;
    static runWhenInitialized(f: () => void): void;
    static isLoaded: boolean;
    static whenLoaded: any;
    static runWhenLoaded(f: () => void): void;
    static isFinished: boolean;
    static whenFinished: any;
    static runWhenFinished(f: () => void): void;
    private static onInitialScriptAdded;
}
declare function setComponentSupportSafeMargins(): void;
