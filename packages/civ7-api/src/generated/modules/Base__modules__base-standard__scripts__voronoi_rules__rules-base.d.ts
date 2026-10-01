import { ConfigValueRecord, ConfigValueRecordTyped, ParameterSpecRecord, RuleConfigType } from "/base-standard/scripts/voronoi-types.js";
import { PlateRegion, VoronoiRegion } from "/base-standard/scripts/voronoi-region.js";
import { RegionCell, WrapDistOptions } from "/base-standard/scripts/voronoi-utils.js";
export interface ScoringContext {
    cells: RegionCell[];
    region: VoronoiRegion;
    regions: VoronoiRegion[];
    plateRegions: PlateRegion[];
    m_worldDims: float2;
    totalArea: number;
    cellCount: number;
    rules: Record<string, Rule>;
    wrap: WrapDistOptions;
}
export declare abstract class Rule {
    abstract name: string;
    description?: string;
    isActive: boolean;
    weight: number;
    abstract parameterSpecs: ParameterSpecRecord;
    abstract configValues: ConfigValueRecord;
    abstract score(cell: RegionCell, ctx: ScoringContext): number;
    notifySelectedCell(_cell: RegionCell, _ctx: ScoringContext): void;
    initialize(config: RuleConfigType): void;
    static createDefaultsFromSpecs<TSpecs extends ParameterSpecRecord>(specs: TSpecs): ConfigValueRecordTyped<TSpecs>;
    prepare(): void;
    scoreAllCells(filter: (value: RegionCell) => boolean, ctx: ScoringContext, regionIdGetter: (value: RegionCell) => VoronoiRegion, weight?: number): void;
    scoreCells(cells: RegionCell[], ctx: ScoringContext, regionIdGetter: (value: RegionCell) => VoronoiRegion, weight?: number): void;
}
