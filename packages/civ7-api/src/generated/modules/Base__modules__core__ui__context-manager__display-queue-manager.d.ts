export type DisplayQueueTag = string;
export type DisplayRequestId = number;
export type DisplayRequestCategory = string;
export declare enum DisplayHideReason {
    Close = 0,
    Reshuffle = 1,
    Suspend = 2
}
export interface DisplayHideOptions {
    reason: DisplayHideReason;
}
export interface IDisplayRequest {
    category: DisplayRequestCategory;
    id?: DisplayRequestId;
    priority?: number;
    subpriority?: number;
    disablesPausing?: boolean;
    forceShow?: boolean;
}
export interface IReadonlyDisplayRequest extends IDisplayRequest {
    readonly category: DisplayRequestCategory;
    readonly priority?: number;
    readonly subpriority?: number;
    readonly forceShow?: boolean;
}
export interface IDisplayHandler<TDisplayRequestType extends IDisplayRequest = IDisplayRequest> {
    /**
     * The category the display handler gets registered as
     */
    getCategory(): DisplayRequestCategory;
    /**
     * Updates the category priority of this handler
     * @param priority The new priority
     */
    updateHandlerPriority(priority: number): void;
    /**
     * Sets priority and id for a given request, whenever a request is added to the queue.
     * May be called by other handlers to position elements nearby in the queue
     * @param request The request to set id and priority on
     */
    setRequestIdAndPriority(request: TDisplayRequestType): void;
    /**
     * Can the given request be shown?
     * @param _request The request to check
     * @param _activeRequests The currently displayed requests
     * @returns
     */
    canShow(request: TDisplayRequestType, activeRequests: readonly IDisplayRequest[]): boolean;
    /**
     * Generates the UI required to show the given request
     * @param request The request to show
     */
    show(request: TDisplayRequestType): void;
    /**
     * Can the given request be closed?
     * @param _request The request to check
     * @param _activeRequests The currently displayed requests
     * @returns
     */
    canHide(request: TDisplayRequestType, activeRequests: readonly IDisplayRequest[]): boolean;
    /**
     * Removes shown UI for the the given request
     * @param request The request to hide
     */
    hide(request: TDisplayRequestType, options: DisplayHideOptions): void;
}
export interface IDisplayRequestBase extends IDisplayRequest {
    addToFront?: boolean;
}
type requestMatchCriteria = DisplayRequestCategory | DisplayRequestId | ((request: IDisplayRequest) => boolean);
/**
 * Manages the main display queue for transient displays
 */
declare class DisplayQueueManagerImpl {
    private updatePending;
    private _isSuspended;
    private debounceStallLeft;
    private curDebounceStall;
    private registeredHandlers;
    private activeRequests;
    private suspendedRequests;
    private queue;
    private loadingStartCurtainRemoveListener;
    /**
     * Gets the topmost active display request
     */
    get topDisplay(): IReadonlyDisplayRequest | undefined;
    /**
     * Gets all active displays
     */
    get activeDisplays(): readonly IReadonlyDisplayRequest[];
    /**
     * Constructs a new DisplayQueueManagerImpl
     */
    constructor();
    /**
     * Now safe to start processing the display queue, as the loading curtain has been removed.
     * Doing it before now has shown that it is possible for a popup to appear and immediately
     * be removed by the hardnesss change by the view manager.
     */
    onLoadingStartCurtainRemove(): void;
    /**
     * Registers a display request handler with the queue
     * @param handler The handler to register
     */
    registerHandler(handler: IDisplayHandler): void;
    /**
     * Gets a handler registered with the queue
     * @param queueCategory The category of the handler
     * @returns The found handler or undefined if none was found
     */
    getHandler(queueCategory: string): any;
    /**
     * Adds a display request to the queue
     * @param request The display request to add
     */
    add(request: IDisplayRequest): void;
    /**
     * Removes a display request from active, pending, or suspended requeusts
     * @param request The request to remove. If none is specified, the topmost request will be removed.
     * @returns True if the display request was sucessfully removed
     */
    close(request?: IDisplayRequest): boolean;
    /**
     * Removes matching active, pending and suspended display requests for a given criteria
     * @param criteria A category, request id, or selector function to match items
     * @returns A list of displays that were hidden
     */
    closeMatching(criteria: requestMatchCriteria): IDisplayRequest[];
    /**
     * Removes matching active requests for a given criteria
     * @param criteria A category, request id, or selector function to match items
     * @returns A list of display requests that were removed
     */
    closeActive(criteria: requestMatchCriteria): IDisplayRequest[];
    /**
     * Removes the topmost active request for a given criteria
     * @param criteria A category, request id, or selector function to match items
     * @returns True if an active request was removed and false otherwise
     */
    closeTopmost(criteria: requestMatchCriteria): boolean;
    /**
     * Finds matching active requests for a given criteria
     * @param criteria A category, request id, or selector function to match items
     * @returns A list of found display requests
     */
    findAll(criteria: requestMatchCriteria): IDisplayRequest[];
    isSuspended(): boolean;
    /**
     * Hides all active displays, and prevents new displays from being displayed
     * @returns True if all displays were suspended
     */
    suspend(): void;
    private resolveCriteria;
    private trySuspend;
    resume(): void;
    private update;
    private tryReshuffle;
    private tryShowNextQueueItem;
}
export declare const DisplayQueueManager: DisplayQueueManagerImpl;
export {};
