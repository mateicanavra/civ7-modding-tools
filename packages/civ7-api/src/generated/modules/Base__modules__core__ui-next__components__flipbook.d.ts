import { Component, JSX } from "solid-js";
export interface TextureAtlas {
    /** Path/url to texture atlas */
    src: string;
    /** Width (pixels) of each sprite within the sheet */
    spriteWidth: number;
    /** Height (pixels) of each sprite within the sheet */
    spriteHeight: number;
    /** Length (pixels) of atlas. Assumes atlas is a square */
    size: number;
    /** Number of frames inside the atlas. If undefined, will assume that the entire atlas is filled */
    nFrames?: number;
}
export interface FlipbookProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** An array of texture atlases used as the source of the animation frames */
    atlas: TextureAtlas[];
    /** The frames per second of the animation */
    fps: number;
}
export type FlipbookComponents = Component<FlipbookProps> & {
    /**
     * A Turning Hourglass Flipbook
     * Default implementation: {@link HourglassComponent} Based on: {@link Flipbook}
     */
    Hourglass: Component<JSX.HTMLAttributes<HTMLDivElement>>;
};
/**
 * A Flipbook component
 * Used to show a sprite animation sourced from one or more texture atlases
 * Default implementation: {@link FlipbookComponent}
 * @param {FlipbookProps} props See {@link FlipbookProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {TextureAtlas[]} props.atlas An array of texture atlases used as the source of the animation frames
 * @param {boolean} props.fps The frames per second of the animation
 *
 * Predefined animations are included as properties:
 * {@link Flipbook.Hourglass}
 */
export declare const Flipbook: FlipbookComponents;
