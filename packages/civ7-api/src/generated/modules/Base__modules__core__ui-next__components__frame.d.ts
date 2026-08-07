import { JSX } from "solid-js";
export declare enum SafezoneMode {
    None = 0,
    Vertical = 1,
    Horizontal = 2,
    Full = 3
}
export interface FrameProps {
    safezoneMode?: SafezoneMode;
    class?: string;
    contentClass?: string;
    filigreeClass?: string;
    borderClass?: string;
    style?: JSX.CSSProperties;
}
export declare const Frame: {
    F1: any;
    F2: any;
    Simple: any;
    Modal: any;
};
