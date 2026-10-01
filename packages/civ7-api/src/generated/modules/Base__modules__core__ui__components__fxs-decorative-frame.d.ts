/**
 * FxsDecorativeFrame is a container element that creates a decorative frame around its content.
 *
 * Usage:
 * ```html
 * <fxs-decorative-frame>
 *   <div>Content</div>
 * </fxs-decorative-frame>
 * ```
 */
export declare class FxsDecorativeFrame extends Component {
    onInitialize(): void;
}
declare const FxsDecorativeFrameTagName = "fxs-decorative-frame";
declare global {
    interface HTMLElementTagNameMap {
        [FxsDecorativeFrameTagName]: ComponentRoot<FxsDecorativeFrame>;
    }
}
export {};
