import { JSX, Setter } from "solid-js";
export interface RingMeterProps extends JSX.HTMLAttributes<HTMLDivElement> {
    min?: number;
    max: number;
    value: number;
    animationDuration?: number;
    setValue?: Setter<number>;
    audio?: {
        /** Audio group override */
        group?: string;
        onFillSound?: string;
        onRingAnimateStop?: string;
    };
    contentClass?: string;
    isTopOrigin?: boolean;
    ringImage?: string;
    ringTint?: string;
    progressPips?: number[];
}
export declare const RingMeter: any;
