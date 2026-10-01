/**
 * @file narrative-reward-button.tsx
 * @copyright 2026, Firaxis Games
 * @description Button component for narrative event rewards
 */
import { type Component } from "solid-js";
export interface NarrativeRewardButtonProps {
    mainText: string;
    actionText: string;
    rewardText: string;
    icons: NarrativeRewardIconDefinition[];
    leaderCiv?: string;
    storyType?: "LIGHT" | "DISCOVERY";
    canAfford: boolean;
    audioGroup?: string;
    onActivate: () => void;
}
export declare const NarrativeRewardButton: Component<NarrativeRewardButtonProps>;
