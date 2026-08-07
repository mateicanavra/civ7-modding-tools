/**
 * @file fxs-inner-frame.ts
 * @copyright 2024, Firaxis Games
 */
/**
 * An inner frame component, designed to be used inside other frame components
 */
export declare class FxsInnerFrame extends Component {
    onInitialize(): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-inner-frame": ComponentRoot<FxsInnerFrame>;
    }
}
