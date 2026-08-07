/**
 * @file screen-events.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Show available online events
 */
import Panel from "/core/ui/panel-support.js";
export declare const EventsScreenGoSinglePlayerEventName: "screen-events-sp";
declare class EventsScreenGoSinglePlayerEvent extends CustomEvent<never> {
    constructor();
}
export declare const EventsScreenLoadEventName: "screen-events-loading";
export declare const EventsScreenContinueEventName: "screen-events-continue";
export declare const EventsScreenGoMultiPlayerEventName: "screen-events-mp";
declare class EventsScreenGoMultiPlayerEvent extends CustomEvent<never> {
    constructor();
}
export declare class ScreenEvents extends Panel {
    private closeButtonListener;
    private singlePlayerListener;
    private loadListener;
    private multiPlayerListener;
    private engineInputListener;
    private activeLiveEventListener;
    private connIcon;
    private connStatus;
    private accountStatus;
    private carouselMain;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    close(): void;
    private onSinglePlayer;
    private onLoadEvent;
    private onContinueEvent;
    private onActiveLiveEvent;
    private onMultiPlayer;
    private updateText;
    private onEngineInput;
    private hideMultiplayerStatus;
    private showMultiplayerStatus;
}
declare global {
    interface HTMLElementEventMap {
        [EventsScreenGoSinglePlayerEventName]: EventsScreenGoSinglePlayerEvent;
        [EventsScreenGoMultiPlayerEventName]: EventsScreenGoMultiPlayerEvent;
    }
}
export {};
