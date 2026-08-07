/**
 * @file progression-header.ts
 * @copyright 2020-2024, Firaxis Games
 * @description A flexible card showing the player's meta-progression (aka "Player Card")
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
export declare class ProgressionHeader extends FxsActivatable {
    private cardStyle;
    private playerInfo;
    private display2KName;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private refreshPlayerCard;
}
declare global {
    interface HTMLElementTagNameMap {
        "progression-header": ComponentRoot<ProgressionHeader>;
    }
}
