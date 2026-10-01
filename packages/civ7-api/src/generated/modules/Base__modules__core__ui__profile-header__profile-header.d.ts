/**
 * @file profile-header.ts
 * @copyright 2023-2025, Firaxis Games
 * @description Header that contains the progression header and the social button
 */
import { NavigateInputEvent } from "/core/ui/input/input-support.js";
export declare const ProfileAccountLoggedOutEventName: "profile-account-logged-out";
export declare class ProfileAccountLoggedOutEvent extends CustomEvent<never> {
    constructor();
}
export declare const giftboxButtonName: string;
export declare class ProfileHeader extends Component {
    private progressionHeader;
    private progressionHeaderButtonContainer;
    private progressionHeaderNavhelp;
    private socialButtonContainer;
    private socialButton;
    private socialButtonNavhelp;
    private giftboxButton;
    private giftboxButtonContainer;
    private giftboxButtonNavhelp;
    private socialNotification;
    private rewardsNotification;
    private inputHandler;
    private progressionHeaderButtonName;
    private socialButtonName;
    private profileHeaderPopupDialogID;
    private hideGift;
    private hideSocial;
    private hideProgressionHeader;
    private progressionHeaderActivateListener;
    private socialButtonActivateListener;
    private giftboxButtonActivateListener;
    private qrCompletedListener;
    private accountUnlinkedListener;
    private accountUpdatedListener;
    private spoPCompleteListener;
    private spopHeartBeatReceivedListener;
    private accountInfoUpdatedListener;
    private notificationListUpdatedListener;
    private accountLoggedOutListener;
    private engineInputListener;
    private navigateInputListener;
    private connectionStatusChangedListener;
    private contextManagerCloseListener;
    private inputDeviceChangedListener;
    private prevFocus;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private render;
    private isFullAccountLinkedOnline;
    private isFullyLoggedIn;
    private updateGiftboxButton;
    private updateSocialButton;
    private updateSocialButtonContainer;
    private updateGiftboxButtonContainer;
    private updateProgressionHeaderButtonContainer;
    private updateProgressionHeader;
    private updateSocialNotification;
    private updateRewardsNotification;
    private onEngineInput;
    private handleEngineInput;
    onNavigateInput(navigationEvent: NavigateInputEvent): void;
    /**
     * @returns true if still live, false if input should stop.
     */
    handleNavigation(navigationEvent: NavigateInputEvent): boolean;
    private onAccountUpdated;
    private onNotificationListUpdated;
    private onLogoutResults;
    private onProfileHeaderButtonClicked;
    private onProgressionHeaderActivate;
    private onSocialButtonActivate;
    private onGiftboxButtonActivate;
    private onContextManagerClose;
    private onInputDeviceChanged;
    private showDialogBox;
}
declare global {
    interface HTMLElementTagNameMap {
        "profile-header": ComponentRoot<ProfileHeader>;
    }
    interface HTMLElementEventMap {
        [ProfileAccountLoggedOutEventName]: ProfileAccountLoggedOutEvent;
    }
}
