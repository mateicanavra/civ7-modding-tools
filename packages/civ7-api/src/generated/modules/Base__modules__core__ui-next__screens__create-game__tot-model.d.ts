import { Accessor } from "solid-js";
export interface TotModel {
    isTotEnabled: Accessor<boolean>;
    isHeightOfPower: Accessor<boolean>;
}
export declare function createTotModel(): TotModel;
export declare const TotModel: any;
export declare const TotModelContext: any;
export declare function useTotModelContext(): any;
