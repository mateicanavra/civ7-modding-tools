/**
 * @file panel-mini-map.ts
 * @copyright 2021 - 2025, Firaxis Games
 * @description Mini-map panel, and lens/pennant dispaly
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { LensLayerName } from "/core/ui/lenses/lens-manager.js";
import Panel from "/core/ui/panel-support.js";
export declare class MinimapSubpanel extends Panel {
    constructor(root: ComponentRoot);
    close(): void;
}
declare class Subpanel {
    button?: ComponentRoot<FxsActivatable>;
    panel?: MinimapSubpanel;
    container: any;
    tag: keyof HTMLElementTagNameMap;
    constructor(tag: keyof HTMLElementTagNameMap);
}
export declare class PanelMiniMap extends Panel {
    readonly SMALL_SCREEN_MODE_MAX_HEIGHT = 768;
    readonly SMALL_SCREEN_MODE_MAX_WIDTH = 1800;
    private chatPanelState;
    private lensPanelState;
    private subpanels;
    private activeSubpanel;
    private subpanelContainer;
    private miniMapChatButton;
    private miniMapLensButton;
    private miniMapRadialButton;
    private miniMapButtonRow;
    private chatPanelNavHelp;
    private radialNavHelpContainer;
    private lensActionNavHelpContainer;
    private toggleLensActionNavHelp;
    private chatPanel;
    private lensPanel;
    private lensPanelComponent?;
    private chatScreen?;
    private multiplayerChatHandle;
    private readonly miniMapTopContainer;
    private mapHighlight;
    private mapImage;
    private mapLastCursor;
    private lastCursorPos;
    private lastMinimapPos;
    private mapHeight;
    private mapWidth;
    private mapTopBorderTiles;
    private mapBottomBorderTiles;
    private showHighlightListener;
    private hideHighlightListener;
    private resizeListener;
    private activeDeviceTypeListener;
    private toggleMiniMapListener;
    private hideMiniMapListener;
    private minimapImageEngineInputListener;
    private engineInputListener;
    private engineInputCaptureListener;
    private activeLensChangedListener;
    private readonly cursorUpdatedListener;
    private readonly socialPanelOpenedListener;
    private choosersVisible;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    addSubpanel<T extends keyof HTMLElementTagNameMap>(targetClassName: T, tooltipKey: string, iconPath: string): void;
    private onContextChange;
    private onActiveLensChanged;
    private panInProgress;
    private onMinimapImageEngineInput;
    private onSocialPanelOpened;
    private onCursorUpdated;
    private onEngineInput;
    private onEngineInputCapture;
    private updateChatNavHelp;
    private updateMinimapCamera;
    private isOpenRadialButtonVisible;
    private updateRadialButton;
    private updateLensButton;
    private updateRadialNavHelpContainer;
    private updateLensActionNavHelp;
    private onResize;
    private onActiveDeviceTypeChanged;
    private isScreenSmallMode;
    /**
     * Create the button to toggle the lens panel
     * @returns the button element
     */
    private createButton;
    /**
     * Create the button to toggle the chat panel
     * @returns the button element
     */
    private createMinimapChatButton;
    /**
     * Create the button to open the radial menu
     * @returns the button element
     */
    private createMinimapRadialButton;
    closeSubpanels(): void;
    toggleSubpanel(subpanel: Subpanel, force?: boolean): boolean;
    private createChatPanel;
    /**
     * Expand or collapse the chat panel
     * @returns true if panel should be expanded
     */
    toggleChatPanel: () => boolean;
    /**
     * Expand or collapse the lens panel
     * @returns true if panel should be expanded
     */
    toggleLensPanel: (force?: boolean) => boolean;
    private onHideMiniMap;
    private onShowHighlight;
    private onHideHighlight;
    private onToggleMiniMap;
}
export declare const ToggleMiniMapEventName = "toggle-mini-map-event";
export declare class ToggleMiniMapEvent extends CustomEvent<{
    value: boolean;
}> {
    constructor(value: boolean);
}
export declare const HideMiniMapEventName = "hide-mini-map-event";
export declare class HideMiniMapEvent extends CustomEvent<{
    value: boolean;
}> {
    constructor(value: boolean);
}
export declare class LensPanel extends MinimapSubpanel {
    private lensPanel;
    private readonly lensRadioButtonContainer;
    private readonly layerCheckboxContainer;
    private readonly miniMapLensDisplayOptionName;
    private lensRadioButtons;
    private lensElementMap;
    private layerElementMap;
    private onActiveLensChangedListener;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    createShowMinimapCheckbox(): any;
    createLayerCheckbox(caption: string, layerType: LensLayerName, tooltip?: string): void;
    createLensButton(caption: string, lens: string, group: string): void;
    close(): void;
    private onLensChange;
    private onActiveLensChanged;
    private onLensLayerEnabled;
    private onLensLayerDisabled;
}
declare global {
    interface HTMLElementTagNameMap {
        "lens-panel": ComponentRoot<LensPanel>;
    }
    interface HTMLElementEventMap {
        [ToggleMiniMapEventName]: ToggleMiniMapEvent;
        [HideMiniMapEventName]: HideMiniMapEvent;
    }
}
export {};
