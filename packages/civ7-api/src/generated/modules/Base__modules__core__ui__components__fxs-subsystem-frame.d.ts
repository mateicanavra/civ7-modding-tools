/**
 * @file fxs-subsystem-frame.ts
 * @copyright 2024, Firaxis Games
 */
export declare class SubsystemFrameCloseEvent extends CustomEvent<void> {
    constructor();
}
/**
 * A subsystem frame with built-in close button, scrolling, and header/footer.
 *
 * - Use data-slot="header" or data-slot="footer" in HTML to put elements in specific areas (if not specified, the content area will be used).
 * - Query for .subsystem-frame__header, .subsystem-frame__content, or .subsystem-frame__footer to find these areas in TypeScript.
 * - Close events can be captured with a "subsystem-frame-close" event listener
 * - Use data-header-class and data-footer-class to add classes to the header and footer
 * This class is designed to be as static as possible so attribute updates are not supported.
 */
export declare class FxsSubsystemFrame extends Component {
    private topBar;
    private frameBg;
    private content;
    private closeButton?;
    private header?;
    private footer?;
    onInitialize(): void;
    onAttach(): void;
    private handleClose;
    private render;
    private updateFrameBg;
    private updateTopBar;
    private updateContentSpacing;
    private updateRootFrameClass;
    private updateCloseButton;
    private updateSubFrameDecorators;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-subsystem-frame": ComponentRoot<FxsSubsystemFrame>;
    }
    interface HTMLElementEventMap {
        "subsystem-frame-close": SubsystemFrameCloseEvent;
    }
}
