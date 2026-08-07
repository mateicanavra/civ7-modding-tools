/**
 * @file leader-icon.ts
 * @copyright 2023, Firaxis Games
 * @description Leader icon component
 */
declare class LeaderIcon extends Component {
    private leader;
    private bgColor;
    private fgColor;
    private civIconUrl;
    private background;
    private icon;
    private banner;
    private bannerContainer;
    private civIcon;
    onInitialize(): void;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
    render(): void;
}
