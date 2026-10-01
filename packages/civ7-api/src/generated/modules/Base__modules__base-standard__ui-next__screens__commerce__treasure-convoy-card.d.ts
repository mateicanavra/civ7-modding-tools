import { TreasureFleetData } from "/base-standard/ui-next/screens/commerce/commerce-screen-model.js";
export interface TreasureConvoyCardProps {
    fleet: TreasureFleetData;
    inGeneratingConvoysSection: boolean;
    onFocus: () => void;
    autoFocus: boolean;
}
export declare const TreasureConvoyCard: any;
