/**
 * @file model-tutorial-inspector.ts
 * @copyright 2020-2022, Firaxis Games
 */
declare class TutorialInspectorModel {
    private items;
    private _OnUpdate?;
    constructor();
    set updateCallback(callback: (model: TutorialInspectorModel) => void);
    /**
     * Create a list of activating events as a string
     * @param {TutorailItem} item
     * @returns {string} Comma separated list of events that will activate this tutorial item.
     */
    private activatingEventsToString;
    update(): void;
}
declare const TutorialData: TutorialInspectorModel;
export { TutorialData as default };
