import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { Halfedge } from "/core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js";
export declare class Cell {
    site: Site;
    halfedges: Halfedge[];
    closeMe: boolean;
    neighborIds: number[];
    constructor(site: Site);
    init(site: Site): Cell;
    prepareHalfedges(): number;
    getNeighborIds(): number[];
    getBbox(): {
        x: any;
        y: any;
        width: number;
        height: number;
    };
    pointIntersection(x: any, y: number): number;
}
