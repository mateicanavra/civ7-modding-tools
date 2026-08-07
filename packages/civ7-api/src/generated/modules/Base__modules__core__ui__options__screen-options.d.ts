/**
 * @file screen-options.ts
 * @copyright 2020-2023, Firaxis Games
 * @description The view portion of the options/setting screen.
 */
import "/core/ui/options/options.js";
import "/core/ui/options/screen-options-category.js";
import Panel from "/core/ui/panel-support.js";
/**
 * Display and modify the game options.
 */
export declare class ScreenOptions extends Panel {
    private panels;
    private tabData;
    private tabControl?;
    private readonly slotGroup;
    private scrollable?;
    private cancelButton?;
    private defaultsButton?;
    private confirmButton?;
    private dialogId;
    private readonly minWidthByFontScale;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    onLoseFocus(): void;
    private onOptionsChanged;
    private onDefaultOptions;
    private onCancelOptions;
    private onConfirmOptions;
    private onFontScaleChanged;
    private adjustSliderTextsSize;
    private onEngineInput;
    private onOptionsTabSelected;
    private handleForceRenderOptions;
    private onUpdateOptionValue;
    /**
     * getOrCreateCategoryTab Finds or creates the panel associated with a given option category.
     *
     * @param catID A category to associate with a tab.
     * @returns The display panel associated with the tab.
     */
    private getOrCreateCategoryTab;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "screen-options": ComponentRoot<ScreenOptions>;
    }
}
