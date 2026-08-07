import { JSX } from "solid-js";
export interface MapTypeButtonProps extends JSX.HTMLAttributes<HTMLDivElement> {
    name?: string;
    icon: string;
    onActivate?: () => void;
    description?: string;
    bgImage?: string;
    bgImagePositionX?: number;
    bgImagePositionY?: number;
}
export declare function MapTypeButton(props: MapTypeButtonProps): any;
export declare const MapSelect: any;
