export declare class Heap<T> {
    private compare;
    private items;
    constructor(compare: (a: T, b: T) => number);
    get size(): number;
    peek(): T | undefined;
    push(value: T): void;
    pop(): T | undefined;
    clear(): void;
    rescore(itemFinder: (item: T) => boolean, updateScore: (item: T) => void): void;
    private bubbleUp;
    private bubbleDown;
}
export declare class IndexedMinHeap {
    private m_vals;
    private m_indices;
    private m_size;
    lastVal: number;
    constructor(initialSize: number);
    get size(): number;
    peek(): number;
    push(value: number, index: number): void;
    pop(): number;
    clear(): void;
    private swap;
    private bubbleUp;
    private bubbleDown;
}
