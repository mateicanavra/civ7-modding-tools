/**
 * @file fxs-font-icon.ts
 * @copyright 2026, Firaxis Games
 */
/**
 * @file fxs-font-icon.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Icon Primitive
 */
/**
 * FxsFontIcon is a standard web component used for displaying icons within text.
 * It does not make use of our component framework due to the fact that this element may be
 * used before the component system has been initialized (e.g the Loading Screen).
 */
declare class FxsFontIcon extends HTMLElement {
    private refreshId;
    private inputContextChangedHandle;
    private activeDeviceChangedListener;
    private hasDeviceChangedListener;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _oldValue: string, newValue: string): void;
    private refreshIcon;
    private onActiveContextChanged;
    private onActiveDeviceChange;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-font-icon": FxsFontIcon;
    }
}
export { FxsFontIcon as default };
