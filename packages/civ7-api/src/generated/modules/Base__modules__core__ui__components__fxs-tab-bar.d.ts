import { StatefulIcon } from "/core/ui/stateful-icon/index.js";
import "/core/ui/components/fxs-tab-item.js";
export interface TabSelectedEventDetail<T = TabItem> {
    index: number;
    selectedItem: T;
}
export declare class TabSelectedEvent<T extends TabItem = TabItem> extends CustomEvent<TabSelectedEventDetail<T>> {
    constructor(detail: TabSelectedEventDetail<T>);
}
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type TabItemIcon = string | StatefulIcon.URLMap;
export interface TabItem {
    disabled?: boolean;
    /** className is a per-item space separated list of classes to add to this tab item */
    className?: string;
    id: string;
    /** icon is an fs:// url or object of fs:// urls (for states) to use as the src of an img element in the tab item */
    icon?: TabItemIcon;
    /** iconClass is a space separated list of classes to apply to the icon element */
    iconClass?: string;
    /** label is a passed to the tab-item element and used via data-l10n-id */
    label?: string;
    /** is the label not wrap on overflow */
    nowrap?: boolean;
    /** tooltip is a loc string */
    tooltip?: string;
    /** if true adds a tutorial highlight */
    highlight?: boolean;
    /** text to go inside an icon */
    iconText?: string;
}
export type IconTabItem = Omit<RequireKeys<TabItem, "icon">, "label" | "labelClass">;
/**
 * To use the tab bar, include the `fxs-tab-bar` element in your HTML. The `tab-items` attribute should contain a JSON array of objects with the following properties:
 *
 * - `label`: The label for the tab. This should be a localization ID.
 * - `icon`: The icon for the tab.
 *
 * The `type` attribute can be set to `'mini'` or `'flipped'` to change the appearance of the tab bar. The default type is `'default'`.
 *
 * The `tab-for` attribute is an optional selector that can be used to specify the ancestor the tab bar component should attach the navigation event handler to. This should be the "panel" or "screen" that the tab bar is a child of. The default value is `'fxs-frame'`.
 *
 * For advanced use cases, the tab bar can be customized by subclassing and overriding the following methods:
 *
 * - `renderTabOrnaments`: Renders ornaments appended directly to the root of the tab bar.
 * - `renderSelectionIndicators`: Renders the ornamental elements used to indicate the selected tab.
 * - `onSelectorPositionUpdate`: Called after a tab is selected to update highlight element positions.
 * - `renderTabDivider`: Renders a divider between tab items.
 * - `renderTab`: Renders a single tab item with the given icon and label.
 *
 * Update the UI in response to tab selection by listening for the `tab-selected` event. For example:
 *
 * ```ts
 * // Using a slot group
 * const slotGroup = document.querySelector('fxs-slot-group');
 *
 * const tabControl = document.querySelector('fxs-tab-bar');
 * tabControl.addEventListener('tab-selected', (event: TabSelectedEvent) => {
 *   slotGroup.setAttribute('selected-slot', `panel-${event.detail.id}`);
 * });
 * ```
 */
export declare class FxsTabBar extends Component {
    private selectedTabIndex;
    protected containerElement: HTMLDivElement;
    protected selectionIndicatorElement: HTMLDivElement;
    protected selectionIndicatorPositionValue: any;
    private readonly navHelpLeftElement;
    private readonly navHelpRightElement;
    private tabItems;
    private tabElements;
    private useAltControls;
    /**
     * navHandler is the element to attach the navigation handler to.
     * Higher up the tree enables tabbing from anywhere in the screen.
     */
    private navHandler;
    private resizeObserver;
    private handleResizeEventListener;
    private navigateInputEventListener;
    get disabled(): boolean;
    set disabled(value: boolean);
    private onNavigateInput;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    tabSelected(index: number): void;
    private findPreviousTab;
    private findNextTab;
    /**
     * Read in the tab data attribute and update the tab bar state
     */
    private updateTabItems;
    private clearTabItems;
    private updateNavHelp;
    /**
     * Called after a tab is selected to update highlight element positions.
     *
     * Override this method to customize how highlight elements are positioned. If you override this method, you must also override `renderSelectionIndicators`.
     */
    private onSelectorPositionUpdate;
    /**
     * Calls the `onUpdateSelectorPosition` method after the next layout update.
     */
    private doSelectorPositionUpdate;
    /**
     * Render the whole tab bar, but don't worry about the state yet.
     */
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-tab-bar": ComponentRoot<FxsTabBar>;
    }
    interface HTMLElementEventMap {
        "tab-selected": TabSelectedEvent;
    }
}
export { FxsTabBar as default };
