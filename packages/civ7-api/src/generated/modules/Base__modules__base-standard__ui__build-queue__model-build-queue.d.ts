/**
 * @file model-build-queue.ts
 * @copyright 2020-2022, Firaxis Games
 * @description Model the build queue for the selected city
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
interface BuildQueueItem {
    type: string;
    name: string;
    turns?: string;
    showTurns?: boolean;
    showCost?: boolean;
    icon?: string;
    index: number;
    percentComplete: number;
    isUnit?: boolean;
}
declare class BuildQueueModel {
    private CityID;
    private Items;
    private _OnUpdate?;
    get isEmpty(): boolean;
    constructor();
    get isTrackingCity(): boolean;
    set updateCallback(callback: (model: BuildQueueModel) => void);
    set cityID(id: ComponentID | null);
    get cityID(): ComponentID | null;
    get items(): BuildQueueItem[];
    updateGate: any;
    cancelItem(rawIndex: string): void;
    moveItemUp(rawIndex: string): void;
    moveItemDown(rawIndex: string): void;
    moveItemLast(rawIndex: string): void;
}
export declare const BuildQueue: BuildQueueModel;
export {};
