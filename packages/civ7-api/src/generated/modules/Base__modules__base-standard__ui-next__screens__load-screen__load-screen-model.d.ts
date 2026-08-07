export interface LoadCurtainClosedDetails {
    closed: boolean;
}
export declare const LoadCurtainClosedEventName = "load-curtain-closed-event";
export declare class LoadCurtainClosedEvent extends CustomEvent<LoadCurtainClosedDetails> {
    constructor(detail: LoadCurtainClosedDetails);
}
export declare function getCivLoadingInfo(): LoadingInfo_CivilizationDefinition | null;
export declare function getLeaderLoadingInfo(): LoadingInfo_LeaderDefinition | null;
export declare function createLoadScreenModel(): any;
