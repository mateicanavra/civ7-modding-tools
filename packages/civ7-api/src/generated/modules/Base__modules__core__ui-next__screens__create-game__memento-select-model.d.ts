import { Accessor, Setter } from "solid-js";
export interface MementoInfo {
    value: string | null;
    name: string | null;
    description: string | null;
    functionalDescription?: string | null;
    icon: string | null;
    isFavorite: boolean;
    isNew: boolean;
    isLocked: boolean;
    unlockTitle: string | null;
    unlockReason: string | null;
}
export declare enum MementoSlotType {
    Major = 0,
    Minor = 1
}
export interface MementoSlotInfo {
    gameParameter: string;
    slotType: MementoSlotType;
    isLocked: boolean;
    unlockReason: string;
    currentMemento: MementoInfo;
    availableMementos: MementoInfo[];
    hotkey: string;
}
export interface MementoSelectModel {
    slots: MementoSlotInfo[];
    mementos: MementosUIData[];
    selectedSlot: Accessor<number>;
    setSelectedSlot: Setter<number>;
    equipMemento: (memento: MementosUIData) => void;
    clearAllNew: () => void;
    fulltextSearch: (text: string) => Set<string>;
}
export declare const MementoSelectModel: any;
export declare const MementoSelectModelContext: any;
export declare function useMementoSelectModelContext(): any;
