import { Component, Signal } from "solid-js";
export interface BoundStringProps {
    name: string;
    signal: Signal<string | undefined>;
}
export declare const BoundString: Component<BoundStringProps>;
export interface BoundBooleanProps {
    name: string;
    signal: Signal<boolean | undefined>;
}
export declare const BoundBoolean: Component<BoundBooleanProps>;
export interface BoundNumberProps {
    name: string;
    signal: Signal<number | undefined>;
}
export declare const BoundNumber: Component<BoundNumberProps>;
