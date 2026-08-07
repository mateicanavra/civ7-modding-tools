export declare class CircleEventHeap {
    y: Float64Array;
    x: Float64Array;
    indices: Uint32Array;
    size: number;
    constructor(initialSize: number);
    push(y: number, x: number, index: number): void;
    pop(): void;
    clear(): void;
    private swap;
    private bubbleUp;
    private bubbleDown;
}
