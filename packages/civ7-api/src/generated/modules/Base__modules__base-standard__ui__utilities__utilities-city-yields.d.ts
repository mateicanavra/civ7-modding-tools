/**
 * @file utilities-city-yields.ts
 * @copyright 2021-2022, Firaxis Games
 * @description Creates detailed breakdown for city/town yields
 */
export interface CityYieldData {
    label: string;
    desc?: string;
    value: string;
    valueNum: number;
    valueType: GameValueStepTypes;
    type?: string;
    showIcon: boolean;
    isNegative: boolean;
    isModifier: boolean;
    img?: string;
    childData: CityYieldData[];
}
declare class CityYieldsEngine {
    yields: CityYieldData[];
    getCityYieldDetails(targetCityID: ComponentID): CityYieldData[];
    /** Format the value into a display string
     * @param value The value to format
     * @param type	The type of the PARENT of the value.  We use the parent because that tells us how the value is being used in a calculation.
     * @param isModfier Denotes of the value is from a parent that is in the .modifer branch of a game value.  */
    getValueDisplayString(value: number, type: GameValueStepTypes, isModifier: boolean): string;
    private getModifierStepLabel;
    private getYieldData;
    private getStepData;
    /**
     * Remove redundant nodes.
     * A redundant node is one in which the parent has a single child and their values/valueTypes match.
     * We must then determine whether to keep the parent or the child.  This logic is evolving and is currently as such:
     * * If the root doesn't have an associated type and isn't marked as showing an icon, use the child if the child contains a label.
     * @param root
     * @returns
     */
    private removeRedundantNodes;
    /**
     * 'Blank' nodes are nodes without a label or icon to convey what exactly they mean.
     *  To provide concise information, nodes with blank children have _all_ their children removed.
     *  To prevent situations where this is too deep a cut, these nodes should be correctly labeled in GameCore.
     *
     * @param root
     */
    private removeBlankChildren;
    private prepareForDisplay;
}
export interface YieldLike {
    yieldType: YieldType | string;
}
/**
 * Sorts an array of yields in place. Yields are sorted by "main" yield first, then by occurence in GameInfo.Yields.
 * This exists as a utility to ensure yields are displayed in a consistent order.
 *
 * @param yields YieldLike objects
 * @returns
 *
 */
export declare const SortYields: (yields: YieldLike[]) => any;
declare const CityYields: CityYieldsEngine;
export { CityYields as default };
