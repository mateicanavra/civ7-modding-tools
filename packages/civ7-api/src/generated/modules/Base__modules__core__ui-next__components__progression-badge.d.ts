export declare enum BadgeSize {
    BASE = "base",
    SMALL = "small",
    MINI = "mini",
    MICRO = "micro",
    DEFAULT = "default"
}
interface Props {
    badgeSize: BadgeSize;
    badgeUrl: string;
    progressionLevel: string;
    class?: string;
}
export declare const ProgressionBadge: (props: Props) => any;
export {};
