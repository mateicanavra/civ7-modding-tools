/**
 * @file fxs-header.ts
 * @copyright 2020-2024, Firaxis Games
 */
/**
 * A header for a screen or panel
 * When the element is attached to the DOM, if font classes are not specified, "text-secondary" and "font-title-lg" are added.
 */
export declare class FxsHeader extends Component {
    /**
     * Whether or not a render was queued to for the component due to modifications.
     */
    protected renderQueued: boolean;
    get titleText(): string | null;
    get filigreeStyle(): string;
    get truncate(): string;
    get bgGlow(): boolean;
    get fontFitClassName(): "font-fit-shrink" | "font-fit" | null;
    get whitespaceWrapClassName(): "whitespace-nowrap" | "break-words" | null;
    get fontMinSize(): any;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(_name: string, _oldValue: string, _newValue: string): void;
    protected render(): void;
    protected generateText(text: string): string;
    protected generateGlow(bgGlow: boolean): "<div class=\"h-24 absolute -top-7 img-fxs-header-glow pointer-events-none\"></div>" | "";
    protected getStyleHtml(style: string, text: string | null, bgGlow: boolean): string;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-header": ComponentRoot<FxsHeader>;
    }
}
