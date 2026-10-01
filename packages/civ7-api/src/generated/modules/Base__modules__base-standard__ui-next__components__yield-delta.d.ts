import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
export interface YieldDeltaProps extends JSX.HTMLAttributes<HTMLDivElement> {
    yieldIconSrc: string;
    yieldTotal: number;
    yieldDelta: number;
}
export declare const YieldDeltaComponent: Component<YieldDeltaProps>;
export declare const YieldDelta: any;
