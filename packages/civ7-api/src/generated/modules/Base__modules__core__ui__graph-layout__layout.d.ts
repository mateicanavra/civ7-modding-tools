/**
 * @file layout.ts
 * @copyright 2022, Firaxis Games
 * @description Layout class for graphs
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
export declare class GraphLayout {
    private inputGraph;
    private layoutGraph;
    private rankedLayoutGraph;
    constructor(graph: Graph);
    autoResolve(): Graph;
    getLayoutGraph(): Graph;
    private buildLayoutGraph;
    private rank;
    private networkSimplexRanker;
    private removeEmptyRanks;
    private normalizeRanks;
    normalize(g: Graph): void;
    order(g: Graph): void;
}
