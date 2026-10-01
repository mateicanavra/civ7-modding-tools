import { PanelProps } from "/core/ui-next/components/panel.js";
type FiligreeType = "icon" | "wide";
export interface OrnateFrameProps extends PanelProps {
    topIconClass?: string;
    topIconSrc?: string;
    topIconTint?: string;
    backgroundImageSrc?: string;
    backgroundImageOpacity?: number;
    topIconBackgroundTint?: string;
    filigreeType?: FiligreeType;
    showFiligrees?: boolean;
    hideTopIcon?: boolean;
    useNoMarginFrame?: boolean;
    isFullscreen?: boolean;
}
export declare const OrnateFrame: any;
export {};
