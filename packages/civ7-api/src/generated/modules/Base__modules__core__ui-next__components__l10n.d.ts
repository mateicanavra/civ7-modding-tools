import { JSX } from "solid-js";
export interface LocaleProps {
    /**  The localization string to compose. */
    text: string;
    /** A list of arguments to feed into the string. */
    args?: LocalizedTextArgument[];
}
export type StylizeProps = LocaleProps & JSX.BaseHTMLAttributes<HTMLDivElement> & {
    disableTooltips?: boolean;
};
/**
 * A collection of localiation components
 */
export declare const L10n: {
    /**
     * Compose text using the Locale.Compose.
     * Generate text given a localization-syntax string and additional optional arguments
     * ```tsx
     * <L10n.Compose text="LOC_EXAMPLE_STRING" args={["LOC_ARG_1", 2]} />
     * ```
     * Default implementation: {@link Compose}
     * @param {LocaleProps} props See {@link LocaleProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.text The localization string to compose.
     * @param {LocalizedTextArgument[]} props.args A list of arguments to feed into the string. Default: undefined
     */
    Compose: any;
    /**
     * Compose text using the Locale.Stylize.
     * Convert a string or localized text containing stylized markup into HTML formatted text.
     * ```tsx
     * <L10n.Stylize text="LOC_EXAMPLE_STRING" args={["LOC_ARG_1", 2]} />
     * ```
     * Default implementation: {@link Stylize}
     * @param {StylizeProps} props See {@link StylizeProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.text The localization string to stylize.
     * @param {LocalizedTextArgument[]} props.args A list of arguments to feed into the string. Default: undefined
     */
    Stylize: any;
};
