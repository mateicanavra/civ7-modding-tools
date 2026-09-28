/**
 * @file tts-manager.ts
 * @copyright 2024, Firaxis Games
 * @description Manages text to speech integration with the UI.
 */
import { IEngineInputHandler, InputEngineEvent, InputHandlerState, NavigateInputEvent } from "/core/ui/input/input-support.js";
export interface TtsExtension {
    checkGlobal(self: typeof TtsManager, addText: (text: string) => void): boolean;
    checkElement(self: typeof TtsManager, element: Element, addText: (text: string) => void): boolean;
}
declare class TtsManagerImpl implements IEngineInputHandler {
    private lastRequest;
    private readonly textElement;
    private textToSpeechOnHoverDelayMs;
    private textToSpeechOnHoverDelayHandle;
    private textToSpeechOnHoverTarget;
    private _isTtsSupported;
    private _isTextToSpeechOnHoverEnabled;
    private _isTextToSpeechOnChatEnabled;
    private extensions;
    private mouseOverListener;
    get isTtsSupported(): boolean;
    get isTextToSpeechOnHoverEnabled(): boolean;
    get isTextToSpeechOnChatEnabled(): boolean;
    registerWithContextManager(): void;
    handleHover(event: MouseEvent): void;
    handleInput(event: InputEngineEvent): InputHandlerState;
    handleNavigation(_navigationEvent: NavigateInputEvent): InputHandlerState;
    trySpeakElement(element: Element): void;
    private handleUpdateSettings;
    private handleSpeakRequest;
    private isTextContentElement;
    private queryScanFromBody;
    private reverseScanFromBody;
    private findNearestValidElement;
    private speakElement;
    private isElement;
    private isText;
    registerExtension(ttsExtension: TtsExtension): void;
    getElementInnerText(element: Element): any;
    private findText;
    private stopSpeaking;
}
export declare const TtsManager: TtsManagerImpl;
export {};
