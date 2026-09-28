/**
 * Common map script used by map generators and world builder to add various features to the map.
 * @packageDocumentation
 */
import { HexMap } from "/base-standard/scripts/hex-map.js";
export declare enum GenerationPhases {
    Lakes = 1,
    Continents = 2,
    Elevation = 4,
    Hills = 8,
    Rainfall = 16,
    Rivers = 32,
    Biomes = 64,
    NaturalWonders = 128,
    FloodPlains = 256,
    Features = 512,
    Snow = 1024,
    Resources = 2048,
    WriteToTerrainBuilder = 4096,
    All = 4294967295
}
export declare class GenerationContext {
    phases: GenerationPhases;
    bRunAestheticRiverValidation: boolean;
    largeRiverPercent: number;
    minNavRiverLength: number;
    minUpstreamMinorRivers: number;
}
export declare function generateMapFeatures(hexMap: HexMap, context?: GenerationContext): any;
