import { VoronoiValidationSettings } from "/base-standard/scripts/hex-map.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { VoronoiArchipelagoSettings } from "/base-standard/scripts/voronoi_maps/archipelago.js";
import { VoronoiContinentsSettings } from "/base-standard/scripts/voronoi_maps/continents.js";
import { VoronoiFractalSettings } from "/base-standard/scripts/voronoi_maps/fractal.js";
import { VoronoiShatteredSeasSettings } from "/base-standard/scripts/voronoi_maps/shattered-seas.js";
import { UnifiedContinentsBase, UnifiedContinentsBaseSettings } from "/base-standard/scripts/voronoi_maps/unified-continents-base.js";
export interface AdditionalShuffleSettings {
    totalSizeScale: number;
    coastalIslands: number;
    coastalIslandsMaxDistance: number;
    coastalIslandsMinDistance: number;
    coastalIslandsSize: number;
    coastalIslandsSizeVariance: number;
}
export interface VoronoiShuffleSettings extends UnifiedContinentsBaseSettings {
    sectionCount: number;
    sectionSizeVariance: number;
    continentsWeight: number;
    fractalWeight: number;
    archipelagoWeight: number;
    shatteredSeasWeight: number;
    continentsSettings: VoronoiContinentsSettings & AdditionalShuffleSettings;
    fractalSettings: VoronoiFractalSettings & AdditionalShuffleSettings;
    archipelagoSettings: VoronoiArchipelagoSettings & AdditionalShuffleSettings;
    shatteredSeasSettings: VoronoiShatteredSeasSettings & AdditionalShuffleSettings;
}
export declare enum SectionType {
    Continents = 0,
    Fractal = 1,
    Archipelago = 2,
    ShatteredSeas = 3
}
export interface SectionArea {
    startRadians: number;
    sweepRadians: number;
    type: SectionType;
}
export declare const shuffleMapSchema: MapSettingSchema;
export declare class VoronoiShuffle extends UnifiedContinentsBase<VoronoiShuffleSettings> {
    m_sectionTypes: SectionType[];
    constructor();
    init(hexDims: float2): void;
    simulateInternal(): void;
    protected getVoronoiValidationSettings(): VoronoiValidationSettings;
    protected getPlayerLandmassFromCell(cell: RegionCell): number;
    protected getSectionWeights(): number[];
    protected getSectionTypes(count: number): SectionType[];
    private buildSectionAreas;
    private buildSectionFor;
    getChosenMapTypes(): SectionType[];
    static getName(): string;
    getFilename(): string;
}
