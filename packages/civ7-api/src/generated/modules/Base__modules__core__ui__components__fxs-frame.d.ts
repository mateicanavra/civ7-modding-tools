/**
 * @file fxs-frame.ts
 * @copyright 2025, Firaxis Games
 * @description A visual frame container.
 *
 * Creates a styled frame of content, varying in size from popups to full menus (e.g.  the Confirm Exit to Desktop popup)
 */
/**
 *
 * FxsFrame provides a styled frame for content.
 *
 * Use the content-as attribute to specify the type of the content element (e.g. fxs-vslot).
 * Use the content-class attribute to specify the classes of the content element.
 *
 * Usage (composition):
 *
 * <fxs-frame content-as="fxs-vslot">
 *   <my-item></my-item>
 *   <my-item></my-item>
 * </fxs-frame>
 *
 */
export declare const FrameCloseEventName: string;
export declare class FrameCloseEvent extends CustomEvent<{
    x: number;
    y: number;
}> {
    constructor(x: number, y: number);
}
export declare class FxsFrame extends Component {
    private _content;
    private frameBg;
    protected get content(): HTMLElement;
    protected contentAs: keyof HTMLElementTagNameMap;
    protected contentClass: string;
    onInitialize(): void;
    onAttach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, _newValue: string | null): void;
    private updateOverrideStyling;
    private updateFrameBg;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-frame": ComponentRoot<FxsFrame>;
    }
}
