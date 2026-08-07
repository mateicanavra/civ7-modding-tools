import { Component, ParentComponent } from "solid-js";
export declare function useScene3dContext(): any;
export interface Scene3dProps {
    name: string;
    ref?: (scene: WorldUI.Scene) => void;
}
export declare const Scene3dComponent: ParentComponent<Scene3dProps>;
export declare const Scene3d: any;
export interface Camera3dProps {
    cameraPos: float3;
    subjectPos: float3;
    fov?: number;
    up?: float3;
    clip?: float2;
    children?: () => Component<Camera3dProps>;
}
export declare const Camera3dComponent: Component<Camera3dProps>;
export declare const Camera3d: any;
export declare function useModelGroup3dContext(): any;
export interface ModelGroup3dProps {
    name: string;
    ref?: (scene: WorldUI.ModelGroup) => void;
}
export declare const ModelGroup3d: any;
export interface Model3dProps {
    model: string;
    location?: WorldUI.Location;
    state?: string;
    hidden?: boolean;
    scale?: number;
    angle?: WorldUI.Angle;
    tintColor1?: WorldUI.Color;
    tintColor2?: WorldUI.Color;
    alpha?: number;
    seed?: number;
    placement?: PlacementMode;
    foreground?: boolean;
    needsShadows?: boolean;
    selectionScriptParams?: WorldUI.SelectionScriptParams;
    clearTemporalHistoryOnChange?: boolean;
    onTrigger?: (hash: number) => void;
    ref?: (model: WorldUI.ModelInstance | undefined) => void;
}
export declare const Model3d: any;
export declare const Background3d: any;
export interface BackgroundLayer3dProps {
    name: string;
    texture: string;
    mask?: string;
    stretch?: StretchMode;
    alignX?: AlignMode;
    alignY?: AlignMode;
    alpha?: number;
    size?: float2;
    sizeRel?: float2;
    offset?: float2;
    offsetRel?: float2;
    borderImageSlice?: string;
    borderImageWidth?: string;
    flipX?: boolean;
    flipY?: boolean;
}
export declare const BackgroundLayer3d: any;
