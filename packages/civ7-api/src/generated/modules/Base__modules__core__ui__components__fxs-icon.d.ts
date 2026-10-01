/**
 * @file fxs-icon.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Icon Primitive
 */
export declare class FxsIcon extends Component {
    private renderQueued;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-icon": ComponentRoot<FxsIcon>;
    }
}
