import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { Edge } from "/core/scripts/external/TypeScript-Voronoi-master/src/edge.js";
export declare const NIL = -1;
export interface RBLinks {
    parent: Int32Array;
    prev: Int32Array;
    next: Int32Array;
    left: Int32Array;
    right: Int32Array;
    red: Uint8Array;
}
export declare class RBTreeIdx {
    root: number;
    constructor();
    insertSuccessor(L: RBLinks, node: number, successor: number): void;
    removeNode(L: RBLinks, node: number): void;
    rotateLeft(L: RBLinks, node: number): void;
    rotateRight(L: RBLinks, node: number): void;
    first(L: RBLinks, node: number): number;
    last(L: RBLinks, node: number): number;
}
export declare class BeachPool {
    capacity: number;
    size: number;
    freeList: Int32Array;
    freeTop: number;
    links: RBLinks;
    siteRef: (Site | null)[];
    edgeRef: (Edge | null)[];
    circleEventIdx: Int32Array;
    siteX: Float64Array;
    siteY: Float64Array;
    constructor(initialCapacity: number);
    ensureCapacity(min: number): void;
    alloc(site: Site): number;
    free(idx: number): void;
    reset(): void;
    private grow;
}
