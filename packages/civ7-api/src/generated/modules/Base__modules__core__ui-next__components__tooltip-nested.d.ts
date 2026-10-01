import { Accessor } from "solid-js";
export interface NestedTooltipContextData {
    /**
     * When true (or returns true) tooltips defined inside this context will be
     * suppressed. Supports an Accessor so the disabled state can be reactive.
     */
    disabled?: boolean | Accessor<boolean>;
}
export declare const NestedTooltipContext: any;
/**
 * Read the disabled flag from a {@link NestedTooltipContextData}, supporting
 * both static booleans and reactive accessors. Call from a reactive scope to
 * track changes when an accessor is used.
 */
export declare const isNestedTooltipContextDisabled: (ctx: NestedTooltipContextData | undefined) => boolean;
