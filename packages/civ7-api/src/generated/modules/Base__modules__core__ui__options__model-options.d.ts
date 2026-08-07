/**
 * @file model-options.ts
 * @copyright 2020-2026, Firaxis Games
 * @description Data backing for options screen.
 */
import { DropdownItem } from "/core/ui/components/fxs-dropdown.js";
import { PushProperties } from "/core/ui/context-manager/context-manager.js";
export type GameCoreOptionCategory = "sound" | "graphics" | "application" | "network" | "configuration";
export declare enum OptionType {
    /**
     * Editor is a button that opens an editor for the option.
     */
    Editor = 0,
    Checkbox = 1,
    Dropdown = 2,
    Slider = 3,
    Stepper = 4,
    Switch = 5
}
export declare enum CategoryType {
    Accessibility = "accessibility",
    Audio = "audio",
    Game = "game",
    Graphics = "graphics",
    Input = "input",
    System = "system",
    Interface = "interface"
}
type NonEditorOption = Exclude<OptionInfo, {
    type: OptionType.Editor;
}>;
/**
 * OptionInitHandler should read the option's value from its source and set the OptionInfo's currentValue field.
 */
export type OptionInitHandler<O extends NonEditorOption = NonEditorOption> = (optionInfo: O) => void;
/**
 * OptionUpdateHandler is called when the user changes the option's value.
 */
export type OptionUpdateHandler<O extends NonEditorOption = NonEditorOption> = (optionInfo: O, value: Exclude<O["currentValue"], undefined>) => void;
/**
 * EditorOptionActivateHandler is called when the user activates the editor button.
 *
 * The return value is optionally used to determine whether or not the editor should be opened.
 */
export type EditorOptionActivateHandler = () => boolean | undefined;
/**
 * OptionRestoreHandler is called when the user cancel's their changes.
 *
 * It should read in the configuration from the source and apply it to the UI.
 * This is used for configuration options where GameCore holds the value, but the value must be realized within the UI (e.g., UI scale).
 */
export type OptionRestoreHandler<O extends OptionInfo = OptionInfo> = (optionInfo: O) => void;
export type OptionCategoryGroup = "advanced" | "advisors" | "autosaves" | "camera" | "controls" | "extras" | "gamepad" | "general" | "mouse" | "subtitles" | "tooltip" | "timeofday" | "touch" | "tutorial" | "volume";
export type OptionValue = string | number | boolean;
interface Option<Type extends OptionType, Value extends OptionValue> {
    /** category determines what tab the option can be found under. */
    category: CategoryType;
    currentValue?: Value;
    /**
     * group is used to render related options in the same category together.
     */
    group?: OptionCategoryGroup;
    type: Type;
    /**
     * id is used to identify the option in the backing data and in the UI.
     */
    id: string;
    /**
     * label is the localization key for the option's label
     */
    label: string;
    /**
     * description is the localization key for the tooltip text
     */
    description?: string;
    isDisabled?: boolean;
    isHidden?: boolean;
    initListener?: Type extends OptionType.Editor ? never : OptionInitHandler;
    updateListener?: Type extends OptionType.Editor ? never : OptionUpdateHandler;
    restoreListener?: OptionRestoreHandler;
    forceRender?: () => void;
}
export type CheckboxInfo = Option<OptionType.Checkbox, boolean>;
export type AdvancedCheckboxInfo = CheckboxInfo & {
    optionSet: string;
    optionType: string;
    optionName: string;
    originalValue?: boolean;
};
export type SwitchInfo = Option<OptionType.Switch, boolean>;
export type StepperInfo = Option<OptionType.Stepper, number> & {
    min?: number;
    max?: number;
    steps?: number;
    originalValue?: number;
    formattedValue?: string;
};
export type SliderInfo = Option<OptionType.Slider, number> & {
    min?: number;
    max?: number;
    steps?: number;
    originalValue?: number;
    formattedValue?: string;
    /** sliderValue is the text representation of the slider value. */
    sliderValue?: HTMLElement;
};
export type EditorInfo = Option<OptionType.Editor, never> & {
    /** caption is the loc string used on the button which opens the editor */
    caption?: string;
    /**
     * editorTagName is the tagname of the custom element to create when the button for this option in clicked.
     *
     * Add your custom element to the HTMLElementTagNameMap interface via declaration merging.
     */
    editorTagName: keyof HTMLElementTagNameMap;
    pushProperties?: PushProperties<never, object>;
    activateListener?: EditorOptionActivateHandler;
};
export type DropdownInfo = Option<OptionType.Dropdown, number> & {
    selectedItemIndex?: number;
    dropdownItems?: DropdownItem[];
    originalValue?: number;
};
export type OptionInfo = EditorInfo | CheckboxInfo | AdvancedCheckboxInfo | DropdownInfo | SliderInfo | StepperInfo | SwitchInfo;
declare class OptionsModel {
    /** Backing data and callback for all the options across all the sections.  */
    private Options;
    /** Pending options, can be modified and applied externally */
    graphicsOptions: any;
    supportedOptions: any;
    /** Reference count of options that have changed and aren't back to their original value */
    private changeRefCount;
    /** Reference count of options that need a reload and aren't back to their original value */
    needReloadRefCount: number;
    /** Reference count of options that need a reload and aren't back to their original value */
    needRestartRefCount: number;
    /** Track if changing options means explicit input refresh needs to occur.  (Different meanings on the C++ side based on platform.) */
    inputRefreshRequired: boolean;
    private optionsInitCallbacks;
    private optionsReInitCallbacks;
    private optionsChangedCallbacks;
    constructor();
    get data(): any;
    get supportsGraphicOptions(): boolean;
    get showAdvancedGraphicsOptions(): boolean;
    get canUseMetalFx(): any;
    get showCustomGraphicsProfile(): boolean;
    incRefCount(): number;
    init(): void;
    /**
     * Adds a callback to be executed when the options are initialized.
     *
     * an init callback is a function that adds options to the model (i.e., calls addOption)
     */
    addInitCallback(callback: () => void): void;
    /**
     * Adds a callback to be executed when the options are changed by the engine.
     */
    addChangedCallback(callback: () => void): void;
    /**
     * Removes all options changed callbacks.
     */
    clearChangedCallbacks(): void;
    /**
     * Set up to make the options screen rebuild from the engine data next time it opens.
     */
    reInitOptions(): void;
    /**
     * Add a new option to the options screen.
     */
    addOption(info: OptionInfo): void;
    /**
     * Create a checkpoint for sound and configuration options
     */
    saveCheckpoints(): void;
    /**
     * Save all categories to disk
     */
    commitOptions(category?: GameCoreOptionCategory): void;
    /**
     * default restores most settings to their engine-defined default values.
     */
    resetOptionsToDefault(): void;
    /**
     * restore resets all categories to their on disk values
     */
    restore(category?: GameCoreOptionCategory): void;
    hasChanges(): boolean;
    /**
     * Check if the changed options will cause the UI to reload.
     * @returns true if applying the options changes will reload the UI, false otherwise
     */
    isUIReloadRequired(): boolean;
    /**
     * Check if the pending options require a restart.
     * @returns true if applying the pending options will require a restart, false otherwise
     */
    isRestartRequired(): boolean;
    /**
     * Does some explicit refresh of the UI input system need to occur?
     */
    isInputRefreshRequired(): boolean;
    private updateHiddenOptions;
}
export declare const Options: OptionsModel;
export {};
