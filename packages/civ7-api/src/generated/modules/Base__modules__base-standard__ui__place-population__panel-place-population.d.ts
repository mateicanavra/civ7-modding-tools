/**
 * @file panel-place-population.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Displays all the useful information when attempting to place new population
 */
import Panel from "/core/ui/panel-support.js";
declare class PlacePopulationPanel extends Panel {
    private readonly subsystemFrame;
    private readonly placeImprovementFrame;
    private readonly improvementMinimizedContainer;
    private readonly improvementMaximizedContainer;
    private readonly improvementExpandText;
    private readonly improvementTouchExpandText;
    private readonly placeSpecialistFrame;
    private readonly specialistMinimizedContainer;
    private readonly specialistMaximizedContainer;
    private readonly specialistExpandText;
    private readonly specialistTouchExpandText;
    private onToggleGrowthMinMaxListener;
    private engineInputEventListener;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    private buildView;
    private buildPopulationPlacementInfo;
    private buildSpecialistInfo;
    private buildSpecialistMinimized;
    private buildSpecialistMaximized;
    private buildImprovementInfo;
    private buildImprovementMinimized;
    private buildImprovementMaximized;
    private onInterfaceModeChanged;
    private setHidden;
    protected requestClose(): void;
    private onToggleGrowthMinMax;
    private onPlacePopulationSelectionChanged;
    private toggleMinMax;
    private onEngineInput;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-place-population": ComponentRoot<PlacePopulationPanel>;
    }
}
export {};
