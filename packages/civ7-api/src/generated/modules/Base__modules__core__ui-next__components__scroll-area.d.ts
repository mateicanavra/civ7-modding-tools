import { Setter } from "solid-js";
import type { JSX } from "solid-js";
export interface ScrollAreaBaseProps {
    /** Initial scroll in percentage(0-100) */
    initialScroll?: number;
    /** The minimum thumb height as a percentage of the scroll bar track height. Default: 20  */
    minThumbHeight?: number;
    /** The default pan rate as a percentage of the scroll bar height. Default:  0.75 */
    panRate?: number;
    /** Allow the gamepad to pan the scroll area. Default: true */
    allowGamepadPan?: boolean;
    /** Allow the mouse to click and drag to pan the scroll area. Default: false */
    allowMousePan?: boolean;
    /** Use the current input proxy context as input. Default: false */
    useProxy?: boolean;
    /** Is the space for the scrollbar track reserved (true) or does content overlap it when the track is hidden (false)? Default: false  */
    reserveSpace?: boolean;
    /** (Setter) The current scroll percentage */
    setScroll?: Setter<number>;
    /** (Setter) Set to true when the scroll thumb is at the bottom of the track */
    setIsAtBottom?: Setter<boolean>;
    /** (Setter) Set to true when the scroll area track is visible */
    setIsTrackVisible?: Setter<boolean>;
    /** (Setter) Scroll area width */
    setClientWidth?: Setter<number>;
    /** (Setter) Scroll area height */
    setClientHeight?: Setter<number>;
}
export type ScrollAreaProps = ScrollAreaBaseProps & JSX.HTMLAttributes<HTMLDivElement>;
export declare const ScrollAreaContext: any;
/**
 * A vertically scrollable area.
 * ```tsx
 * <ScrollArea>
 * ... Long list of stuff ...
 * </ScrollArea>
 * ```
 * Default implementation: {@link ScrollAreaComponent}
 * @param {ScrollAreaProps} props See {@link ScrollAreaProps} for a full list of properties
 */
export declare const ScrollArea: any;
