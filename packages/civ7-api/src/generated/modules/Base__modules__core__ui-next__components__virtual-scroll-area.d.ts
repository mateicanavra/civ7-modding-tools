import { Accessor, JSX } from "solid-js";
import { ScrollAreaBaseProps } from "/core/ui-next/components/scroll-area.js";
export interface VirtualScrollAreaProps<T extends readonly unknown[], U extends JSX.Element> {
    /** The function which instantiates each item */
    children: (item: T[number], index: Accessor<number>) => U;
    /** The collection of items in the list */
    each: T;
    itemHeight: number;
    itemWidth?: number;
    scrollArea?: ScrollAreaBaseProps;
    class?: string;
}
/**
 * A vertically scrollable area.
 * ```tsx
 * <VirtualScrollArea itemHeight={200} each={() => items()}>
 *   {(item) => <ItemTemplate {...item} />}
 * </VirtualScrollArea>
 * ```
 * Default implementation: {@link VirtualScrollAreaComponent}
 * @param {VirtualScrollAreaProps} props See {@link VirtualScrollAreaProps} for a full list of properties
 */
export declare const VirtualScrollArea: any;
