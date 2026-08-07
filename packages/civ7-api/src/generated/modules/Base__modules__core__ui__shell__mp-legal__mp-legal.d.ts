/**
 * @file mp-legal.ts
 * @copyright 2022, Firaxis Games
 * @description Screen to review and accept 2K legal documents
 */
export declare const LegalDocsPlacementAcceptName: "AcceptLegalDocuments";
export declare const LegalDocsPlacementReviewName: "ReviewLegalDocuments";
export declare const LegalDocsAcceptedEventName: "legalDocsAccepted";
export declare class LegalDocsAcceptedEvent extends CustomEvent<{
    accepted: boolean;
}> {
    constructor(detail: {
        accepted: boolean;
    });
}
declare global {
    interface HTMLElementEventMap {
        [LegalDocsAcceptedEventName]: LegalDocsAcceptedEvent;
    }
}
