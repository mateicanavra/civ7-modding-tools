import { JSX, ParentComponent } from "solid-js";
import { PropsRef } from "/core/ui-next/utilities/solid-utilities.js";
export interface WorldAnchorProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "ref"> {
    /** The plot coordinate to anchor to. */
    location: PlotCoord;
    /** A 3d pixel offset above the anchor location. Default: `{ x: 0, y: 0, z: 0 }` */
    offset?: float3;
    /** How the anchor should be placed relative to terrain/water. Default: `PlacementMode.TERRAIN` */
    placement?: PlacementMode;
    ref?: PropsRef<HTMLDivElement>;
    /** Passes through to the portal */
    mount?: Node | string;
}
/**
 * Wraps its children in an element that is positioned in screen space to follow a fixed
 * plot location in the 3d world.
 */
export declare const WorldAnchor: ParentComponent<WorldAnchorProps>;
