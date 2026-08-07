/**
 * @file panel-general-appeal-legend.ts
 * @copyright 2025, Firaxis Games
 * @description Panel providing additional general-appeal information
 */
import { LensActivationEvent } from "/core/ui/lenses/lens-manager.js";
export declare class TerrainLegend extends Component {
    private readonly activeLensChangedListener;
    constructor(root: ComponentRoot);
    private render;
    private addRow;
    onAttach(): void;
    onDetach(): void;
    onActiveLensChanged(event: LensActivationEvent): void;
}
