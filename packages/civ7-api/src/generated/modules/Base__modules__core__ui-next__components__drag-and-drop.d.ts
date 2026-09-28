/**
 * Drag and Drop support for Solid-JS.
 *
 * Provides 3 components, <DragAndDrop>, <Draggable>, <Dropzone> that implements a system for dragging draggables and dropping them
 * into drop zones.
 *
 * This system is specifically engineered for dragging items and dropping into dropzones.  For simple draggables, consider using <DragHandle> instead as that will provide
 * the raw methods for dragging.
 *
 */
import { Accessor, JSX, type ParentComponent, type ParentProps } from "solid-js";
export interface DraggableData {
    /** An optional debug string. */
    debugId?: string;
    /** A unique identifier used by the internals of the drag-drop system. */
    id: symbol;
    /** The data payload of the draggable. */
    data: unknown;
}
export interface DropzoneData {
    /** An optional debug string. */
    debugId?: string;
    /** A unique identifier used by the internals of the drag-drop system. */
    id: symbol;
    /** The data payload of the dropzone. */
    data: unknown;
}
export declare enum DragEndStatus {
    /** The draggable was released but not into any drop zone. */
    Released = 0,
    /**
     * The drag operation was cancelled.
     * This could happen if the `disabled` flag is toggled mid-drag or if explicitly cancelled.
     * */
    Cancelled = 1,
    /**
     * The draggable was dropped into and accepted by a dropzone.
     */
    AcceptedByDropzone = 2,
    /**
     * The draggable was dropped into yet rejected by a dropzone.
     */
    RejectedByDropzone = 3
}
export type DragStartCallback = (draggable: DraggableData, position: {
    x: number;
    y: number;
}) => void;
export type DragEndCallback = (
/** The draggable. */
draggable: DraggableData,
/** The final status of the drag operation. */
status: DragEndStatus,
/** The referenced dropzone when the status is either `AcceptedByDropzone` or `RejectedByDropzone` */
zone?: DropzoneData,
/**
 * The position of the draggable when the operation ended.
 * This may not always be populated, depending on how the operation was aended.
 */
position?: {
    x: number;
    y: number;
}) => void;
export type DragDropCallback = (
/** The draggable being dropped. */
draggable: DraggableData,
/** The zone the draggable is dropped into.*/
dropzone: DropzoneData,
/** The position of the draggable as it was dropped. */
position?: {
    x: number;
    y: number;
},
/** The draggable is dropped into a position where it can't be dropped */
dropFailed?: boolean) => void;
export type DragDropPredicate = (draggable: DraggableData, dropzone: DropzoneData) => Accessor<boolean>;
export interface DragAndDropGlobalContextValue {
    /**
     * Disables all drag and drop systems within this context.
     */
    disabled: boolean;
    /**
     * Parent element of the overlay.
     */
    overlayParent: HTMLElement;
}
export declare const DragAndDropGlobalContext: any;
export declare const useDragAndDropGlobalContext: () => any;
export declare const DragAndDropContext: any;
export declare const useDragAndDropContext: () => any;
export declare function setElementPositionViaTopLeft(el: HTMLElement, x: number, y: number): void;
export declare function setElementPositionViaTransform(el: HTMLElement, x: number, y: number): void;
export declare const defaultSetElementPosition: typeof setElementPositionViaTransform;
export interface DragAndDropProps {
    /**
     * Optional callback invoked when a draggable starts to be dragged.
     * This is equivilent to `Draggable.onDragStart`.
     */
    onDragStart?: DragStartCallback;
    /**
     * Optional callback invoked when a draggable starts to be dragged.
     * This is equivilent to `Draggable.onDragEnd`.
     */
    onDragEnd?: DragEndCallback;
    /**
     * Optional.  Returns a boolean signal dictating if the draggable is allowed to be dropped into this zone.
     * NOTE: This method is invoked when dragging begins for each drop zone.
     */
    canDrop?: DragDropPredicate;
    /** Optional. Called when a draggable is dropped into a zone. */
    onDragDrop?: DragDropCallback;
    /**
     * Optional property to restrict movement of draggables.
     * Restriction can be bound to a specific axis, a specific rect, or function
     * Values are in pixels and are in client space.
     */
    restrict?: "x" | "y" | ((x: number, y: number) => {
        x: number;
        y: number;
    }) | {
        top: number;
        left: number;
        bottom: number;
        right: number;
    };
    /**
     * The parent to attach the draggable overlay elements to.
     * By default, this will fallback to `document.body` however it is good practice to specify this.
     */
    overlayParent?: HTMLElement;
    /**
     * Override the callback to adjust the overlay position.
     * There are several provided implementation exported.
     * If nothing is provided, the default implementation will be used.
     */
    setElementPosition?: (el: HTMLElement, x: number, y: number) => void;
    /**
     * Disables drag and drop functionality for all nested draggables and drop zones.
     * Default: false
     */
    disabled?: boolean;
    /**
     * Outputs debug messages to the console to help diagnose issues.
     */
    debugTrace?: boolean;
}
export declare const DragAndDrop: ParentComponent<DragAndDropProps>;
export declare const DraggableContext: any;
export declare const useDraggableContext: () => any;
export interface DraggableProps {
    /**
     * Optional debug string.  This is not directly used anywhere in the drag and drop system, but useful for debugging.
     */
    debugId?: string;
    /**
     * The payload of the draggable.  This typically contains data specific to the draggable.
     * It is recommended to include some sort of well-defined discriminator and type guards to assist in narrowing the type.
     */
    data?: unknown;
    /**
     * Optional.  Invoked when dragging begins.
     */
    onDragStart?: DragStartCallback;
    /**
     * Optional. Invoked when dragging ends.
     */
    onDragEnd?: DragEndCallback;
    /**
     * Returns a boolean signal dictating if the draggable is allowed to be dropped into this zone.
     * NOTE: This method is invoked when dragging begins for each drop zone.
     */
    canDrop?: DragDropPredicate;
    /** Optional. Called when a draggable is dropped into a zone. */
    onDragDrop?: DragDropCallback;
    /**
     * Disables the draggable, preventing it from being dragged.
     * Default: false
     */
    disabled?: boolean;
    /**
     * Makes the audio behave as if it were disabled.
     * Default: false
     */
    disableAudio?: boolean;
    /**
     * Style applied on the element left behind when dragging.
     * Default: false
     */
    ghostElementStyle?: string | JSX.CSSProperties;
    debugTrace?: boolean;
}
export declare const Draggable: ParentComponent<DraggableProps>;
interface DropzoneProps {
    /**
     * Optional debug string.  This is not directly used anywhere in the drag and drop system, but useful for debugging.
     */
    debugId?: string;
    /**
     * The payload of the draggable.  This typically contains data specific to the draggable.
     * It is recommended to include some sort of well-defined discriminator and type guards to assist in narrowing the type.
     */
    data?: unknown;
    /**
     * Returns a boolean signal dictating if the draggable is allowed to be dropped into this zone.
     * NOTE: This method is invoked when dragging begins.
     */
    canDrop?: DragDropPredicate;
    /** Optional. Called when a draggable is dropped into this zone. */
    onDragDrop?: DragDropCallback;
    /**
     * Optional.  Invoked when a draggable is over a zone.
     * NOTE: The order of these callbacks for nested zones is not guarenteed.
     * NOTE: For nested zones, when leaving a nested, `onOver` is not invoked for the parent zone a second time.
     */
    onDragOver?: (draggable: DraggableData, dropzone: DropzoneData, x: number, y: number) => void;
    /**
     * Optional. Invoked when a draggable leaves the zone.
     * NOTE: The order of these callbacks for nested zones is not guarenteed.
     * NOTE: When entering a nested tooltip, this callback is not invoked for the parent.
     */
    onDragLeave?: (draggable: DraggableData, dropzone: DropzoneData, x: number, y: number) => void;
    /**
     * If this is a nested dropzone and the draggable cannot be dropped into this zone, can it pass through to the parent zone?
     * Default: false
     */
    passthroughOnFailure?: boolean;
    /**
     * Disables the dropzone.
     * Default: false
     * No callbacks are invoked for disabled zones.
     * Nested drop zones will pass through to their parent zones.
     */
    disabled?: boolean;
    /** Optional. Passed to the div that wraps the dropzone. */
    class?: string;
    /** Optional. Passed to the div that wraps the dropzone. */
    classList?: {
        [k: string]: boolean | undefined;
    } | undefined;
    debugTrace?: boolean;
}
export declare const DropzoneContext: any;
export declare const useDropzoneContext: () => any;
export declare const Dropzone: ParentComponent<DropzoneProps>;
/**
 * Experimenting with typed components that will narrow the `unknown` data field to something specific across the board.
 */
