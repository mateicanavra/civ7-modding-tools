import { Accessor, type JSX } from "solid-js";
import { ActivatableProps } from "/core/ui-next/components/activatable.js";
export interface SelectorSmallProps<T> extends ActivatableProps {
    items: {
        name: string;
        description: string;
        value: T;
    }[];
    selectedValue: Accessor<T>;
    setSelectedValue: (value: T) => void;
    style?: JSX.CSSProperties;
    disabled?: boolean;
    fixedWidth?: string;
    previousActionKey?: string;
    nextActionKey?: string;
    arrowClass?: string;
}
export declare const SelectorSmall: any;
