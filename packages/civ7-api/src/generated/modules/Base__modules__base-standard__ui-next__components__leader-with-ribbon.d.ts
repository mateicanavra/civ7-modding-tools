export interface LeaderTileData {
    iconSizeClass?: string;
    /** Optional additional class for the ribbon, useful for sizing */
    ribbonClass?: string;
    leaderId: number;
    size: number;
    cityId?: ComponentID;
    representsCityState?: boolean;
    omitFullRibbon?: boolean;
    omitRelationshipIcon?: boolean;
}
export declare const LeaderWithRibbon: any;
