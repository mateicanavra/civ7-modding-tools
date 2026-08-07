import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { Vertex } from "/core/scripts/external/TypeScript-Voronoi-master/src/vertex.js";
import { Edge } from "/core/scripts/external/TypeScript-Voronoi-master/src/edge.js";
import { Cell } from "/core/scripts/external/TypeScript-Voronoi-master/src/cell.js";
export declare class Diagram {
    site: Site;
    vertices: Vertex[];
    edges: Edge[];
    cells: Cell[];
    execTime: number;
    constructor(site?: Site);
}
