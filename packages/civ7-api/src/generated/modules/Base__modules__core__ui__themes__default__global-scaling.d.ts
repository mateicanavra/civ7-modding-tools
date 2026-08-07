declare enum FontScale {
    XSmall = 0,
    Small = 1,
    Medium = 2,
    Large = 3,
    XLarge = 4
}
interface FontSize {
    name: string;
    px: number;
}
interface MediaFontSize {
    prefix: string;
    mediaQuery: string;
    fontSizes: FontSize[];
}
declare const BASE_FONT_SIZE = 18;
declare const DEFAULT_W = 1920;
declare const DEFAULT_H = 1080;
declare const DEFAULT_ASPECT_W = 16;
declare const DEFAULT_ASPECT_H = 9;
declare function getScalingResolutions(): number[][];
declare const BASE_CURSOR_SIZE = 32;
declare const MEDIA_RES_H = 1000;
declare const MEDIA_RES_W: number;
declare const getOrderedFontFamily: (fonts: readonly string[]) => readonly string[];
declare const TITLE_FONTS: string[];
declare const BODY_FONTS: string[];
declare class GlobalScalingImpl {
    globalScale: number;
    private globalScaleStyleNode;
    private fontSizesStyleNode;
    private mediaFontSizesStyleNode;
    private globalCssRulesList;
    private fontSizesCssRulesList;
    private mediaFontSizesCssRulesList;
    private fontScale;
    private autoScale;
    private autoScaleAdjustment;
    private currentScalePx;
    private currentBasis;
    private readyResolve;
    private readyPromise;
    private fontScales;
    private fontSizes;
    private mediaQueryFontSizes;
    constructor();
    get whenReady(): any;
    getNearestPixelsFontSize(pixelsAtSmallScale: number): any;
    createPixelsTextClass(sizeInPxAtSmallScale: number): string;
    getNearestMediaPixelsFontSize(pixelsAtSmallScale: number, mediaQuery?: string): any;
    createMediaTextClass(sizeInPxAtSmallScale: number, prefix: "sm:", mediaQuery?: string): string;
    private createStylesheets;
    private onResolutionChange;
    private onFontScaleChange;
    private onGlobalScaleChange;
    private getAutoScaleAdjustmentFactor;
    pixelsToRem(value: number): number;
    remToScreenPixels(value: number): number;
    getFontSizePx(fontSizeName: "2xs" | "xs" | "sm" | "base" | "lg" | "xl" | "2xl"): any;
    private generateFontSizeRule;
    private getFontSizeInScreenPixels;
    private generateFontSizeRules;
    private updateScales;
    getCurrentScale(): number;
    getCurrentScalePx(): number;
    private clearCssRuleList;
    private addCssRules;
    private replaceCssRules;
    private calculateBasis;
    private updateGlobalScale;
    private updateFontSizes;
    private updateMediaQueryFontSizes;
}
declare const GlobalScaling: GlobalScalingImpl;
