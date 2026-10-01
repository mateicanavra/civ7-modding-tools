/**
 * @file Leader Model Manager
 * @copyright 2021-2025, Firaxis Games
 * @description Handles models and animations for the leader 3D models on the diplo interactions
 */
export interface LeaderSequenceData {
    sequenceType: string;
    sequenceSubType: string;
    player1: PlayerId;
    player2: PlayerId;
    initiatingPlayer: PlayerId;
    focusID: ComponentID;
    focusLocation?: PlotCoord;
}
declare class LeaderModelManagerClass {
    private static instance;
    private leaderModelGroupLeft;
    private leaderModelGroupRight;
    private closeStartTime;
    private sequenceStartTime;
    private leftAnimationStartTime;
    private rightAnimationStartTime;
    readonly SEQUENCE_DEBOUNCE_DURATION: number;
    private isClosing;
    private fallbackCloseStartTime;
    private isClosingFallback;
    private isLeaderShowing;
    private worldCamera;
    private leaderCameraOffset;
    private cameraDollyRequestStartTime;
    private cameraDollyQueued;
    private FIRST_MEET_DELAY;
    private cameraDollyDelayed;
    private cameraAnimationDelayDuration;
    private leader3DModelLeft;
    private leader3DBannerLeft;
    private leader3DModelRight;
    private leader3DBannerRight;
    private leader3DMarkerLeft;
    private leader3DMarkerRight;
    private leader3DRevealFlagMarker;
    private leader3DMarkerCenter;
    private leftAnimState;
    private rightAnimState;
    private declareWarCameraActive;
    private isRightHostile;
    private leftLeaderInTransitionDeadZone;
    private rightLeaderInTransitionDeadZone;
    private leftLeaderAnimationQueuedSequence;
    private rightLeaderAnimationQueuedSequence;
    private leaderLeftAnimationJustStarted;
    private leaderRightAnimationJustStarted;
    private lastFirstMeetPlayerId;
    /************************************************************************************************************************/
    /**                        IF YOU CHANGE THIS, COORDINATE WITH GRAPHICS DEPARTMENT TO MOVE IT TO JSON                  **/
    /**                                          IF YOU DO NOT YOU WILL BREAK BENCHMARKING                                 **/
    /**                                         WHICH MAY CAUSE INGAME ASSETS TO BE BLURRY!                                **/
    /**                                                                                                                    **/
    private static readonly OFF_CAMERA_DISTANCE;
    private static readonly CAMERA_SUBJECT_DISTANCE;
    private static readonly CAMERA_DOLLY_ANIMATION_IN_DURATION;
    private static readonly CAMERA_DOLLY_ANIMATION_OUT_DURATION;
    private static readonly DECLARE_WAR_DOLLY_DISTANCE;
    readonly LEADER_EXIT_DURATION: number;
    private static readonly DARKENING_VFX_POSITION;
    private static readonly LEFT_MODEL_POSITION;
    private static readonly LEFT_BANNER_POSITION;
    private static readonly LEFT_BANNER_ANGLE;
    private static readonly RIGHT_MODEL_POSITION;
    private static readonly RIGHT_INDEPENDENT_MODEL_POSITION;
    private static readonly RIGHT_INDEPENDENT_MODEL_SCALE;
    private static readonly RIGHT_INDEPENDENT_MODEL_ANGLE;
    private static readonly RIGHT_INDEPENDENT_BANNER_POSITION;
    private static readonly RIGHT_INDEPENDENT_VIGNETTE_OFFSET;
    private static readonly RIGHT_INDEPENDENT_CAMERA_OFFSET;
    private static readonly RIGHT_MODEL_AT_WAR_POSITION;
    private static readonly RIGHT_BANNER_POSITION;
    private static readonly RIGHT_BANNER_ANGLE;
    private static readonly BANNER_SCALE;
    readonly MAX_LENGTH_OF_ANIMATION_EXIT: number;
    private static readonly FOREGROUND_CAMERA_IN_ID;
    private static readonly FOREGROUND_CAMERA_OUT_ID;
    private static readonly SCREEN_DARKENING_ASSET_NAME;
    private static readonly TRIGGER_HASH_ANIMATION_STATE_END;
    private static readonly TRIGGER_HASH_SEQUENCE_TRIGGER;
    private static readonly TRIGGER_NO_TRANSITION_START;
    private static readonly TRIGGER_NO_TRANSITION_END;
    private static readonly LEFT_MODEL_POSITION_SMALL_ASPECT_RATIO;
    private static readonly LEFT_BANNER_POSITION_SMALL_ASPECT_RATIO;
    private static readonly RIGHT_MODEL_POSITION_SMALL_ASPECT_RATIO;
    private static readonly RIGHT_BANNER_POSITION_SMALL_ASPECT_RATIO;
    private static readonly RIGHT_MODEL_AT_WAR_POSITION_SMALL_ASPECT_RATIO;
    private static readonly LEFT_MODEL_POSITION_SMALL_SCREEN_MOBILE;
    private static readonly LEFT_BANNER_POSITION_SMALL_SCREEN_MOBILE;
    private static readonly RIGHT_MODEL_POSITION_SMALL_SCREEN_MOBILE;
    private static readonly RIGHT_BANNER_POSITION_SMALL_SCREEN_MOBILE;
    private static readonly RIGHT_MODEL_AT_WAR_POSITION_SMALL_SCREEN_MOBILE;
    private static readonly POSITIONS;
    /**                                                                                                                    **/
    /**                       IF YOU CHANGE THE ABOVE, COORDINATE WITH GRAPHICS DEPARTMENT TO MOVE IT TO JSON              **/
    /**                                          IF YOU DO NOT YOU WILL BREAK BENCHMARKING                                 **/
    /**                                         WHICH MAY CAUSE INGAME ASSETS TO BE BLURRY!                                **/
    /************************************************************************************************************************/
    private currentSequenceType;
    private isLocalPlayerInitiator;
    private leaderSequenceStepID;
    private leaderSequenceGate;
    private isMobileSmallScreen;
    constructor();
    private getIndLeaderAssetName;
    private getIndLeaderBGAssetName;
    private getIndPrimaryColor;
    private getIndSecondaryColor;
    private getIndBannerAssetName;
    private getLeftLightingAssetName;
    private getRightLightingAssetName;
    private getIndependentLightingAssetName;
    private getLeaderAssetName;
    private getFallbackAssetName;
    private getCivBannerName;
    private getFallbackBannerAssetName;
    private isAtWarWithPlayer;
    private isSmallAspectRatio;
    private isSmallScreen;
    private getScreenType;
    showLeaderSequence(params: LeaderSequenceData): boolean;
    showDiplomaticSceneEnvironment(offset?: float3): void;
    showLeaderModels(playerID1: PlayerId, playerID2: PlayerId): void;
    showLeftLeaderModel(playerID: PlayerId): void;
    showRightLeaderModel(playerID: PlayerId): void;
    /**
     *  ------------------------------------------------------------------------
     * Show an  independent 'leader' on the right side of the screen, which may not be a true leader model.
     * @param playerID
     * @returns
     */
    showRightIndLeaderModel(playerID: PlayerId): void;
    private handleTriggerCallback;
    private handleForegroundCameraAnimationComplete;
    private playLeaderAnimation;
    private applyLeaderAnimation;
    exitLeaderScene(): void;
    exitSimpleDiplomacyScene(): void;
    clearLeaderModels(): void;
    clear(): void;
    clearLeftLeaderModel(): void;
    onUpdate(timeStamp: DOMHighResTimeStamp): void;
    private doSequenceSharedAdvance;
    private updateSequenceWaitFromAnimationTrigger;
    private showLeadersFirstMeet;
    private beginFirstMeetSequence;
    private advanceFirstMeetSequence;
    private showLeadersDeclareWar;
    private beginDeclareWarPlayerSequence;
    private advanceDeclareWarPlayerSequence;
    private showLeadersAcceptPeace;
    private beginAcceptPeaceSequence;
    private advanceAcceptPeaceSequence;
    private showLeadersRejectPeace;
    private beginRejectPeaceSequence;
    private advanceRejectPeaceSequence;
    private showLeadersDefeat;
    private beginDefeatSequence;
    private advanceDefeatSequence;
    beginAcknowledgePlayerSequence(): void;
    private playAcknowledgeAnimation;
    private advanceAcknowledgePlayerSequence;
    beginHostileAcknowledgePlayerSequence(): void;
    private advanceHostileAcknowledgePlayerSequence;
    beginPlayerProposeSequence(): void;
    private advancePlayerProposeSequence;
    beginAcknowledgeOtherSequence(): void;
    private playAcknowledgeOtherAnimation;
    private advanceAcknowledgeOtherSequence;
    beginAcknowledgePositiveOtherSequence(forced?: boolean): void;
    private playAcknowledgePositiveOtherAnimation;
    private advanceAcknowledgePositiveOtherSequence;
    beginAcknowledgeNegativeOtherSequence(forced?: boolean): void;
    private playAcknowledgeNegativeOtherAnimation;
    private advanceAcknowledgeNegativeOtherSequence;
    beginAcceptSanctionSequence(forced?: boolean): void;
    private advanceAcceptSanctionSequence;
    beginRejectSanctionSequence(forced?: boolean): void;
    private advanceRejectSanctionSequence;
    private beginLeadersIndependentSequence;
    private advanceLeadersIndependentSequence;
    private doForegroundCameraDolly;
    private simpleLeaderPopUpCameraAnimation;
    startDWCameraAnimations(): void;
}
declare const LeaderModelManager: LeaderModelManagerClass;
export { LeaderModelManager as default };
