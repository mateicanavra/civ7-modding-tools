export declare const CanUpgradeToCity: (townID: ComponentID) => any;
export type ConstructibleOperationResult = OperationResult;
export declare const CanCityConstruct: (cityID: ComponentID, constructible: ConstructibleDefinition, isPurchase: boolean) => ConstructibleOperationResult;
export declare const CanConvertToCity: (townID: ComponentID) => any;
export declare const ConvertToCity: (townID: ComponentID) => boolean;
