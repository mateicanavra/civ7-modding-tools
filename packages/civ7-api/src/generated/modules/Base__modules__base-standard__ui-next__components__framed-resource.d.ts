import { JSX, ParentComponent } from "solid-js";
export interface ResourceProps extends JSX.HTMLAttributes<HTMLDivElement> {
    resourceName: string;
    resourceIcon: string;
    resourceType: string;
    resourceTypeIcon: string;
    tooltipText: string;
    resourceOrigin?: string;
    importFlag?: ImportFlagProps;
    isSwapTarget?: boolean;
    isDamaged?: boolean;
}
export interface ImportFlagProps {
    primaryColor: string;
    secondaryColor: string;
}
export interface FramedResourceProps extends ResourceProps {
    showHighlight?: boolean;
    /** Must match one of the values defined in `$spacing-discrete` */
    size?: number;
}
export declare const FramedResource: ParentComponent<FramedResourceProps>;
