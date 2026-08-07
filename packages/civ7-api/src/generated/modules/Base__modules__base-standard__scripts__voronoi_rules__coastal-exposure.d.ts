import { TerrainType, VectorField } from "/base-standard/scripts/voronoi-types.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
declare class CoastalExposure {
    m_coastNormal: float2;
    m_exposure: number;
}
export declare class RuleCoastalExposure extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    m_inTileTypes: TerrainType[];
    m_vectorField: VectorField | undefined;
    init(inTileTypes: TerrainType[] | undefined, vectorField: VectorField): void;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    findCoasts(cell: RegionCell, cells: RegionCell[]): {
        coasts: CoastalExposure[];
        isIsland: boolean;
    };
    score(cell: RegionCell, ctx: ScoringContext): number;
}
export {};
