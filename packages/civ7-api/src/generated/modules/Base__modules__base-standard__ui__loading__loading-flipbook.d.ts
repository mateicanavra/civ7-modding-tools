/**
 * @file loading-flipbook.ts
 * @copyright 2024, Firaxis Games
 * @description Flipbook animation component, bare metal version for loading screens.
 */
interface LoadingFlipbookDefinition {
    atlas: textureAtlas | textureAtlas[];
    fps: number;
}
/** Constructor parameters for FlipBook */
type textureAtlas = [
    /** Path/url to texture atlas */
    src: string,
    /** Width (pixels) of each sprite within the sheet */
    spriteWidth: number,
    /** Height (pixels) of each sprite within the sheet */
    spriteHeight: number,
    /** Length (pixels) of atlas. Assumes atlas is a square */
    size: number,
    /** Number of frames inside the atlas. If undefined, will assume that the entire atlas is filled */
    nFrames?: number
];
/** Internal Flipbook representation of each atlas' data */
interface _textureAtlas {
    /** Path/url to texture atlas */
    src: string;
    /** Width and height (pixels) of each sprite within the atlas */
    sprite: {
        width: number;
        height: number;
    };
    /** Maximum number of sprites the atlas can hold (atlas size / sprite width or height) */
    countMax: {
        x: number;
        y: number;
    };
    /** Number of frames in the atlas */
    nFrames: number;
    /** Length (pixels) of atlas. Assumes atlas is a square */
    size: number;
}
declare class FlipBook extends HTMLElement {
    /** Frames per second of animation */
    private fps;
    /** Internal representation of each atlas and their corresponding HTML element */
    private atlas;
    /** Total number of frames across all atlases */
    private nFrames;
    /** Current shown atlas. -1 means it has not yet initialized */
    private atlasIndex;
    /** Current frame (out of FlipBook.nFrames, not per atlas frames*/
    private frame;
    /** Internal update interval ID */
    private intervalId?;
    /** Root node */
    private root;
    /** Is the flipbook animating or not */
    private isRunning;
    /** Get current animation frame */
    get getFrame(): number;
    /**
     * @remarks This will not add the flipbook to DOM, only register the texture atlas data.
     * @param atlas Either a single texture atlas or multiple atlases
     * @param fps Frames per second of the animation
     */
    constructor();
    /** Callback for when this is added to DOM. Will automatically draw the first frame. */
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** Start the animation. If the animation is already running, {@link FlipBook.restart | restart}. */
    private run;
    /** Restarts the animation. */
    private restart;
    /** Creates the internal update loop. */
    private spawnInterval;
    /**
     * Renders a frame on screen.
     * @param f Frame to render
     */
    private drawFrame;
}
