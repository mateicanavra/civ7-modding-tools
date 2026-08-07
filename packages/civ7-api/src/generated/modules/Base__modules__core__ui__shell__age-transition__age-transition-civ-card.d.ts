/**
 * @file age-transition-civ-card.ts
 * @copyright 2024, Firaxis Games
 * @description Displays compact information about a civilization
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { CivData } from "/core/ui/shell/create-panels/age-civ-select-model.js";
export declare const AgeTransitionCivSelectEventName: "age-transition-civ-select";
export declare class AgeTransitionCivSelectEvent extends CustomEvent<{
    x: number;
    y: number;
}> {
    constructor(x: number, y: number);
}
export declare class AgeTransitionCivCard extends FxsActivatable {
    private civData;
    private background;
    private content;
    private focusBorder;
    private civName;
    private civTraits;
    private civIcon;
    private hoverInfo;
    private abilityTitle;
    private bonusList;
    private historicalChoiceInfo;
    private historicalChoiceReason;
    private historicalChoiceIcon;
    private historicalChoiceIconLeader;
    private selectCivButton;
    private lockIcon;
    private unlockedInfo;
    private lockedInfo;
    constructor(root: ComponentRoot<AgeTransitionCivCard>);
    getCivData(): CivData;
    setCivData(civData: CivData): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "age-transition-civ-card": ComponentRoot<AgeTransitionCivCard>;
    }
}
