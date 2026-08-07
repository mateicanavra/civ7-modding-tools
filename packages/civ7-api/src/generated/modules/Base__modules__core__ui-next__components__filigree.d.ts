import { JSX } from "solid-js";
export interface FiligreeH4Props extends JSX.HTMLAttributes<HTMLDivElement> {
    name?: string;
    filigreeClass?: string;
}
export interface FiligreeFrameProps {
    hideDecoration?: boolean;
    topClass?: string;
    bottomClass?: string;
}
export interface BaseFiligreeProps {
    topIconClass?: string;
    topIconSrc?: string;
    topIconBackgroundTint?: string;
    topIconTint?: string;
}
/**
 * A collection of filligree components
 */
export declare const Filigree: {
    /**
     * A filigree designed to be used beneath H1 text
     *
     * Default implementation: {@link FiligreeH1}
     */
    H1: any;
    /**
     * A filigree designed to be used beneath H2 text
     *
     * Default implementation: {@link FiligreeH2}
     */
    H2: any;
    /**
     * A filigree designed to be used beneath H3 text
     *
     * Default implementation: {@link FiligreeH3}
     */
    H3: any;
    /**
     * A filigree designed to be used around H4 text
     *
     * Default implementation: {@link FiligreeH4}
     */
    H4: any;
    /**
     * A filigree designed to be used as a small horizotnal divider
     *
     * Default implementation: {@link FiligreeSmall}
     */
    Small: any;
    /**
     * A filigree designed to be used around a title text to provide accent either side
     *
     * Default implementation: {@link FiligreeTitleAccent}
     */
    TitleAccent: any;
    /**
    /**
     * A filigree designed to be used as a gold frame around some content
     *
     * Default implementation: {@link FiligreeGoldFrame}
     */
    GoldFrame: any;
    /**
     * A filigree that takes in an icon to display in the middle of itself with css parameters
     *
     * Default implementation: {@link FiligreeTopIcon}
     */
    TopIcon: any;
    /**
     * An extra long filigree for framing the top of a panel
     *
     * Default implementation: {@link FiligreeWide}
     */
    Wide: any;
};
