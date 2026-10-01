import { ActivatableProps } from "/core/ui-next/components/activatable.js";
import { LeaderInfo } from "/core/ui-next/screens/create-game/leader-select-model.js";
export declare const LeaderXpRing: any;
export declare const LeaderPortrait: any;
export interface LeaderSelectButtonBaseProps extends ActivatableProps {
    isLocked: boolean;
    isSelected: boolean;
    onFocus?: () => void;
    class?: string;
}
export declare const LeaderSelectButtonBase: any;
export interface LeaderSelectButtonProps extends ActivatableProps {
    isSelected: boolean;
    leaderInfo: LeaderInfo;
}
export declare const LeaderSelectButton: any;
