import { TtsExtension, TtsManager } from "/core/ui/accessibility/tts-manager.js";
export declare class TtsManagerTooltipExtension implements TtsExtension {
    private getActiveTooltip;
    checkGlobal(self: typeof TtsManager, addText: (text: string) => void): boolean;
    checkElement(self: typeof TtsManager, element: Element, addText: (text: string) => void): boolean;
}
