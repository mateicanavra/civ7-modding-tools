/**
 * @file display-queue.ts
 * @copyright 2022, Firaxis Games
 * @description An interface for managers that queue important messages/events
 */
import { DisplayHideOptions, DisplayHideReason, DisplayRequestCategory, IDisplayHandler, IDisplayRequest, IDisplayRequestBase } from "/core/ui/context-manager/display-queue-manager.js";
export type { DisplayHideOptions, DisplayRequestCategory, IDisplayRequestBase };
export { DisplayHideReason };
export declare function displayRequestUniqueId(): number;
export declare abstract class DisplayHandlerBase<TDisplayRequestType extends IDisplayRequestBase = IDisplayRequestBase> implements IDisplayHandler<TDisplayRequestType> {
    protected _category: DisplayRequestCategory;
    protected _frontSubcategoryPriority: number;
    protected _backSubcategoryPriority: number;
    protected _categoryPriority: number;
    /**
     *
     * @param _category The category of this display handlers
     * @param defaultPriority The priority of this display handler
     */
    constructor(_category: DisplayRequestCategory, defaultPriority: number);
    /**
     * Updates the category priority of this handler
     * Note: Existing display requests will not have their priorities updated
     * @param priority The new priority
     */
    updateHandlerPriority(priority: number): void;
    /**
     * The category the display handler gets registered as
     */
    getCategory(): DisplayRequestCategory;
    /**
     * Sets priority and id for a given request, whenever a request is added to the queue.
     * May be called by other handlers to position elements nearby in the queue
     * @param request The request to set id and priority on
     */
    setRequestIdAndPriority(request: IDisplayRequestBase): void;
    /**
     * Can the given request be shown?
     * @param _request The request to check
     * @param _activeRequests The currently displayed requests
     * @returns
     */
    canShow(_request: TDisplayRequestType, activeRequests: readonly IDisplayRequest[]): boolean;
    /**
     * Can the given request be closed?
     * @param _request The request to check
     * @param _activeRequests The currently displayed requests
     * @returns
     */
    canHide(_request: TDisplayRequestType, _activeRequests: readonly IDisplayRequest[]): boolean;
    /**
     * Generates a new display request and adds it to the Display Queue
     * @param requestInfo The information used to generate the request
     * @returns The created request
     */
    addDisplayRequest(requestInfo?: Omit<TDisplayRequestType, keyof IDisplayRequest>, forceShow?: boolean): TDisplayRequestType;
    abstract show(request: TDisplayRequestType): void;
    abstract hide(request: TDisplayRequestType, options: DisplayHideOptions): void;
}
