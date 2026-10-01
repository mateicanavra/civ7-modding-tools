export interface AgeInfo {
    type: string;
    domain: string;
    name: string;
    description: string;
    icon: string;
    bgImage: string;
}
export interface MutableAgeModel {
    sortedAges: AgeInfo[];
    selectedAge: AgeInfo;
    nextAge: AgeInfo;
    getAgeName: (ageType: string) => string | undefined;
    setSelectedAge: (age: AgeInfo) => void;
    getAgeIcon: (ageType: string) => string | undefined;
}
export interface AgeModel extends MutableAgeModel {
    readonly sortedAges: AgeInfo[];
    readonly selectedAge: AgeInfo;
    readonly getAgeName: (ageType: string) => string | undefined;
    readonly setSelectedAge: (age: AgeInfo) => void;
    readonly getAgeIcon: (ageType: string) => string | undefined;
}
export declare function createAgeSelectModel(): AgeModel;
export declare const AgeSelectModel: any;
export declare const AgeSelectModelContext: any;
export declare function useAgeSelectModelContext(): any;
