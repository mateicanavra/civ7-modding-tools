import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
/**
 * Base props for all FiligreeTitle components.
 * - text: l10n id to render
 * - bgGlow: optionally render a subtle background glow behind the text
 * - textClass: extra classes applied to the localized text element
 */
export interface FiligreeTitleBaseProps extends JSX.HTMLAttributes<HTMLDivElement> {
    text: string;
    bgGlow?: boolean;
    textClass?: string;
    args?: LocalizedTextArgument[];
}
export type FiligreeTitleComponents = Component<FiligreeTitleBaseProps> & {
    /**
     * FiligreeTitle component without any filigree decoration.
     * ```tsx
     * <FiligreeTitle.None text="LOC_MY_TITLE" />
     * ```
     */
    None: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with H1-style filigree decoration.
     * ```tsx
     * <FiligreeTitle.H1 text="LOC_MY_TITLE" bgGlow />
     * ```
     */
    H1: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with H2-style filigree decoration.
     * ```tsx
     * <FiligreeTitle.H2 text="LOC_MY_TITLE" />
     * ```
     */
    H2: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with H3-style filigree decoration.
     * ```tsx
     * <FiligreeTitle.H3 text="LOC_MY_TITLE" />
     * ```
     */
    H3: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with H4-style filigree decoration (filigree on sides).
     * ```tsx
     * <FiligreeTitle.H4 text="LOC_MY_TITLE" />
     * ```
     */
    H4: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with small-style filigree decoration.
     * ```tsx
     * <FiligreeTitle.Small text="LOC_MY_TITLE" />
     * ```
     */
    Small: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with large-style filigree decoration (filigree on sides).
     * ```tsx
     * <FiligreeTitle.Accent text="LOC_MY_TITLE" />
     * ```
     */
    Accent: Component<FiligreeTitleBaseProps>;
    /**
     * FiligreeTitle component with simple linear gradient decorations (filigree on sides).
     * ```tsx
     * <FiligreeTitle.Plain text="LOC_MY_TITLE" />
     * ```
     */
    Plain: Component<FiligreeTitleBaseProps>;
};
/**
 * A collection of title components with decorative filigree elements.
 * Each variant provides a different filigree style suitable for different heading levels.
 *
 * ```tsx
 * <FiligreeTitle.H1 text="LOC_MAIN_TITLE" bgGlow />
 * <FiligreeTitle.H3 text="LOC_SECTION_TITLE" />
 * <FiligreeTitle.Small text="LOC_SUBTITLE" />
 * ```
 *
 * Default variant (H3): {@link FiligreeTitleH3}
 */
export declare const FiligreeTitle: FiligreeTitleComponents;
