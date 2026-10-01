/**
 * @file fxs-flipbook.ts
 * @copyright 2024, Firaxis Games
 * @description Flipbook animation component.
 */
/** Constructor parameters for FlipBook */
export interface FlipbookDefinition {
    fps: number;
    preload: boolean;
    atlas: FlipbookFrame[];
}
export interface FlipbookFrame {
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
/**
 * Flipbook animation class. Utilizes one (or multiple) texture atlases for its animation.
 * @example
 * ```
 * // Single texture atlas
 * const flipbook = new FlipBook(['./img/hourglasses00.png', 128, 128, 1024, 45], 60);
 *
 * // Multiple atlases
 * const flipbook = new FlipBook([
 *      ['./img/hourglasses01.png', 128, 128, 512],
 *      ['./img/hourglasses02.png', 128, 128, 512],
 *      ['./img/hourglasses03.png', 128, 128, 1024, 13]
 * ], 60);
 *
 * // after adding to DOM
 * flipbook.run();
 * ```
 */
export declare class FxsFlipBook extends Component {
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
    /** Is the flipbook animating or not */
    private isRunning;
    /** Get current animation frame */
    get getFrame(): number;
    onAttach(): void;
    onDetach(): void;
    /**
     * @remarks This will not add the flipbook to DOM, only register the texture atlas data. If preload is true it will also load in the images (but not show them).
     * @param atlas Either a single texture atlas or multiple atlases
     * @param fps Frames per second of the animation
     * @param preload Whether or not the texture atlases should be preloaded
     */
    createFlipbook(atlas: FlipbookFrame[], fps: number, preload?: boolean): void;
    /** Callback for when this is added to DOM. Will automatically draw the first frame. */
    private connectedCallback;
    /** Start the animation. If the animation is already running, {@link FlipBook.restart | restart}. */
    run(): void;
    /** Restarts the animation. */
    restart(): void;
    /** Stops the animation. */
    end(): void;
    /**
     * Skips to a certain frame. Will not change whether or not the animation is running.
     * @param frame Frame to go to
     */
    goto(frame: number): void;
    /** Pauses the current animation. */
    pause(): void;
    /** Resumes the current animation. */
    resume(): void;
    /** Utility function to toggle between paused/unpaused. */
    toggleRunning(): void;
    /** Shows the flipbook */
    show(): void;
    /** Hides the flipbook and pauses it. */
    hide(): void;
    /** Creates the internal update loop. */
    private spawnInterval;
    /**
     * Renders a frame on screen.
     * @param f Frame to render
     */
    private drawFrame;
}
