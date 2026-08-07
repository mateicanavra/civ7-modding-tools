import { Accessor } from "solid-js";
import { CivInfo } from "/core/ui-next/screens/create-game/civ-select-model.js";
import { LeaderInfo } from "/core/ui-next/screens/create-game/leader-select-model.js";
export interface LeaderBiasInfo {
    leaderId: string;
    choice: string | undefined;
    reason: string | undefined;
    bias: number;
}
export interface CivBiasInfo {
    civId: string;
    choice: string | undefined;
    reason: string | undefined;
    bias: number;
}
export interface RecommendedChoiceInfo {
    forCiv: Accessor<Map<string, LeaderBiasInfo>>;
    forLeader: Accessor<Map<string, CivBiasInfo>>;
    historicalLeaders: Accessor<LeaderInfo[]>;
    historicalCivs: Accessor<CivInfo[]>;
    recommendedLeaders: Accessor<LeaderInfo[]>;
    recommendedCivs: Accessor<CivInfo[]>;
    unrecommendedLeaders: Accessor<LeaderInfo[]>;
    unrecommendedCivs: Accessor<CivInfo[]>;
}
export declare const RecommendedChoiceModel: any;
export declare const RecommendedChoiceModelContext: any;
export declare function useRecommendedChoiceModelContext(): any;
