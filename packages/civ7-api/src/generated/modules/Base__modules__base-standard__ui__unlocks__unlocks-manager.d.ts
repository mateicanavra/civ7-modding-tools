import { DisplayHandlerBase, IDisplayRequestBase } from "/core/ui/context-manager/display-handler.js";
export interface UnlockRequirementData {
    description: string;
    narrative: string | undefined;
}
export interface UnlockPopupData extends IDisplayRequestBase {
    name: string;
    icon: string;
    requirements: UnlockRequirementData[];
}
declare class UnlocksPopupManagerClass extends DisplayHandlerBase<UnlockPopupData> {
    static readonly instance: UnlocksPopupManagerClass;
    private rewardUnlockedListener;
    currentUnlockedRewardData: UnlockPopupData | null;
    private constructor();
    show(request: UnlockPopupData): void;
    hide(_request: UnlockPopupData): void;
    closePopup: () => void;
    private onRewardUnlocked;
    /**
     *
     * @param unlockType string version of the unlock type. For Example UNLOCK_CIVILIZATION_ABBASID
     * @returns array of all the descriptions of conditions met to unlock
     */
    private rewardRequirementsCompleted;
}
export declare const UnlockPopupManager: UnlocksPopupManagerClass;
export {};
