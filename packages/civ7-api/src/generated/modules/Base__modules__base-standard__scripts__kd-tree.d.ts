import { Aabb2, WrapType } from "/base-standard/scripts/voronoi-utils.js";
export interface KdDataDist<Type> {
    data: Type;
    distSq: number;
}
export declare class kdTree<Type> {
    protected items: Type[];
    protected coords: Float32Array;
    protected count: number;
    getPos: (data: Type) => float2;
    constructor(getPos: (data: Type) => float2);
    build(data: readonly Type[]): void;
    private getLeftSubtreeSize;
    private buildRecursive;
    search(pos: float2): KdDataDist<Type> | undefined;
    protected searchInternal(nodeIdx: number, pos: float2, axis: number, best: KdDataDist<Type>): KdDataDist<Type>;
    searchMultiple(pos: float2, count: number): KdDataDist<Type>[];
    protected searchInternalMultiple(nodeIdx: number, pos: float2, axis: number, bestList: KdDataDist<Type>[], maxCount: number): KdDataDist<Type>[];
}
export declare class WrappedKdTree<Type> extends kdTree<Type> {
    bounds: Aabb2;
    wrapType: WrapType;
    constructor(getPos: (data: Type) => float2, bounds?: Aabb2, wrapType?: WrapType);
    search(pos: float2): KdDataDist<Type> | undefined;
}
