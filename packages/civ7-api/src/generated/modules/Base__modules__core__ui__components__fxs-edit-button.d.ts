/**
 * @file fxs-close-button.ts
 * @copyright 2025, Firaxis Games
 * @description A UI button for showing the edit pencil
 *
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
export declare class FxsEditButton extends FxsActivatable {
    private editButtonBG;
    private editButtonHoverBG;
    private playSoundListener;
    onAttach(): void;
    onDetach(): void;
    private render;
    onAttributeChanged(name: string, oldValue: string, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-edit-button": ComponentRoot<FxsEditButton>;
    }
}
