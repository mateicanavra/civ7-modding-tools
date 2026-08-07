/**
 * @file fxs-progress-bar.ts
 * @copyright 2022, Firaxis Games
 * @description Progress bar component definition.
 */
export interface ProgressStepData {
    icon: string;
    stepNumber: number;
    progressAmount: number;
    description?: string;
    progressUntilThisStep?: number;
    classes?: string[];
}
/** @description Represents a progress towards a goal or number. */
declare class FxsProgressBar extends Component {
    private bar;
    private caption;
    private stepIconContainer;
    private _stepData;
    constructor(root: ComponentRoot);
    onAttach(): void;
    /** @description Override to establish a custom look for the progress bar.  */
    protected buildProgressBar(): void;
    set stepData(stepData: ProgressStepData[]);
    private realizeStepIcons;
    onAttributeChanged(name: string, _oldValue: string, newValue: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-progress-bar": ComponentRoot<FxsProgressBar>;
    }
}
export { FxsProgressBar as default };
