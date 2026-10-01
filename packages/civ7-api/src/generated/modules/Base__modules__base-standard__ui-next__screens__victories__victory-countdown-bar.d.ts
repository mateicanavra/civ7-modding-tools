import { VictoryRowPlayer } from "/base-standard/ui-next/screens/victories/victories-screen-model.js";
export interface VictoryCountdownPlayer {
    playerInfo: VictoryRowPlayer;
    countdownProgress: number;
    launchpadDamaged: boolean;
}
export interface VictoryCountdownBarProps {
    players: VictoryCountdownPlayer[];
    countdownDuration: number;
}
export declare const VictoryCountdownBar: any;
