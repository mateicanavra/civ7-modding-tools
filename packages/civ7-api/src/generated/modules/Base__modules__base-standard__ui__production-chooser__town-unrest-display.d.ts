/**
 * @file town-unrest.ts
 * @copyright Firaxis Games, 2024-2025
 * @description Section with a slider that shows how long until the town is no longer in unrest.
 */
export declare class TownUnrestDisplay extends Component {
    private get highestActiveUnrestDuration();
    private get turnsOfUnrest();
    private readonly sliderFillElement;
    private readonly remainingTurnsElement;
    onInitialize(): void;
    onAttributeChanged(name: string, _oldValue: string | null, _newValue: string | null): void;
    private updateUnrestDisplay;
    private render;
}
