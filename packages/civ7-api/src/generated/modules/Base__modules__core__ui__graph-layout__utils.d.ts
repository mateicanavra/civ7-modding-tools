/**
 * @file utils.ts
 * @copyright 2022, Firaxis Games
 * @description Graph utilities and simplified versions of "lodash" functions for specific purposes
 */
import { Graph, Label } from "/core/ui/graph-layout/graph.js";
import { type EntryResolved, type EntryResolvedSortable } from "/core/ui/graph-layout/layout-order.js";
interface GraphDefaults {
    ranksep: number;
    edgesep: number;
    nodesep: number;
    rankdir: string;
}
interface NodeDefaults {
    width: number;
    height: number;
}
interface EdgeDefaults {
    minlength: number;
    weight: number;
    width: number;
    height: number;
    labeloffset: number;
    labelpos: string;
}
export interface PartitionLR {
    lhs: EntryResolvedSortable[];
    rhs: EntryResolved[];
}
export declare namespace utils {
    const graphDefaults: GraphDefaults;
    const graphNumAttrs: string[];
    const graphAttrs: string[];
    const nodeNumAttrs: string[];
    const nodeDefaults: NodeDefaults;
    const edgeNumAttrs: string[];
    const edgeAttrs: string[];
    const edgeDefaults: EdgeDefaults;
    function asNonCompoundGraph(g: Graph): Graph;
    const isEmpty: any;
    const constant: any;
    function addDummyNode(g: Graph, type: string, attrs: Label, name: string): string;
    function uniqueId(prefix: string): string;
    function maxRank(g: Graph): number;
    function maxOrder(g: Graph): number;
    function buildLayerMatrix(g: Graph): string[][];
    function range(start: number | undefined, end: number, step?: number, fromRight?: boolean): number[];
    function flatten(array: any[]): any[];
    function partition(collection: any[], fn: Function): PartitionLR;
    function zipObject(props: any[], values: any[]): any;
    function cloneSimpleArray(arrayToClone: any[]): any[];
    function clamp(value: number, min: number, max: number): number;
}
export {};
