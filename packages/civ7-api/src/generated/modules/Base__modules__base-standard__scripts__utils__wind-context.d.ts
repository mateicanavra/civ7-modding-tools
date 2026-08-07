import { VectorField } from "/base-standard/scripts/voronoi-types.js";
export declare class WindContextDesc {
    m_equatorialOffset: number;
    m_latitudeCompression: number;
    m_hadleyCellStrength: number;
}
export declare class WindContext implements VectorField {
    private m_desc;
    constructor(desc: WindContextDesc);
    sampleLatLong(latDeg: number, lonDeg: number): float2;
    sampleUV(u: number, v: number): float2;
    sampleSigned(_x: number, y: number): float2;
}
