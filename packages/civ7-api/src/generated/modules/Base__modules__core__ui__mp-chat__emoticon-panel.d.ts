/**
 * @file emoticon-panel.ts
 * @copyright 2023, Firaxis Games
 * @description Multiplayer Chat Emoticon panel
 */
import Panel from "/core/ui/panel-support.js";
export declare const mapGroupIdsToTooltipText: {
    EMOJI: string;
    RESOURCES: string;
    YIELDS: string;
};
export declare class EmoticonPanel extends Panel {
    private tabBar;
    private iconActivatables;
    private slotGroup;
    private tabBarSelectedListener;
    private iconActivateListener;
    private engineInputListener;
    private windowEngineInputListener;
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    onReceiveFocus(): void;
    private getContent;
    private onTabBarSelected;
    private onIconActivate;
    private onEngineInput;
    private handleEngineInput;
    private onWindowEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "emoticon-panel": ComponentRoot<EmoticonPanel>;
    }
}
