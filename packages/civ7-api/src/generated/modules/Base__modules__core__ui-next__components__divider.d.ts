import { JSX } from "solid-js";
import { spacing } from "/core/ui-next/utilities/spacing.js";
export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The width of the line in its cross axis, perpendicular to the length */
    crossWidth?: spacing;
    length?: spacing;
    margin?: number;
    useGradient?: boolean;
    gradientOverride?: string;
    color?: string;
}
export declare const Divider: {
    Horizontal: any;
    Vertical: any;
};
