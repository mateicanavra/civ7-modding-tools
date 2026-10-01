import { Accessor, JSX } from "solid-js";
import { ActivatableProps } from "/core/ui-next/components/activatable.js";
export interface BoxSelectorProps<T> extends ActivatableProps {
    icon?: string;
    items: {
        name: string;
        description: string;
        value: T;
    }[];
    title?: string;
    selectedValue: Accessor<T>;
    setSelectedValue: (value: T) => void;
    bgImage?: string;
    bgImagePositionX?: number;
    bgImagePositionY?: number;
}
export interface BoxSelectorButtonProps extends JSX.HTMLAttributes<HTMLDivElement> {
    name?: string;
    icon: string;
    onActivate?: () => void;
    description?: string;
    bgImage?: string;
    bgImagePositionX?: number;
    bgImagePositionY?: number;
}
export declare function BoxSelectorButton(props: BoxSelectorButtonProps): any;
export declare const CreateGameSetup: any;
