/**
 * Common map script used by map generators and world builder to add various features to the map.
 * @packageDocumentation
 */
import { HexMap } from "/base-standard/scripts/hex-map.js";
export declare enum GenerationPhases {
    Lakes = 1,
    Elevation = 2,
    Hills = 4,
    Rainfall = 8,
    Rivers = 16,
    Biomes = 32,
    NaturalWonders = 64,
    FloodPlains = 128,
    Features = 256,
    Snow = 512,
    Resources = 1024,
    All = 2047
}
export declare function generateMapFeatures(hexMap: HexMap, phases?: GenerationPhases): any;
