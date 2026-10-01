/**
 * @file options-helpers.ts
 * @copyright 2023, Firaxis Games
 * @description common types and shared functions supporting the options screen/model.
 */
import { CategoryType, GameCoreOptionCategory, type OptionCategoryGroup, type OptionInfo } from "/core/ui/options/model-options.js";
export type OptionComponent = ReturnType<typeof createOptionComponentInternal>;
declare const createOptionComponentInternal: (optionInfo: OptionInfo) => any;
/**
 * CreateOptionComponent creates the corresponding UI component for the given option data.
 */
export declare const CreateOptionComponent: (option: OptionInfo) => any;
export declare const CategoryData: {
    readonly [CategoryType.Accessibility]: {
        readonly title: "LOC_OPTIONS_CATEGORY_ACCESSIBILITY";
        readonly description: "LOC_OPTIONS_CATEGORY_ACCESSIBILITY_DESCRIPTION";
    };
    readonly [CategoryType.Audio]: {
        readonly title: "LOC_OPTIONS_CATEGORY_AUDIO";
        readonly description: "LOC_OPTIONS_CATEGORY_AUDIO_DESCRIPTION";
    };
    readonly [CategoryType.Game]: {
        readonly title: "LOC_OPTIONS_CATEGORY_GAME";
        readonly description: "LOC_OPTIONS_CATEGORY_GAME_DESCRIPTION";
    };
    readonly [CategoryType.Graphics]: {
        readonly title: "LOC_OPTIONS_CATEGORY_GRAPHICS";
        readonly description: "LOC_OPTIONS_CATEGORY_GRAPHICS_DESCRIPTION";
    };
    readonly [CategoryType.Input]: {
        readonly title: "LOC_OPTIONS_CATEGORY_INPUT";
        readonly description: "LOC_OPTIONS_CATEGORY_INPUT_DESCRIPTION";
    };
    readonly [CategoryType.System]: {
        readonly title: "LOC_OPTIONS_CATEGORY_SYSTEM";
        readonly description: "LOC_OPTIONS_CATEGORY_SYSTEM_DESCRIPTION";
    };
    readonly [CategoryType.Interface]: {
        readonly title: "LOC_OPTIONS_CATEGORY_INTERFACE";
        readonly description: "LOC_OPTIONS_CATEGORY_INTERFACE_DESCRIPTION";
    };
};
export declare const GetGroupLocKey: (group: OptionCategoryGroup) => "LOC_MAIN_MENU_EXTRAS" | `LOC_OPTIONS_GROUP_${Uppercase<OptionCategoryGroup>}`;
/**
 * @param closeCallback callback to close the UI associated with this prompt
 * @param restoreCategory the category to restore if the user cancels the prompt
 */
export declare const ShowReloadUIPrompt: (closeCallback?: () => void, restoreCategory?: GameCoreOptionCategory) => void;
/**
 * @param closeCallback callback to close the UI associated with this prompt
 */
export declare const ShowRestartGamePrompt: (closeCallback?: () => void) => void;
export {};
