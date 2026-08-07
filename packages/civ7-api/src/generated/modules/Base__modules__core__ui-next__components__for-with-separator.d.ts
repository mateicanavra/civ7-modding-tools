import { Accessor, JSX } from "solid-js";
export interface ForWithSeparatorProps<T extends readonly unknown[], U extends JSX.Element> {
    each: T | undefined | null | false;
    fallback?: JSX.Element;
    separator: JSX.Element;
    children: (item: T[number], index: Accessor<number>) => U;
}
export declare const ForWithSeparator: any;
