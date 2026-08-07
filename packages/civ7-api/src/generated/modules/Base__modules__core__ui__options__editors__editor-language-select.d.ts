/**
 * @file editor-language-select.ts
 * @copyright Firaxis Games, 2023
 * @description language select options subscreen component definition
 */
import { FxsButton } from "/core/ui/components/fxs-button.js";
import { FxsCloseButton } from "/core/ui/components/fxs-close-button.js";
import Panel from "/core/ui/panel-support.js";
/**
 * EditorLanguageSelect supports configuring the language options of Civilization.
 *
 * Set the `editor-commit-on-apply` attribute to `true` to commit the changes when the user clicks the apply button.
 */
declare class EditorLanguageSelect extends Panel {
    displayList: HTMLDivElement;
    audioList: HTMLDivElement;
    acceptBtn: ComponentRoot<FxsButton>;
    cancelBtn: ComponentRoot<FxsButton>;
    closeBtn: ComponentRoot<FxsCloseButton>;
    mainSlot: Element;
    /**
     * currentAudioIdx is the index of the audio language option that was selected when the screen was opened.
     */
    readonly currentAudioIdx: any;
    /**
     * currentDisplayIdx is the index of the display language option that was selected when the screen was opened.
     */
    readonly currentDisplayIdx: any;
    selectedAudioIdx: any;
    selectedDisplayIdx: any;
    get didChangeLanguage(): boolean;
    private commitOnApply;
    private engineInputListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private onEngineInput;
    private onAudioLanguageChange;
    private onDisplayLanguageChange;
    private onAcceptChanges;
    private applyChanges;
    private onCancelChanges;
    private renderLanguageOption;
    private render;
}
declare const EditorLanguageSelectTagName = "editor-language-select";
declare global {
    interface HTMLElementTagNameMap {
        [EditorLanguageSelectTagName]: ComponentRoot<EditorLanguageSelect>;
    }
}
export {};
