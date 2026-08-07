import { type Component, type JSX } from "solid-js";
type MaybeString = string | null | undefined;
type DividerStyle = "normal" | "text-divider";
export interface ConstructibleDetailsProps extends JSX.HTMLAttributes<HTMLDivElement> {
    definition: ConstructibleDefinition;
    isPurchase?: boolean;
    dividerStyle?: DividerStyle;
    warehouseBonus?: MaybeString;
    adjacencyBonus?: MaybeString;
    cost?: number;
}
export declare const ConstructibleDetails: Component<ConstructibleDetailsProps>;
export {};
