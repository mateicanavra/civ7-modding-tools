/**
 * @file fxs-switch.ts
 * @copyright 2020-2023, Firaxis Games
 * @description A toggle switch primitive component.
 */
interface SwitchValueChangeEventDetail {
    value: boolean;
    forced: boolean;
}
export type SwitchValueChangeEvent = ComponentValueChangeEvent<SwitchValueChangeEventDetail>;
export declare class FxsSwitch extends ChangeNotificationComponent<SwitchValueChangeEventDetail> {
    private isChecked;
    private navHelp?;
    private readonly navContainer;
    private readonly onStateElements;
    private readonly offStateElements;
    private readonly ballElement;
    private leftValue;
    private resizeObserver;
    private onEngineInputListener;
    get disabled(): boolean;
    set disabled(value: boolean);
    toggle(force?: boolean | undefined): void;
    private onEngineInput;
    private addOrRemoveNavHelpElement;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private updateSwitchElements;
    private updateBallPosition;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-switch": ComponentRoot<FxsSwitch>;
    }
}
export {};
