import { Component } from "solid-js";
import { TabItemProps } from "/core/ui-next/components/tab.js";
export interface LoadScreenInfoSectionProps {
    name: string;
    attributes: string[];
    description: string;
    abilityType: string;
    abilityName: string;
    abilityDescription: string;
}
export interface LoadScreenTipsAndHintsProps {
    text: string;
    class?: string;
}
export interface LoadScreenUnitProps {
    name: string;
    description: string;
    icon: string;
    isAvailable: boolean;
    ageName?: string;
}
export interface LoadScreenConstructibleProps {
    kind: string;
    name: string;
    description: string;
    icon: string;
    isUniqueQuarter: boolean;
    isAvailable: boolean;
    ageName?: string;
}
export interface LoadScreenTraditionProps {
    civic: string;
    name: string;
    description: string;
}
export interface LoadScreenMementoProps {
    name?: string;
    description?: string;
    flavorText?: string;
    icon?: string;
    isEmpty: boolean;
    isLocked: boolean;
    unlockReason?: string;
}
export interface LoadScreenData {
    tipText: string;
    backgroundImage: string;
    leaderImage: string;
    leaderInfo: LoadScreenInfoSectionProps;
    civInfo: LoadScreenInfoSectionProps;
    unitInfo: LoadScreenUnitProps[];
    constructibleInfo: LoadScreenConstructibleProps[];
    traditionInfo: LoadScreenTraditionProps[];
    mementoInfo: LoadScreenMementoProps[];
}
export interface LoadScreenContextModel {
    data: LoadScreenData | undefined;
    progress: number;
    canBeginGame: boolean;
    startOnCivTab: boolean;
    hideBeginButton: boolean;
    currentTab?: string;
    onBeginGame: () => void;
    onTabChanged: (tab: TabItemProps | undefined) => void;
}
export declare const LoadScreenContext: any;
export declare function useLoadScreenContext(): any;
export interface LoadScreenProps {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}
export declare const LoadScreen: Component<LoadScreenProps>;
