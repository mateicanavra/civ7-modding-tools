import "/base-standard/ui-next/components/production-chooser-unique-quarter-item.js";
export declare class UniqueQuarter {
    readonly root: any;
    private readonly item;
    private readonly buildingContainer;
    private buildingElementOne;
    private buildingElementTwo;
    set definition(value: UniqueQuarterDefinition);
    set numCompleted(value: 0 | 1 | 2);
    constructor();
    setBuildings(chooserItemOne: HTMLElement, chooserItemTwo: HTMLElement): void;
    containsBuilding(item: HTMLElement): boolean;
}
