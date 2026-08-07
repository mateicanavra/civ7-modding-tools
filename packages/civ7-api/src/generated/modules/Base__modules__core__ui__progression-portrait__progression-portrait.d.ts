/**
 * @file progression-portrait.ts
 * @copyright 2020-2023, Firaxis Games
 * @description The player's meta-progression portrait
 */
declare class ProgressionPortrait extends Component {
    private portraitLevel;
    private legendPath;
    private leaderLevel;
    private borderURL;
    private displayLevel;
    onAttach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private refreshPortrait;
}
export { ProgressionPortrait as default };
