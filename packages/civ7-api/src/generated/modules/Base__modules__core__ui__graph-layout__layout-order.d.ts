/**
 * @file layout-order.ts
 * @copyright 2022, Firaxis Games
 * @description Ordering algorithms to reduce cross counting in graph layers.
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
export interface EntryResolved {
    vs: string[];
    i: number;
    barycenter?: number;
    weight?: number;
}
export interface EntryResolvedSortable {
    vs: string[];
    i: number;
    barycenter: number;
    weight: number;
}
export declare namespace order {
    function run(g: Graph): void;
}
