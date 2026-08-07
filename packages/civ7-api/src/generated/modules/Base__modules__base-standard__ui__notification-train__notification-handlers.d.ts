/**
 * @file notification-handlers.ts
 * @copyright 2021-2026, Firaxis Games
 */
import { NotificationID, NotificationModel } from "/base-standard/ui/notification-train/model-notification-train.js";
import { TutorialAdvisorType } from "/base-standard/ui/tutorial/tutorial-item.js";
export declare namespace NotificationHandlers {
    class DefaultHandler implements NotificationModel.Handler {
        lookAt(notificationId: NotificationID): void;
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
        add(notificationId: NotificationID): boolean;
        dismiss(notificationId: NotificationID): void;
    }
    class NewPopulationHandler extends DefaultHandler {
        activate(_notificationId: NotificationID, activatedBy: PlayerId | null): boolean;
    }
    class CommandUnits extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ConsiderRazeCity extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseCivilization extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseCelebration extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseGovernment extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseTech extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
        add(notificationId: NotificationID): boolean;
    }
    class ChooseCultureNode extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewCultureTree extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewPoliciesChooserNormal extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewPoliciesChooserCrisis extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewAttributeTree extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewVictoryProgress extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseCityStateBonus extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseCityProduction extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class CreateAdvancedStart extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class CreateAgeTransition extends DefaultHandler {
        static didDisplayBanner: boolean;
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class AssignNewResources extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class AssignNewPromotionPoint extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseTownProject extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseNarrativeDirection extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseNarrativeDirectionFavorDiscovery extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChoosePantheon extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseReligion extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseBelief extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ViewAgendaMessage extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class InvestigateDiplomaticAction extends DefaultHandler {
        activate(_notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class AllyAtWar extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class DeclareWar extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class GameInvite extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class KickVote extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class RespondToDiplomaticAction extends DefaultHandler {
        activate(notificationId: NotificationID, activatedBy: PlayerId | null): boolean;
    }
    class RelationshipChanged extends DefaultHandler {
        activate(notificationId: NotificationID, activatedBy: PlayerId | null): boolean;
    }
    class AdvisorWarning extends DefaultHandler {
        private advisorType;
        constructor(advisorType: TutorialAdvisorType);
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
        add(notificationId: NotificationID): boolean;
        dismiss(notificationId: NotificationID): void;
    }
    class ActionEspionage extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class AgeProgression extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class CapitalLost extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class RewardUnlocked extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class GreatWorkCreated extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class ChooseSyncretism extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
    class LegacyCompleted extends DefaultHandler {
        activate(notificationId: NotificationID, _activatedBy: PlayerId | null): boolean;
    }
}
