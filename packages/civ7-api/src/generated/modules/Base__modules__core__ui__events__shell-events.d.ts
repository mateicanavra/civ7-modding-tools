/**
 * @file shell-events.ts
 * @copyright 2020-2024, Firaxis Games
 * @description Event declaratons specific to the shell.
 */
export declare const GameCreatorOpenedEventName: "game-creator-opened";
export declare class GameCreatorOpenedEvent extends CustomEvent<never> {
    constructor();
}
export declare const GameCreatorClosedEventName: "game-creator-closed";
export declare class GameCreatorClosedEvent extends CustomEvent<never> {
    constructor();
}
export declare const StartCampaignEventName: "startCampaign";
export declare class StartCampaignEvent extends CustomEvent<never> {
    constructor();
}
export declare const SuspendCloseListenerEventName: "suspend-close-listener";
export declare class SuspendCloseListenerEvent extends CustomEvent<never> {
    constructor();
}
export declare const ResumeCloseListenerEventName: "resume-close-listener";
export declare class ResumeCloseListenerEvent extends CustomEvent<never> {
    constructor();
}
export declare const UpdateLiveNoticeEventName: "update-live-notice";
export declare class UpdateLiveNoticeEvent extends CustomEvent<never> {
    constructor();
}
export declare const MainMenuReturnEventName: "main-menu-return";
export declare class MainMenuReturnEvent extends CustomEvent<never> {
    constructor();
}
export declare const SendCampaignSetupTelemetryEventName: "send-campaign-setup-telemetry";
export declare class SendCampaignSetupTelemetryEvent extends CustomEvent<{
    event: CampaignSetupType;
    humanCount?: number | null;
    participantCount?: number | null;
}> {
    constructor(event: CampaignSetupType, humanCount?: number | null, participantCount?: number | null);
}
declare global {
    interface WindowEventMap {
        [GameCreatorOpenedEventName]: GameCreatorOpenedEvent;
        [GameCreatorClosedEventName]: GameCreatorClosedEvent;
        [StartCampaignEventName]: StartCampaignEvent;
        [SuspendCloseListenerEventName]: SuspendCloseListenerEvent;
        [ResumeCloseListenerEventName]: ResumeCloseListenerEvent;
        [SendCampaignSetupTelemetryEventName]: SendCampaignSetupTelemetryEvent;
    }
}
