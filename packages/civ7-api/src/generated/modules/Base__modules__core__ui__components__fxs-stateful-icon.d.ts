/**
 * @file fxs-icon-group.ts
 * @copyright 2024, Firaxis Games
 * @description A component that uses the icon-group utility to create a group of icons that can be toggled between states.
 */
import { StatefulIcon } from "/core/ui/stateful-icon/index.js";
/**
 * FxsStatefulIcon creates a non activatable icon group where the you can supply a separate icon for each button state.
 *
 * @example
 * <fxs-stateful-icon
 * 	data-icon="icon-default.png"
 * 	data-icon-hover="icon-hover.png"
 * 	data-icon-focus="icon-focus.png"
 * 	data-icon-active="icon-active.png"
 * 	data-icon-disabled="icon-disabled.png"
 * </fxs-stateful-icon>
 */
export declare class FxsStatefulIcon extends Component {
    controller: StatefulIcon.Controller;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-stateful-icon": ComponentRoot<FxsStatefulIcon>;
    }
}
