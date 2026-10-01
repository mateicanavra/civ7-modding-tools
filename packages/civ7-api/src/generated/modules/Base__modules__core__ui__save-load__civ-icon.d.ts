/**
 * @file civ-icon.ts
 * @copyright 2023, Firaxis Games
 * @description Civ icon component
 */
declare class CivIcon extends Component {
    private iconUrl;
    private bgColor;
    private fgColor;
    private background;
    private icon;
    onInitialize(): void;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
    render(): void;
}
