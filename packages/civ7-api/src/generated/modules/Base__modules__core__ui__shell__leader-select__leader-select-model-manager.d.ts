/**
 * @file Leader Select Model Manager
 * @copyright 2022, Firaxis Games
 * @description Handles 3D models and animations for leader selection screen
 */
export declare enum LeaderSelectAnimation {
    vo = "VO_CharSelect",
    idle = "IDLE_CharSelect"
}
export declare const LeaderAnimationStateEventName = "leader-animation-state";
export interface LeaderAnimationStateEventDetail {
    lastState: string;
    newState: string;
}
export declare class LeaderAnimationStateEvent extends CustomEvent<LeaderAnimationStateEventDetail> {
    constructor(detail: LeaderAnimationStateEventDetail);
}
declare class LeaderSelectModelManagerClass {
    private static instance;
    private leaderSelectModelGroup;
    private leader3DModel;
    private leaderPedestalModelGroup;
    private pedestal3DModel;
    private currentLeaderAssetName;
    private _currentLeaderAnimationState;
    private isLeaderCameraActive;
    private leader3dMarker;
    private sequenceStartTime;
    private isVoPlaying;
    private isLeaderPicked;
    readonly SEQUENCE_DEBOUNCE_DURATION: number;
    private static readonly DEFAULT_CAMERA_POSITION;
    private static readonly DEFAULT_CAMERA_TARGET;
    private static readonly VO_CAMERA_CHOOSER_POSITION;
    private static readonly VO_CAMERA_CHOOSER_TARGET;
    private static readonly TRIGGER_HASH_ANIMATION_STATE_END;
    private static readonly TRIGGER_HASH_SEQUENCE_TRIGGER;
    private static readonly PEDESTAL_CHOOSER_POSITION;
    private static readonly PEDESTAL_CHOOSER_POSITION_SMALL_ASPECT_RATIO;
    private static readonly PEDESTAL_POSITION;
    private static readonly PEDESTAL_POSITION_SMALL_ASPECT_RATIO;
    private static readonly PEDESTAL_SCALE;
    private static readonly PEDESTAL_SCALE_SMALL_ASPECT_RATIO;
    private static readonly LEADER_CHOOSER_POSITION;
    private static readonly LEADER_CHOOSER_POSITION_SMALL_ASPECT_RATIO;
    private static readonly LEADER_POSITION;
    private static readonly LEADER_POSITION_SMALL_ASPECT_RATIO;
    private leaderAnimationJustStarted;
    private selectedLeaderActive;
    private leaderSequenceStepID;
    private _isRandomLeader;
    get isRandomLeader(): boolean;
    get currentLeaderAnimationState(): string;
    constructor();
    setGrayscaleFilter(): void;
    clearFilter(): void;
    private getLeaderAssetName;
    private getFallbackAssetName;
    private activateLeaderSelectCamera;
    private deactivateLeaderSelectCamera;
    private isSmallAspectRatio;
    showLeaderModels(leaderId: string): void;
    zoomInLeader(): void;
    zoomOutLeader(): void;
    pickLeader(): void;
    clearLeaderModels(): void;
    handleTriggerCallback(id: number, hash: number): void;
    playLeaderAnimation(stateName: string): void;
    beginLeaderSelectedSequence(): void;
    advanceLeaderSelectedSequence(id: number, hash: number): void;
}
declare const LeaderSelectModelManager: LeaderSelectModelManagerClass;
export { LeaderSelectModelManager as default };
