/**
 * @file utilities-image.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Provides commonly use functions for images / icons.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export declare namespace Icon {
    /** @returns the image to use for when an icon image cannot be located */
    function missingUnitImage(): string;
    function getUnitIconFromID(componentID: ComponentID): string;
    function getUnitIconFromDefinition(unitDefinition: UnitDefinition | null): string;
    function getBuildingIconFromDefinition(buildingDefinition: BuildingDefinition): string;
    function getConstructibleIconFromDefinition(constructibleDefinition: ConstructibleDefinition): string;
    function getTraditionIconFromDefinition(traditionDefinition: TraditionDefinition): string;
    function getModifierIconFromDefinition(modifierDefinition: ModifierDefinition): string;
    function getProjectIconFromDefinition(projectDefinition: ProjectDefinition): string;
    function getImprovementIconFromDefinition(improvementDefinition: ImprovementDefinition): string;
    function getWonderIconFromDefinition(wonderDefinition: WonderDefinition): string;
    function getTechIconFromProgressionTreeNodeDefinition(_techDefinition: ProgressionTreeNodeDefinition): string;
    function getCultureIconFromProgressionTreeNodeDefinition(_cultureDefinition: ProgressionTreeNodeDefinition): string;
    function getCultureIconFromProgressionTreeDefinition(_cultureDefinition: ProgressionTreeDefinition): string;
    function getDiplomaticActionIconFromDefinition(diploActionInfo: DiplomacyActionDefinition): string;
    /**
     * @param label Lookup key
     * @param bLocal Used to change the styling of the icon
     * @returns File path to specified image or, if not found, a question mark image
     */
    function getYieldIcon(yieldType: YieldType, bLocal?: boolean): string;
    function getProductionIconFromHash(hash: number): string;
    function getLeaderPortraitIcon(leaderType: LeaderType, size?: number, relationship?: DiplomacyPlayerRelationships): string;
    /**
     * Get the associated background image for a given player
     * @param {PlayerID} playerID
     * @returns {string} URL of the background image
     */
    function getPlayerBackgroundImage(playerID: PlayerId): string;
    /**
     * Get the associated leader icon for a given player
     * @param {PlayerID} playerID
     * @param {number} (size) - A size representing width x height.
     * @returns {string} URL of the leader
     */
    function getPlayerLeaderIcon(playerID: PlayerId, size?: number): string;
    function getNotificationIconFromID(notificationID: ComponentID, context?: string): string;
    function getIconFromActionName(actionName: string | undefined, inputDevice?: InputDeviceType, inputContext?: InputContext, hasPrefix?: boolean): string | null;
    function getIconFromActionID(actionID: InputActionID, inputDevice: InputDeviceType, inputContext?: InputContext, hasPrefix?: boolean): string | null;
    function getCivSymbolFromCivilizationType(civilization: CivilizationType): string;
    function getCivLineFromCivilizationType(civilization: CivilizationType): string;
    function getCivSymbolCSSFromCivilizationType(civilization: CivilizationType): string;
    function getCivLineCSSFromCivilizationType(civilization: CivilizationType): string;
    function getCivSymbolCSSFromPlayer(playerComponent: ComponentID): string;
    function getCivLineCSSFromPlayer(playerComponent: ComponentID): string;
    function getLegacyPathIcon(legacyPath: LegacyPathDefinition): string;
    function getVictoryIcon(victoryDefinition: VictoryDefinition): string;
    function getTechIconForCivilopedia(techName: string): string;
    function getCivicsIconForCivilopedia(civicName: string): string;
    function getCivIconForCivilopedia(civName: string): string;
    function getCivIconForDiplomacyHeader(civType: CivilizationType): string;
}
