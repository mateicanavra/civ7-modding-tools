import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { Vertex } from "/core/scripts/external/TypeScript-Voronoi-master/src/vertex.js";
export declare class Edge {
    lSite: Site;
    rSite: Site;
    va: Vertex;
    vb: Vertex;
    constructor(lSite: any, rSite: Site);
}
