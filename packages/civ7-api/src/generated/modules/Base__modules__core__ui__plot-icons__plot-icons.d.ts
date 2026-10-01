export declare enum IconAnimationState {
    NONE = 0,
    FIRST = 1,
    FADE = 2
}
declare class PlotIcons extends Component {
    private worldAnchorHandle;
    private location;
    onAttach(): void;
    onDetach(): void;
    private makeWorldAnchor;
    private destroyWorldAnchor;
    realizeScreenPosition(): void;
    setVisibility(revealedState: RevealedStates): void;
    show(): void;
    hide(): void;
}
export { PlotIcons as default };
