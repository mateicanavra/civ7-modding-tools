/**
 * @file panel-support.ts
 * @description Definition for Panel, main class for UI contexts.
 * @copyright 2020-2021, Firaxis Games
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
/**
 *  0 = None    1 = Absolute
 *  ___ _____ _____ _____ ___
 * |   |     |     |     |   |
 * |   |  2  |  3  |  4  |   |
 * |   |_____|_____|_____|   |
 * |   |     |     |     |   |
 * |11 |  5  |  6  |  7  | 12|
 * |   |_____|_____|_____|   |
 * |   |     |     |     |   |
 * |   |  8  |  9  | 10  |   |
 * |___|_____|_____|_____|___|
 *
 */
export declare enum AnchorType {
    None = 0,
    Absolute = 1,
    RelativeToTopLeft = 2,
    RelativeToTop = 3,
    RelativeToTopRight = 4,
    RelativeToLeft = 5,
    RelativeToCenter = 6,
    RelativeToRight = 7,
    RelativeToBottomLeft = 8,
    RelativeToBottom = 9,
    RelativeToBottomRight = 10,
    SidePanelLeft = 11,
    SidePanelRight = 12,
    Auto = 15,
    Fade = 16
}
export default class Panel extends Component {
    protected animateInType: AnchorType;
    protected animateOutType: AnchorType;
    protected enableOpenSound: boolean;
    protected enableCloseSound: boolean;
    private documentClosePanelListener;
    private static animInStyleMap;
    private static animOutStyleMap;
    private isClosingRecursionGuard;
    private inAttach;
    inputContext: InputContext;
    /** CTOR */
    constructor(root: ComponentRoot);
    static onDefined(name: string): void;
    /** Called once per creation, and immediately before the first time the component is initialized. */
    onInitialize(): void;
    /** Called each time the component is re-attached to the DOM */
    onAttach(): void;
    postOnAttach(): void;
    onDetach(): void;
    generateOpenCallbacks(_callbacks: Record<string, OptionalOpenCallback>): void;
    protected requestClose(inputEvent?: InputEngineEvent): void;
    protected close(uiViewChangeMethod?: UIViewChangeMethod): void;
    /** Called if the panel was pushed in the Context Manager with a panelOptions object */
    setPanelOptions(_panelOptions: object): void;
    getPanelContent(): string;
    /**
     * Plays the animate in sound assigned to this object.
     */
    protected playAnimateInSound(): void;
    /**
     * Plays the animate out sound assigned to this object.
     */
    playAnimateOutSound(): void;
    /** Apply CSS classes to animate this panel in. */
    protected applyDefaultAnimateIn(): void;
    /** Apply CSS classes to animate this panel out. */
    protected applyDefaultAnimateOut(): void;
    /**
     * Determine an animation type to assicate with this panel based on
     * how it is decorated by style classes.
     * @returns {AnchorType} Type of animation enum based on classes.
     */
    private getAnimationByInspectingClasses;
    /** Return debugging human-friendly string of info. */
    toString(): string;
}
