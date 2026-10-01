/**
 * @file popup-sequencer.ts
 * @copyright 2025, Firaxis Games
 * @description Provides a lightweight interface to the Display Queue so that simple popups can participate.
 */
import { PushProperties } from "/core/ui/context-manager/context-manager.js";
import { DisplayHandlerBase, DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
import { IDisplayRequest } from "/core/ui/context-manager/display-queue-manager.js";
export type PopupSequencerCallbackSignature = (userData: any | undefined) => void;
export interface PopupSequencerData extends IDisplayRequestBase {
    screenId: string;
    properties: PushProperties<any>;
    popupId?: string;
    panelOptions?: any;
    userData?: any | undefined;
    showCallback?: PopupSequencerCallbackSignature;
}
declare class PopupSequencerClass extends DisplayHandlerBase<PopupSequencerData> {
    private static instance;
    currentPopupData: PopupSequencerData | null;
    constructor();
    isShowing(): boolean;
    /**
     * @implements {IDisplayHandler}
     */
    show(request: PopupSequencerData): void;
    /**
     * @implements {IDisplayHandler}
     */
    hide(_request: PopupSequencerData, options?: DisplayHideOptions): void;
    closePopup: (screenId: string) => void;
    addDisplayRequest(requestInfo?: Omit<PopupSequencerData, keyof IDisplayRequest>, forceShow?: boolean): PopupSequencerData;
}
declare const PopupSequencer: PopupSequencerClass;
export { PopupSequencer as default };
