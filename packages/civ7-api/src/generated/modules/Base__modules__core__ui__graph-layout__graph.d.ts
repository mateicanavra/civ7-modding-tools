/**
 * @file graph.ts
 * @copyright 2022, Firaxis Games
 * @description Graph data structure.
 */
interface GraphOptions {
    directed?: boolean | undefined;
    multigraph?: boolean | undefined;
    compound?: boolean | undefined;
}
export interface GraphLabel {
    width?: number | undefined;
    height?: number | undefined;
    compound?: boolean | undefined;
    rankdir?: string | undefined;
    align?: string | undefined;
    nodesep?: number | undefined;
    edgesep?: number | undefined;
    ranksep?: number | undefined;
    marginx?: number | undefined;
    marginy?: number | undefined;
    acyclicer?: string | undefined;
    ranker?: string | undefined;
    nodeRankFactor?: number | undefined;
    maxRank?: number | undefined;
    dummyChains?: string[] | undefined;
    root?: string | undefined;
}
export interface NodeConfig {
    width?: number | undefined;
    height?: number | undefined;
}
export interface Edge {
    v: string;
    w: string;
    name?: string | undefined;
}
export interface Label {
    rank: number;
    [key: string]: any;
}
export declare function isEmpty(value: any): boolean;
export declare function constant(value: any): () => any;
export declare class Graph<T = {}> {
    private _isDirected;
    private _isMultigraph;
    private _isCompound;
    private _defaultNodeLabelFn;
    private _defaultEdgeLabelFn;
    private _label;
    private _nodes;
    private _parent;
    private _children;
    private _in;
    private _predecessors;
    private _successors;
    private _out;
    private _edgeObjs;
    private _edgeLabels;
    private _nodeCount;
    private _edgeCount;
    constructor(opts?: GraphOptions);
    /**
     * A directed graph is one that has no cycles,
     * as those used in Civ7 in Tech, Civics, and promotions
     * @returns Option for directed graph
     */
    isDirected(): boolean;
    /**
     * A multi graph is one that has multiple edges for the same ending node
     * @returns Option for multi graph
     */
    isMultigraph(): boolean;
    /**
     * Sets the graph label
     * @returns The graph
     */
    setGraph(label: GraphLabel): Graph<T>;
    graph(): GraphLabel;
    /**
     * Sets a label as default for the v node
     * @param labelFn Function that returns a node name
     * @returns The graph
     */
    setDefaultNodeLabel(labelFn: (v: string) => Label): Graph;
    /**
     * @returns Number of nodes in the graph
     */
    nodeCount(): number;
    /**
     * @returns The node names
     */
    nodes(): string[];
    /**
     * A source node is the node where the edge starts
     * @returns List of source nodes
     */
    sources(): string[];
    /**
     * A sink node is the node where the edge ends
     * @returns List of sink nodes
     */
    sinks(): string[];
    /**
     * Sets a single node
     * @param v Node identifier
     * @param value A label, for computation purposes it may be an object
     * @returns List of sink nodes
     */
    setNode(v: string, value?: Label | any): this;
    /**
     * @returns Node label, used to access the rank property
     */
    node(v: string): Label;
    /**
     * Checks if a node is in the graph
     * @param v Node identifier.
     */
    hasNode(v: string): boolean;
    /**
     * Removes a node with the provided identifier
     * @param v Node identifier.
     * @returns The graph.
     */
    removeNode(v: string): Graph;
    /**
     * Sets a parent to the provided node.
     * @param v Node identifier.
     * @param parent Parent node identifier.
     * @returns The graph.
     */
    setParent(v: string, parent?: string): Graph;
    /**
     * Removes a node from the parent.
     * @param v Node identifier.
     */
    private removeFromParentsChildList;
    /**
     * @param v Node identifier.
     * @returns The parent of the node.
     */
    parent(v: string): string | undefined;
    /**
     * @param v Node identifier.
     * @returns The children of the node or root.
     */
    children(v?: string): string[];
    /**
     * @param v Node identifier.
     * @returns List of node's predecessors ids.
     */
    predecessors(v: string): string[] | [
    ];
    /**
     * @param v Node identifier.
     * @returns List of node's successors ids.
     */
    successors(v: string): undefined | string[];
    /**
     * @param v Node identifier.
     * @returns List of node's neighbors ids.
     */
    neighbors(v: string): string[] | undefined;
    /**
     * Sets a default label for the graph edges
     * @param label Default function to set on edge creation
     * @returns List of node's neighbors ids.
     */
    setDefaultEdgeLabel(labelFn: (v: string) => object): Graph;
    /**
     * @returns Number of edges
     */
    edgeCount(): number;
    /**
     * @returns List of edges
     */
    edges(): Edge[];
    /**
     Sets and edge between two nodes, as in the next examples:
     ** setEdge(v, w, [value, [name]])
     ** setEdge({ v, w, [name] }, [value])
     @returns The graph.
    */
    setEdge(v: string, w: string, label?: any, name?: string): Graph;
    setEdge(edge: Edge, label?: any): Graph;
    /**
     @returns The edge label from edge object or node names
    */
    edge(edgeObj: Edge): Label;
    edge(outNodeName: string, inNodeName: string, name?: string): Label;
    /**
     * Checks if the edge exists from the object or the node names
     */
    hasEdge(edgeObj: Edge): boolean;
    hasEdge(outNodeName: string, inNodeName: string, name?: string): boolean;
    /**
     * Removes an edge from the object or the node names
     * @returns The graph.
     */
    removeEdge(edge: Edge): Graph;
    removeEdge(v: string, w: string, name?: string): Graph;
    /**
     * @param v The node identifier
     * @returns A list of edges that are getting in the provided node
     */
    inEdges(v: string, u?: string): Edge[] | undefined;
    /**
     * @param v The node identifier
     * @returns A list of edges that are getting out the provided node
     */
    outEdges(v: string, w?: string): Edge[] | undefined;
    /**
     * @param v The node identifier
     * @returns All edges getting in or out the provided node
     */
    nodeEdges(v: string, w?: string): Edge[] | undefined;
    /**
     * Initializes an entry accumulator with 1 or increases it
     * @param v The node identifier
     * @returns All edges getting in or out the provided node
     */
    private incrementOrInitEntry;
    /**
     * Deletes an entry accumulator when it it reaches zero or decreases it.
     * @param v The node identifier
     * @returns All edges getting in or out the provided node
     */
    private decrementOrRemoveEntry;
    /**
     * Creates an id for and edge using the params
     * @param isDirected Is used to know the direction of the edge
     * @param v_ Origin node
     * @param w_ End node
     * @param name Edge name
     * @returns Unique id
     */
    private edgeArgsToId;
    /**
     * Creates an edge object using the params
     * @param isDirected Used to know the direction of the edge
     * @param v_ Origin node
     * @param w_ End node
     * @param name Edge name
     * @returns Unique id
     */
    private edgeArgsToObj;
    /**
     * Creates and id for and edge using the object
     * @param isDirected Used to know the direction of the edge
     * @param edgeObj Edge object used to grab params
     * @returns Unique id
     */
    private edgeObjToId;
}
export {};
