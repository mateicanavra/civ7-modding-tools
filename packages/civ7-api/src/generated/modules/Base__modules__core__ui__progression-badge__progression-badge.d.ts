/**
 * @file progression-badge.ts
 * @copyright 2020-2024, Firaxis Games
 * @description The player's meta-progression badge
 */
declare class ProgressionBadge extends Component {
    private badgeSize;
    private badgeURL;
    private badgeProgressionLevel;
    private displayLevel;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private refreshBadge;
}
export { ProgressionBadge as default };
