import { Diagram } from "/core/scripts/external/TypeScript-Voronoi-master/src/diagram.js";
import { WrapType } from "/base-standard/scripts/voronoi-utils.js";
export declare class VoronoiBuilder {
    private m_diagram;
    private m_diagramDims;
    private m_wrap;
    constructor();
    init(hexDims: float2, cellCountMultiple: number, relaxationSteps: number, wrap?: WrapType): void;
    getDiagram(): Diagram;
    getDiagramDims(): float2;
    private buildVoronoi;
}
