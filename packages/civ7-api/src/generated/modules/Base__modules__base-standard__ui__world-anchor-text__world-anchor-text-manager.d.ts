/**
 * @file world-anchor-text-manager.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Manages the tracking and updating of the floating "world text" (aka: "float text") anchored messages.
 */
export interface AnchorTextInterface {
    getID(): number;
    setID(id: number): void;
}
declare class WorldAnchorTextManager extends Component {
    private children;
    private nextID;
    private static _instance;
    static get instance(): WorldAnchorTextManager;
    private hideListener;
    private showListener;
    /**
     * Onetime callback on creation.
     */
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onHideWorldAnchorTexts;
    private onShowWorldAnchorTexts;
    /**
     * Called by an instance of AnchorText to register it with the manager
     * @param child Anchor text object
     */
    addChildForTracking(child: AnchorTextInterface): void;
    /**
     * Called by an instance of AnchorText to register it with the manager
     * @param child Anchor text object
     */
    removeChildFromTracking(child: AnchorTextInterface): void;
    /**
     * Listener to a message from game core.
     * @param data The world text message
     */
    private onWorldTextMessage;
    private localPlayerChangedListener;
}
export { WorldAnchorTextManager as default };
