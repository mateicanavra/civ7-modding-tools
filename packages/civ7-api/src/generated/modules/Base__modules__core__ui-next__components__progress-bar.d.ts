import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
export interface ProgressBarProps extends JSX.HTMLAttributes<HTMLElement> {
    titleText?: string;
    progressString?: string;
    progressPercent: number;
}
export declare const ProgressBar: Component<ProgressBarProps>;
