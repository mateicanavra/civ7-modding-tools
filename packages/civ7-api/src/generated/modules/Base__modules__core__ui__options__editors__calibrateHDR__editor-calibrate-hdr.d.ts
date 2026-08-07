/**
 * @file editor-calibrate-hdr.ts
 * @copyright 2024, Firaxis Games
 * @description Displays and sets the HDR options.
 */
import Panel from "/core/ui/panel-support.js";
export declare const EditorCalibrateHDROpenedEventName: "editor-calibrate-hdr-opened";
declare class EditorCalibrateHDROpenedEvent extends CustomEvent<never> {
    constructor();
}
export declare const EditorCalibrateHDRClosedEventName: "editor-calibrate-hdr-closed";
declare class EditorCalibrateHDRClosedEvent extends CustomEvent<never> {
    constructor();
}
declare class EditorCalibrateHDR extends Panel {
    private engineInputListener;
    private confirmButtonListener;
    private hdrSliderChangedListener;
    private contrastBar;
    private brightness3dBar;
    private uiBrightnessBar;
    private CalibrateHDRSceneModels;
    private isClosing;
    onInitialize(): void;
    onAttach(): void;
    onReset(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    close(): void;
    private onDiscard;
    private onEngineInput;
    private onHdrOptionChanged;
    private build3DScene;
    private clear3DScene;
}
declare const EditorCalibrateHDRTagName = "editor-calibrate-hdr";
declare global {
    interface HTMLElementTagNameMap {
        [EditorCalibrateHDRTagName]: ComponentRoot<EditorCalibrateHDR>;
    }
}
declare global {
    interface WindowEventMap {
        [EditorCalibrateHDROpenedEventName]: EditorCalibrateHDROpenedEvent;
        [EditorCalibrateHDRClosedEventName]: EditorCalibrateHDRClosedEvent;
    }
}
export {};
