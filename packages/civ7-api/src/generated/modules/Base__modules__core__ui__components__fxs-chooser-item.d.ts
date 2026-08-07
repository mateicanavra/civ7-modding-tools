/**
 * @file fxs-chooser-item.ts
 * @copyright 2024, Firaxis Games
 * @description Base component for chooser items.
 *
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
import { InputEngineEvent } from "/core/ui/input/input-support.js";
export declare const ChooserItemSelectedEventName = "chooser-item-selected";
/**
 * Dispatched when a chooser item is selected
 *
 * Default behavior is to set the selected attribute of the chooser item to true
 */
export declare class ChooserItemSelectedEvent extends CustomEvent<void> {
    constructor();
}
/**
 * FxsChooserItem can be used as a base class or can be used as a component directly
 *
 * NOTE: The ChooserItemSelectedEvent bubbles, so make sure you stop propagation when handling it.
 *
 * Attributes:
 *  content-direction (default: flex-row) - The css class used to set the direction of the content container
 * 	selected (default: false) - Is this chooser item selected?
 *	selectable-when-disabled (default: false) - Is this chooser item selectable when disabled?
 *    NOTE: setting the selected attribute directly does not trigger selectableWhenDisabled checks, use the class property instead.
 *  select-on-activate (default: false) - When true, select event are sent when the component is activated
 *	select-on-focus (default: false) - Select on focus mode allows selection AND confirmation using gamepad, instead of having to select and confirm as seperate steps.
 *    When true:
 *      The chooser item will automatically be selected when focused.
 *      chooser-item-selected events will be sent whenever the item is focused.
 * 		chooser-item-selected events will be sent by gamepad confirm or click if select-on-activate is true
 * 		action-activate events will only be sent when triggered by gamepad confirm.
 *    When false:
 *      The chooser item will NOT be selected when focused.
 * 		action-activate events will be sent on confirm or click.
 *  	chooser-item-selected events will be sent by gamepad confirm or click if select-on-activate is true
 *  show-frame-on-hover (default: true) - Shows the selection frame on hover
 *
 *	show-color-bg (default: true) - show the standard gray bg behind the chooser item (hud_sidepanel_list-bg)
 *
 *  NOTE: the enableDirectDriveMode() function will set select-on-focus and select-on-activate to true and show-frame-on-hover to false
 */
export declare class FxsChooserItem extends FxsActivatable {
    protected readonly highlight: any;
    protected readonly container: any;
    protected readonly selectedOverlay: any;
    protected readonly disabledOverlay: any;
    protected readonly iconLockToggleFuncs: any;
    get selected(): boolean;
    set selected(value: boolean);
    get selectOnFocus(): boolean;
    set selectOnFocus(value: boolean);
    get selectOnActivate(): boolean;
    set selectOnActivate(value: boolean);
    get selectableWhenDisabled(): boolean;
    set selectableWhenDisabled(value: boolean);
    get showFrameOnHover(): boolean;
    set showFrameOnHover(value: boolean);
    get showColorBG(): boolean;
    set showColorBG(value: boolean);
    get contentDirection(): any;
    constructor(root: ComponentRoot<FxsChooserItem>);
    onAttach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    onActivatableBlur(): void;
    onActivatableFocus(): void;
    onActivatableEngineInput(inputEvent: InputEngineEvent): void;
    enableDirectDriveMode(): void;
    toggleIconLock(iconEle: HTMLElement, isLocked: boolean): void;
    createChooserIcon(iconStr: string, isLocked: boolean): HTMLElement;
    protected renderChooserItem(): void;
    protected triggerSelection(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-chooser-item": ComponentRoot<FxsChooserItem>;
    }
    interface HTMLElementEventMap {
        "chooser-item-selected": ChooserItemSelectedEvent;
    }
}
