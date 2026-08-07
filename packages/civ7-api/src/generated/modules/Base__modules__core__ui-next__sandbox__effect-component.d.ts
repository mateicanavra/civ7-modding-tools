import type { Component, Setter } from "solid-js";
export interface EffectExampleProps {
    action: (valueSetter: Setter<string>) => void;
    name: string;
}
export declare const EffectComponent: Component<EffectExampleProps>;
