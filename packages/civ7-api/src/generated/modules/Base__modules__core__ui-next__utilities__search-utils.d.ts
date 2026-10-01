export declare class FullTextSearch {
    private context;
    curKey: number;
    constructor(context: string);
    find(query: string): Set<string>;
    addSearchData(data: {
        key: string;
        title: string;
        fullText: string;
    }[]): void;
}
