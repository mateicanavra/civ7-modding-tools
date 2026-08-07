/**
 * @file graph-algorithms.ts
 * @copyright 2022, Firaxis Games
 * @description Depth first search algorithms for graphs.
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
export declare namespace graphAlgo {
    function postorder(g: Graph, vs: string[]): string[];
    function preorder(g: Graph, vs: string[]): string[];
}
