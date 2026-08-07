export declare class OrderedMinHeap<TData> {
    private _comparator;
    private readonly storage;
    constructor(_comparator: (item1: TData, item2: TData) => boolean);
    peek(): TData;
    pop(): TData;
    insert(item: TData): number;
    isEmpty(): boolean;
    remove(item: TData): boolean;
    removeAll(criteria: (item: TData) => boolean): TData[];
    findAll(criteria: (item: TData) => boolean): TData[];
    contains(criteria: (item: TData) => boolean): boolean;
    private removeIndex;
    private swap;
    private lessThan;
    private bubbleUp;
    private bubbleDown;
}
