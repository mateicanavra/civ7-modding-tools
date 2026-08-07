import FxsActivatable from "/core/ui/components/fxs-activatable.js";
export declare class FxsMinMaxButton extends FxsActivatable {
    private arrowIsUp;
    private mouseEnterEventListener;
    private mouseLeaveEventListener;
    private actionActivateEventListener;
    get disabled(): boolean;
    constructor(root: ComponentRoot);
    private onMouseEnter;
    private onMouseLeave;
    private onActionActivate;
    private toggle;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-minmax-button": ComponentRoot<FxsMinMaxButton>;
    }
}
