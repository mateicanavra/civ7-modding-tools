/**
 * When the curtain is removed, anything registered to receive signals before
 * the first playable turn.
 */
export interface StartCurtainData {
    id: string;
    index: number;
    max: number;
}
export declare const LoadingStartCurtainRemoveName: "loading-start-curtain-removed";
export declare class LoadingStartCurtainRemoveEvent extends CustomEvent<StartCurtainData> {
    constructor(detail: StartCurtainData);
}
