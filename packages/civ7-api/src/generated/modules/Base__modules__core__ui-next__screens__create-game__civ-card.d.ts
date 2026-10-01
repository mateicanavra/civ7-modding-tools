import { CivInfo } from "/core/ui-next/screens/create-game/civ-select-model.js";
export type CivCardProps = CivInfo & {
    class?: string;
    isSelected: boolean;
    isApexAgeSelected: boolean;
    leaderIcon: string;
    isRecommended: boolean;
    isUnlocks?: boolean;
    isCivSelect?: boolean;
    showAllUnlocks?: boolean;
    isCurrentCiv?: boolean;
    onSelect: () => void;
};
export declare const CivCard: any;
