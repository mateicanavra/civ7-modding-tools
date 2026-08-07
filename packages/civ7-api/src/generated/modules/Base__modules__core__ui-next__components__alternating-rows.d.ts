import { Accessor, JSX } from "solid-js";
export interface AlternatingRows<T, U extends JSX.Element> {
    each: T[];
    children: (item: T, index: Accessor<number>) => U;
    rowClass?: string;
    /** Default: bg-primary-4 */
    evenClass?: string;
    /** Default: bg-primary-5 */
    oddClass?: string;
}
export declare const AlternatingRows: any;
