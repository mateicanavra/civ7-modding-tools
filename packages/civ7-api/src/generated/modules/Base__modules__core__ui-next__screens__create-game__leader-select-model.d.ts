/**
 * @file leader-select-model.ts
 * @copyright 2020-2024, Firaxis Games
 * @description Loads and stores leader data for game creation
 */
import { Accessor } from "solid-js";
export declare enum OwnershipAction {
    None = 0,
    IncludedWith = 1,
    LinkAccount = 2
}
export interface OwnershipData {
    action: OwnershipAction;
    reason: string;
}
export interface LeaderInfo {
    leaderID: string;
    name: string;
    rawName: string;
    icon: string;
    description: string;
    quote: string;
    abilityTextTag: string;
    abilityTitle: string;
    abilityText: string;
    ageUnlocks: string[];
    unlocks: string[];
    nextReward?: LegendPathReward;
    playCount: number;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    prevLevelXp: number;
    tags: string[];
    isLocked: boolean;
    isOwned: boolean;
    ownershipData?: OwnershipData;
    sortIndex: number;
    fulltext: string;
    model: string;
    colors: HexColor | null;
    introText: string;
}
export interface LeaderSelectModel {
    leaders: LeaderInfo[];
    selectedLeader: Accessor<LeaderInfo>;
    setSelectedLeader: (leader: LeaderInfo) => void;
    fulltextSearch: (text: string) => Set<string>;
}
export declare const LeaderSelectModel: any;
export declare const LeaderSelectModelContext: any;
export declare function useLeaderSelectModelContext(): any;
