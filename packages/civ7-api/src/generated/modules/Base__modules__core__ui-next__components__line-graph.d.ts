/**
 * @file line-graph.tsx
 * @copyright 2026, Firaxis Games
 * @description SolidJS line graph component, wrapping Chart.js
 */
import { Component } from "solid-js";
export interface LineGraphPoint {
    x: number;
    y: number;
}
export interface LineGraphLine {
    color: string;
    order: number;
    refCon: number;
    points: LineGraphPoint[];
}
export interface LineGraphProps {
    class?: string;
    axisNumberColor: string;
    width: number;
    lines: LineGraphLine[];
    maxY: number | undefined;
    maxX: number | undefined;
    minX?: number | undefined;
    dashed?: boolean;
    pointRadius?: number;
    gridColorX?: string;
    gridColorY?: string;
    axisLabelX?: string;
    axisLabelY?: string;
    axisLabelColor: string;
}
export declare const LineGraph: Component<LineGraphProps>;
