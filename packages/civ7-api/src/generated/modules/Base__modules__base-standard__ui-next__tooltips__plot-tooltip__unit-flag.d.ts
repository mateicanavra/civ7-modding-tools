import { type Component } from "solid-js";
/** Props for rendering a unit icon with an overlapping civ flag ribbon. */
export interface UnitFlagProps {
    color: string;
    unitIcon?: string;
    civSymbol?: string;
    class?: string;
    iconClass?: string;
    bannerClass?: string;
}
/** Unit icon with white border and an overlapping civ flag ribbon underneath. */
export declare const UnitFlag: Component<UnitFlagProps>;
