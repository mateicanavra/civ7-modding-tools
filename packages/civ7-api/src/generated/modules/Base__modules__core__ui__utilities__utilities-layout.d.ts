export declare namespace Layout {
    function pixels(pxValue: number): string;
    function isCompact(): boolean;
    const pixelsValue: (px: number) => any;
    const pixelsText: (px: number) => any;
    function textSizeToScreenPixels(fontSizeName: "2xs" | "xs" | "sm" | "base" | "lg" | "xl" | "2xl"): any;
    function pixelsToScreenPixels(pxValue: number): any;
    const currentScale: () => any;
    const currentScalePx: () => any;
}