export interface DraggableDataT<T> extends Omit<DraggableData, "data"> {
    data: T;
}
export interface DropzoneDataT<T> extends Omit<DropzoneData, "data"> {
    data: T;
}
export type DragStartCallbackT<T> = (draggable: DraggableDataT<T>, position: {
    x: number;
    y: number;
}) => void;
export type DragEndCallbackT<T> = (
/** The draggable. */
draggable: DraggableDataT<T>,
/** The final status of the drag operation. */
status: DragEndStatus,
/** The referenced dropzone when the status is either `AcceptedByDropzone` or `RejectedByDropzone` */
zone?: DropzoneData,
/**
 * The position of the draggable when the operation ended.
 * This may not always be populated, depending on how the operation was aended.
 */
position?: {
    x: number;
    y: number;
}) => void;
export type DragDropCallbackT<DraggableType, DropzoneType> = (
/** The draggable being dropped. */
draggable: DraggableDataT<DraggableType>,
/** The zone the draggable is dropped into.*/
dropzone: DropzoneDataT<DropzoneType>,
/** The position of the draggable as it was dropped. */
position?: {
    x: number;
    y: number;
},
/** The draggable is dropped into a position where it can't be dropped */
dropFailed?: boolean) => void;
export type DragDropPredicateT<DraggableType, DropzoneType> = (draggable: DraggableDataT<DraggableType>, dropzone: DropzoneDataT<DropzoneType>) => Accessor<boolean>;
export interface DraggablePropsT<DraggableDataType, DropzoneDataType> extends DraggableProps {
    /**
     * The payload of the draggable.  This typically contains data specific to the draggable.
     * It is recommended to include some sort of well-defined discriminator and type guards to assist in narrowing the type.
     */
    data: DraggableDataType;
    /**
     * Optional.  Invoked when dragging begins.
     */
    onDragStart?: DragStartCallbackT<DraggableDataType>;
    /**
     * Optional. Invoked when dragging ends.
     */
    onDragEnd?: DragEndCallbackT<DraggableDataType>;
    /**
     * Returns a boolean signal dictating if the draggable is allowed to be dropped into this zone.
     * NOTE: This method is invoked when dragging begins for each drop zone.
     */
    canDrop?: DragDropPredicateT<DraggableDataType, DropzoneDataType>;
    /** Optional. Called when a draggable is dropped into a zone. */
    onDragDrop?: DragDropCallbackT<DraggableDataType, DropzoneDataType>;
}
export interface DropzonePropsT<DraggableDataType, DropzoneDataType> extends DropzoneProps {
    /**
     * The payload of the draggable.  This typically contains data specific to the draggable.
     * It is recommended to include some sort of well-defined discriminator and type guards to assist in narrowing the type.
     */
    data: DropzoneDataType;
    /**
     * Returns a boolean signal dictating if the draggable is allowed to be dropped into this zone.
     * NOTE: This method is invoked when dragging begins.
     */
    canDrop?: DragDropPredicateT<DraggableDataType, DropzoneDataType>;
    /** Optional. Called when a draggable is dropped into this zone. */
    onDragDrop?: DragDropCallbackT<DraggableDataType, DropzoneDataType>;
    /**
     * Optional.  Invoked when a draggable is over a zone.
     * NOTE: The order of these callbacks for nested zones is not guarenteed.
     * NOTE: For nested zones, when leaving a nested, `onOver` is not invoked for the parent zone a second time.
     */
    onDragOver?: (draggable: DraggableDataT<DraggableDataType>, dropzone: DropzoneDataT<DropzoneDataType>, x: number, y: number) => void;
    /**
     * Optional. Invoked when a draggable leaves the zone.
     * NOTE: The order of these callbacks for nested zones is not guarenteed.
     * NOTE: When entering a nested tooltip, this callback is not invoked for the parent.
     */
    onDragLeave?: (draggable: DraggableDataT<DraggableDataType>, dropzone: DropzoneDataT<DropzoneDataType>, x: number, y: number) => void;
}
export declare function createTypedDraggable<T>(): (props: ParentProps<DraggableProps & {
    data: T;
}>) => any;
export declare function createTypedDropzone<T>(): (props: ParentProps<DropzoneProps & {
    data: T;
}>) => any;
export declare function createTypedDragAndDrop<DraggableDataType, DropzoneDataType>(): [
    ParentComponent<DragAndDropProps>,
    ParentComponent<DraggablePropsT<DraggableDataType, DropzoneDataType>>,
    ParentComponent<DropzonePropsT<DraggableDataType, DropzoneDataType>>
];
export {};
