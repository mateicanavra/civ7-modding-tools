/**
 * @file fxs-reward-button.ts
 * @copyright 2019-2024, Firaxis Games
 * @description A button to display narrative multiple reward icons and various indicators of story status.
 *
 * Set the `action-key` attribute to the action key you want to display on the button.
 *
 * Set the `main-text` attribute to the narrative text you want to display on the button.
 *
 * Set the `action-text` attribute to the text that describes the imperative for the story.
 *
 * Set the `reward` attribute to the text that describes the reward on the button Will display as tooltip.
 *
 * Import the `icons` attribute from the storyDef. It's an array listing the rewards that go with the story
 *
 * Set the "leaderCiv" to "LEADERCIV"(generic) if option is available because of Leader or Civilization choice
 *
 */
import FxsActivatable, { FxsActivatableAttribute } from "/core/ui/components/fxs-activatable.js";
export type FxsRewardButtonAttribute = Extract<FxsActivatableAttribute, "action-key"> | "main-text" | "action-text" | "reward" | "icons" | "type";
/** @description A button to display narrative multiple reward icons and various indicators of story status. */
declare class FxsRewardButton extends FxsActivatable {
    private readonly mainText;
    private readonly actionText;
    private navContainer;
    private storyType;
    private leaderCivChoice;
    private rewardText;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    render({ icons }: {
        icons: NarrativeRewardIconDefinition[];
    }): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-reward-button": ComponentRoot<FxsRewardButton>;
    }
}
export { FxsRewardButton };
