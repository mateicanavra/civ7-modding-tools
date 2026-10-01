export interface AnimationProps {
    element: Element;
    time?: number;
    classname: string;
    startWithPrev?: boolean;
    remove?: boolean;
    offset?: number;
    callback?: () => void;
    target?: string;
}
export interface ChainedAnimation {
    timer: number;
    function: Function;
}
export declare function cancelAllChainedAnimations(jumpToEnd?: boolean): void;
export declare function getNumChainedAnimations(): number;
export declare function chainAnimation(...props: AnimationProps[]): Promise<number>;
export declare function findAnimationEnd(root: AnimationProps[], addDelay?: number): Promise<AnimationProps>;
export interface SpriteSheet {
    imageName: string;
    rows: number;
    cols: number;
    frames: number;
    startFrame?: number;
}
export declare namespace SpriteSheet {
    function from(source: SpriteSheet, startFrame: number, frames: number): SpriteSheet;
}
export declare class SpriteSheetAnimation {
    private element;
    private spriteSheet;
    private durationMs;
    private isRunning;
    private lastFrameTime;
    private elapsed;
    private frameHandler?;
    constructor(element: HTMLElement, spriteSheet: SpriteSheet, durationMs: number);
    start(spriteSheet?: SpriteSheet): void;
    stop(): void;
    private doFrame;
    private drawFrame;
}
