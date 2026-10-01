/**
 * @file fxs-hof-chart.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Icon Primitive
 */
declare class FxsHofChart extends Component {
    private refreshId;
    private canvas;
    private chartData;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    requestRefresh(): void;
    onAttributeChanged(_name: string, _oldValue: string, _newValue: string): void;
    private getBoolAttribute;
    private getPlayerIDAttribute;
    private getComponentIDAttribute;
    private refreshChart;
    private getObjectName;
    private getRandomColor;
    private getObjectColors;
    private determineChartType;
    private createChartData;
}
export { FxsHofChart as default };
