/**
 * @file leader-button.ts
 * @copyright 2020-2022, Firaxis Games
 * @description A button used to represent a leader, made for the leader-select screen in the lobby.
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { FxsIcon } from "/core/ui/components/fxs-icon.js";
import FxsRingMeter from "/core/ui/components/fxs-ring-meter.js";
import { LeaderData } from "/core/ui/shell/create-panels/leader-select-model.js";
export declare class LeaderButton extends FxsActivatable {
    private _leaderData?;
    protected iconEle?: ComponentRoot<FxsIcon>;
    protected lvlRingEle?: ComponentRoot<FxsRingMeter>;
    private selectEle?;
    protected lvlEle?: HTMLElement;
    private _isSelected;
    set leaderData(leaderData: LeaderData);
    get leaderData(): LeaderData | undefined;
    set isSelected(value: boolean);
    get isSelected(): boolean;
    onInitialize(): void;
    protected updateLeaderData(): void;
    private updateSelection;
}
declare global {
    interface HTMLElementTagNameMap {
        "leader-button": ComponentRoot<LeaderButton>;
    }
}
