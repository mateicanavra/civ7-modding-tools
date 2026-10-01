import { Accessor, Component, ParentComponent } from "solid-js";
import { TabContextProvider, TabProps } from "/core/ui-next/components/tab.js";
export declare enum ScreenFlowStepType {
    Normal = 0,
    /** Only 1 screen in a flow may be marked with hub */
    Hub = 1,
    /** Only 1 screen in a flow may be marked with start */
    Start = 2
}
export interface ScreenFlowScreen {
    /** The name of tab that is active with this step */
    name: string;
    /** The name of the step this group belongs to */
    step?: string;
    /** CLOSE and START trigger onClose and onStart respectively, otherwise this is a screen name */
    next?: string;
    /** CLOSE and START trigger onClose and onStart respectively, otherwise this is a screen name */
    prev?: string;
    /** Is this screen the hub or start screen? */
    type?: ScreenFlowStepType;
}
export declare class ScreenFlowContextProvider extends TabContextProvider {
    private screens;
    private onClose;
    private onStart;
    private _currentScreen;
    private _startScreen;
    private _isStartActive;
    private _hubScreen;
    private _wasHubVisited;
    private _setWasHubVisited;
    private _isHubActive;
    private _currentStep;
    private _numSteps;
    get isStartActive(): Accessor<boolean>;
    get isHubActive(): Accessor<boolean>;
    get wasHubVisited(): Accessor<boolean>;
    get currentStep(): Accessor<number>;
    get numSteps(): Accessor<number>;
    constructor(screens: ScreenFlowScreen[], onClose?: (screenName: string) => void, onStart?: (screenName: string) => void);
    activatePrev(): any;
    activateNext(): any;
    clearHub(): void;
    close(): void;
    start(): void;
}
export declare const ScreenFlowContext: any;
export declare function useScreenFlowContext(): any;
export declare const ScreenFlowStepCount: Component;
export interface ScreenFlowTabProps extends TabProps {
    screens: ScreenFlowScreen[];
    onClose?: (screenName: string) => void;
    onStart?: (screenName: string) => void;
    contextRef?: (context: ScreenFlowContextProvider) => void;
}
export declare const ScreenFlowTab: ParentComponent<ScreenFlowTabProps>;
