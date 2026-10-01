import { InputEngineEvent } from "/core/ui/input/input-support.js";
import Panel from "/core/ui/panel-support.js";
export declare class ScreenPauseMenuBootstrap extends Panel {
    private dispose;
    onInitialize(): void;
    onEngineInput(event: InputEngineEvent): void;
    onAttach(): void;
    onDetach(): void;
}
