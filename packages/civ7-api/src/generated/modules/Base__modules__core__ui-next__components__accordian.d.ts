import { JSX, ParentProps, Setter } from "solid-js";
export interface AccordianProps extends JSX.HTMLAttributes<HTMLDivElement> {
    header: JSX.Element;
    headerStyle?: JSX.CSSProperties;
    headerClass?: string;
    expandedStyle?: string;
    collapsedStyle?: string;
    initialCollapsed?: boolean;
    setIsCollapsed?: Setter<boolean>;
}
export declare function Accordian(props: ParentProps<AccordianProps>): any;
