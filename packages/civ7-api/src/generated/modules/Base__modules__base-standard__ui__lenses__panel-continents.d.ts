/**
 * @file panel-continents.ts
 * @copyright 2024, Firaxis Games
 * @description Panel providing additional continent information
 */
import { LensActivationEvent } from "/core/ui/lenses/lens-manager.js";
import Panel from "/core/ui/panel-support.js";
export declare class ContinentLensInfo extends Panel {
    private subsystemFrameCloseListener;
    private engineInputListener;
    private readonly activeLensChangedListener;
    private continentListContainer;
    private frame;
    private get isExplorationAge();
    private get isModernAge();
    inputContext: InputContext;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onActiveLensChanged(event: LensActivationEvent): void;
    private initPanel;
    private addContinentInfoRow;
    addIconKeyRow(iconURL: string, locTitle: string): void;
    private getContinentResearchState;
    protected close(): void;
    private onEngineInput;
}
