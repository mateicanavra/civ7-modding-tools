import { type ComponentProps } from "solid-js";
import { type OrnateFrameProps } from "/core/ui-next/components/ornate-panel.js";
export declare const enum ScreenFrameCloseHandler {
    ContextManager = 0,
    PopupSequencer = 1
}
export interface ScreenFrameComponentProps extends ComponentProps<"div"> {
    name: string;
    panelContext: string;
    audioContext: string;
    ornatePanelData: OrnateFrameProps;
    onClosing?: () => void;
    title?: string;
    wip?: boolean;
    hideClose?: boolean;
    doNotStretch?: boolean;
    addYieldBar?: boolean;
    isFullscreen?: boolean;
    /**
     * Default is ContextManager.
     */
    closeHandler?: ScreenFrameCloseHandler;
    onContextChanged?: (activatedElement: Element, deactivatedElement: Element) => void;
}
export declare const ScreenFrame: any;
