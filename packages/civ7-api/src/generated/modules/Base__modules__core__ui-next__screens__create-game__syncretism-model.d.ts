export interface SyncretismData {
    description: string;
    age: string;
    civilization: string;
}
export interface SyncretismQueryRow {
    Key?: string;
    KeyName?: string;
    KeyAgeType?: string;
    KeyAgeName?: string;
    CivilizationType?: string;
    CivilizationName?: string;
    AgeType?: string;
    AgeName?: string;
}
export declare const LeaderSyncretismQuery: string;
export declare const CivSyncretismQuery: string;
export interface SyncretismUnlockOption {
    Type: string;
    Kind: string;
    Name: string;
    Description: string;
}
interface CivilizationSyncretismUnlocks {
    CivilizationName: string;
    CivilizationType: string;
    AgeType: string;
    AgeName: string;
    Infrastructure: SyncretismUnlockOption[];
    Unit: SyncretismUnlockOption[];
}
interface CivilizationSyncretismInfo {
    Info: Map<string, CivilizationSyncretismUnlocks>;
}
export declare const SyncretismDataModel: CivilizationSyncretismInfo;
export {};
