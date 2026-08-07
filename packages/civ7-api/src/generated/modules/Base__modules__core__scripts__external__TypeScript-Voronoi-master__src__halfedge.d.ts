import { Vertex } from "/core/scripts/external/TypeScript-Voronoi-master/src/vertex.js";
import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { Edge } from "/core/scripts/external/TypeScript-Voronoi-master/src/edge.js";
export declare class Halfedge {
    site: Site;
    edge: Edge;
    angle: number;
    constructor(edge: Edge, lSite: any, rSite: Site);
    getStartpoint(): Vertex;
    getEndpoint(): Vertex;
}
