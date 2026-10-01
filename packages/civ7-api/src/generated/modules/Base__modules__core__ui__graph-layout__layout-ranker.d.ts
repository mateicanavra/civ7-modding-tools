/**
 * @file layout-ranker.ts
 * @copyright 2022, Firaxis Games
 * @description Layer assignment from Directed Acyclic Graphs
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
export type VisitedElement = Record<string, boolean>;
export interface RankEntry {
    rank: number;
}
export type RankObject = Record<string, RankEntry>;
export declare namespace ranker {
    function networkSimplex(g: Graph): Graph;
}
