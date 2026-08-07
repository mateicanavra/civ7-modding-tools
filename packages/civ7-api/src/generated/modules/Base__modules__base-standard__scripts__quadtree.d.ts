import { Aabb2, WrapType } from "/base-standard/scripts/voronoi-utils.js";
export declare class QuadTree<T> {
    protected bounds: Aabb2;
    private capacity;
    private maxDepth;
    private depth;
    private getPos;
    private items;
    private children;
    constructor(bounds: Aabb2, getPos: (item: T) => float2, capacity?: number, maxDepth?: number, depth?: number);
    size(): number;
    insert(item: T): boolean | void;
    nearest(target: float2, filter?: ((item: T) => boolean) | undefined, maxDistance?: any): {
        cell: T | null;
        distSq: number;
    };
    private nearestInternal;
    queryRange(range: Aabb2, out: T[]): void;
    private insertIntoChild;
    private subdivide;
    private childIndex;
}
export declare class WrappedQuadTree<T> extends QuadTree<T> {
    wrapType: WrapType;
    constructor(bounds: Aabb2, getPos: (item: T) => float2, capacity: number | undefined, maxDepth: number | undefined, wrapType: WrapType);
    nearest(target: float2, filter?: ((item: T) => boolean) | undefined, maxDistance?: any): {
        cell: T | null;
        distSq: number;
    };
    queryRange(rangeBounds?: Aabb2, out?: T[]): void;
}
