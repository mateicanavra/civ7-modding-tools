/**
 * @file fxs-tabcontrol.ts
 * @copyright 2021-2022, Firaxis Games
 * @description A tab control.
 */
export declare class FxsTabControl extends ChangeNotificationComponent {
    private numTabs;
    private tabBar;
    private tabButtons;
    private tabPanels;
    private rootSlot;
    private isVertical;
    private selectedTab;
    private iconWidth;
    private iconHeight;
    private navigateInputListener;
    private focusListener;
    constructor(root: ComponentRoot);
    /**
     *  Crack a list of tabs in the form 'name;class:name;class:name;class'.
     *  If "name" starts with "//game/" it is assumed to be an image URL rather
     *  than text and shown accordingly.  The control's "tab-icon-width" and
     *  "tab-icon-height" attributes then control the image size shown.
     *
     *  All controls with a class matching "class" will be reparented to the
     *  appropriate tab's slot.
     */
    private realizeTabs;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string, newValue: string | null): void;
    private selectTab;
    /** Add a new tab item and creates the tab (and container if necessary). */
    private addTab;
    private onNavigateInput;
    /**
     * @returns true if still live, false if input should stop.
     */
    private handleNavigation;
    /**
     * Respond to being directly set to focus.
     */
    protected onFocus(): void;
}
