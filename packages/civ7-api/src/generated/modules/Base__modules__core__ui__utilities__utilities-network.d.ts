/**
 * @copyright 2021, Firaxis Games
 * @description Shared support data structures for network systems.
 */
export declare namespace NetworkUtilities {
    function getHostingTypeURL(hostType: HostingType): string | undefined;
    function getHostingTypeTooltip(hostType: HostingType): string | undefined;
    function areLegalDocumentsConfirmed(unconfirmedCallback: Function): boolean;
    function isAccessAllowed(permissionType: DNAPermissionType): boolean;
    function requiresAccountValidation(blockReason: BlockedAccessReason): boolean;
    interface AbandonReasonPopup {
        title: string;
        body: string;
    }
    function multiplayerAbandonReasonToPopup(reason: number): AbandonReasonPopup;
    function openSocialPanel(initialTab?: string): void;
}
