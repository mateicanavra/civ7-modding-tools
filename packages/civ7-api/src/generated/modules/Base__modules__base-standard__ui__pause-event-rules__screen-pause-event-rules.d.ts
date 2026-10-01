/**
 * @file screen-pause-event-rules.ts
 * @copyright 2020-2025, Firaxis Games
 * @description Pause event rules panel to remind players of the rules for whatever event they're playing.
 */
import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
export declare class ScreenPauseEventRules extends Panel {
    private closeButtonListener;
    private engineInputListener;
    private dismissButton;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    protected onEngineInput(inputEvent: InputEngineEvent): void;
    private render;
}
