import { Accessor, JSX, JSXElement, ParentComponent, type Component } from "solid-js";
import { RadioButtonSize } from "/core/ui-next/components/radio-button.js";
import { TriggerHost, TriggerProps, TriggerType } from "/core/ui-next/components/trigger.js";
import { PropsRef } from "/core/ui-next/utilities/solid-utilities.js";
export interface TabItemProps {
    /** The name of the trigger which activates this tab. Because it is used for triggers and querries, the name is not reactive and should not be changed after creation. */
    name: string;
    /** The title factory. This will appear as an item in the Tab.TabList and Tab.Title components. */
    title: Accessor<JSXElement>;
    /** The body factory. This will appear in the Tab.TabOutput when this tab is selected. */
    body: Accessor<JSXElement>;
    /** Is this tab disabled? Default: false */
    disabled?: boolean;
    /** Gets a reference of the component. For more info see {@link https://docs.solidjs.com/concepts/refs Refs}  */
    ref?: PropsRef<HTMLDivElement>;
}
export declare class TabContextProvider implements TriggerHost {
    private _active;
    private _setActive;
    private _tabs;
    private _mutateTabs;
    private _isActive;
    private defaultTab;
    get active(): Accessor<TabItemProps | undefined>;
    get tabs(): Accessor<TabItemProps[]>;
    get isActive(): (key: string) => boolean;
    constructor();
    onTrigger(name: string, type: TriggerType, _source: HTMLElement | undefined): void;
    register(tab: TabItemProps): void;
    unregister(tabName: string): void;
    activate(tabName: string): boolean;
    activateNext(): boolean;
    activatePrevious(): boolean;
    setDefaultTab(tabName: string): void;
    getActiveTabIndex(): any;
}
export declare const TabContext: any;
export declare function useTabContext(): any;
export interface TabProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The tab which should be shown on start. Default: undefined (will use first tab) */
    defaultTab?: string;
    /** Event which triggers when the tab changes */
    onTabChanged?: (tab: TabItemProps | undefined) => void;
    /** For controlling the tabs outside the context */
    activeTab?: Accessor<string>;
}
export interface TabListBaseProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The hotkey which cycles to the next tab. Default: nav-previous */
    previousHotkey?: string;
    /** The hotkey which cycles to the next tab. Default: nav-next */
    nextHotkey?: string;
    /** Is this tab list disabled? Default: false */
    disabled?: boolean;
}
export interface TabListProps extends TabListBaseProps {
    /** Should the tab list show controller nav helpers when using a controller? Default: true */
    showNavHelp?: boolean;
    showPages?: boolean;
    /** Class info to apply to the tab item's name  */
    titleClass?: string;
}
export interface TabListRadioProps extends TabListProps {
    size?: RadioButtonSize;
}
export type TabComponents = ParentComponent<TabProps> & {
    /**
     * A tab item to be displayed in a {@link Tab} component.
     * ```tsx
     *   <Tab.Item Title={() => "Tab Title"} Body={() => "Tab Contents"} />
     * ```
     * Default implementation: {@link TabItemComponent}
     * @param {TabItemProps} props See {@link TabItemProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.name The name of the trigger which activates this tab. Because it is used for triggers and querries, the name is not reactive and should not be changed after creation.
     * @param {string} props.title The title factory. This will appear as an item in the {@link Tab.TabList} and {@link Tab.Title} components.
     * @param {string} props.body The body factory. This will appear in the {@link Tab.Output} when this tab is selected.
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    Item: Component<TabItemProps>;
    /**
     * The tab output component.
     * Displays the body of the currently selected {@link Tab.Item}
     * ```tsx
     *   <Tab.Output />
     * ```
     * Default implementation: {@link TabOutputComponent}
     * @param {TabOutputProps} props See {@link TabOutputProps} for a full list of properties
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    Output: Component;
    /**
     * The tab title component.
     * Displays the title of the currently selected {@link Tab.Item}
     * ```tsx
     *   <Tab.Header />
     * ```
     * Default implementation: {@link TabTitleComponent}
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    Title: Component;
    /**
     * The tab trigger component.
     * Can be used to trigger tab changes from components within the {@link Tab}.
     * Also useful for implementing custom derivations of {@link Tab.TabList}.
     * ```tsx
     * <Tab>
     *   <Tab.TabList />
     *   <Tab.Output />
     *   <Tab.Item name="tab1" title={() => "Tab 1"} body={() => "Tab 1 Contents"} />
     *   <Tab.Item name="tab2" title={() => "Tab 2"} body={() => (
     *     <Tab.Trigger name="tab1">
     *       <Button>Switch to Tab 1</Button>
     *     </Tab.Trigger>
     *    )}/>
     * </Tab>
     * ```
     * @param {TriggerProps} props See {@link TriggerProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.name The name of the tab to activate, changing the selected tab.
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    Trigger: ParentComponent<TriggerProps>;
    /**
     * The defualt tab list.
     * Displays a list of a available tabs with a bar under the selected tab, to be used as a header.
     * ```tsx
     * <Tab.TabList />
     * ```
     * Default implementation: {@link TabListComponent}
     * @param {TabListProps} props See {@link TabListProps} for a full list of properties
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    TabList: Component<TabListProps>;
    /**
     * A pip based tab list.
     * Displays a list of a available tabs as pips.
     * ```tsx
     * <Tab.TabListPips />
     * ```
     * Default implementation: {@link TabListPips}
     * @param {TabListRadioProps} props See {@link TabListRadioProps} for a full list of properties
     * @see {@link Tab} for more information about tabs and each of its sub-components.
     */
    TabListPips: Component<TabListRadioProps>;
};
/**
 * A freeform tab component.
 * Allows the display of multiple screens on the same page using tabbed navigation to switch between them.
 * This component acts as the coordinator for the other tab component pieces and does not have any display logic on its own.
 * Add a Tab.TabList as a child to display the list of tabs, a Tab.Output to show the contents of the currently selected tab, and a Tab.Item for each tab you want to display.
 * ```tsx
 * <Tab>
 *   <Tab.TabList />
 *   <Tab.Output />
 *   <Tab.Item Title={() => "Tab 1"} Body={() => "Tab 1 Contents"} />
 *   <Tab.Item Title={() => "Tab 2"} Body={() => "Tab 2 Contents"} />
 * </Tab>
 * ```
 * Default implementation: {@link TabComponent}
 * @param {TabProps} props See {@link TabProps} for a full list of properties
 * @see {@link Tab.Item}, {@link Tab.Output}, {@link Tab.Title}, {@link Tab.Trigger}, {@link Tab.TabList}, {@link Tab.TabListPips} for more information about each of the sub-components.
 */
export declare const Tab: TabComponents;
