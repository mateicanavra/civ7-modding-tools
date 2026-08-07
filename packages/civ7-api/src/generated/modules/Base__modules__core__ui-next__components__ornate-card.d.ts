import { JSX } from "solid-js/jsx-runtime";
export interface OrnateCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    iconSrc?: string;
    iconElement?: JSX.Element;
    /** Allows authors to specify elements that will be drawn after the rest of the ornate card elements */
    childrenInFront?: JSX.Element;
}
export interface MinimalCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    iconElement?: JSX.Element;
    isBright?: boolean;
}
export declare const OrnateCard: any;
export declare const MinimalOrnateCard: any;
