/**
 * @file fxs-frame.ts
 * @copyright 2024, Firaxis Games
 * @description A visual frame container.
 *
 * Creates a frame for modal content
 */
export declare class FxsModalFrame extends Component {
    private _content;
    protected get content(): HTMLElement;
    protected contentAs: keyof HTMLElementTagNameMap;
    protected contentClass: string;
    private get modalStyle();
    onInitialize(): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-modal-frame": ComponentRoot<FxsModalFrame>;
    }
}
