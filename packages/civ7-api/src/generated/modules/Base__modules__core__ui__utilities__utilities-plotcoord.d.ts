/**
 * @file utility-plotcoord.ts
 * @copyright 2021, Firaxis Games
 */
export declare namespace PlotCoord {
    function toString(loc: PlotCoord | null): string;
    function fromString(str: string): PlotCoord | null;
    function isInvalid(loc: PlotCoord | null): boolean;
    function isValid(loc: PlotCoord | null): boolean;
}
