/**
 * @file layout-normalize.ts
 * @copyright 2022, Firaxis Games
 * @description Creates dummy chains from not normalized edges (edges that span more than one layer/level of tree depth)
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
export declare namespace normalize {
    function run(g: Graph): void;
}
