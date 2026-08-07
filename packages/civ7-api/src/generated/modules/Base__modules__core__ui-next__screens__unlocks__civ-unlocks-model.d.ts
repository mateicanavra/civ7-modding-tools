import { Accessor, Setter } from "solid-js";
import { CivInfo } from "/core/ui-next/screens/create-game/civ-select-model.js";
export interface CivUnlocksModel {
    leaderIcon: string;
    civInfo: CivInfo[];
    currentCivType: string;
    isViewingDetails: Accessor<boolean>;
    setIsViewingDetails: Setter<boolean>;
}
export declare function createCivUnlocksModel(): CivUnlocksModel;
export declare const CivUnlocksModel: any;
export declare const CivUnlocksContext: any;
export declare function useCivUnlocksContext(): any;
