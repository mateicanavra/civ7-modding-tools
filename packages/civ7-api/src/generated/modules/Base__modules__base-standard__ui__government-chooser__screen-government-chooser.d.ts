/**
 * @file screen-government-chooser.tsx
 * @copyright 2026 Firaxis Games
 * @description Interface for choosing your government
 */
import { Component } from "solid-js";
import { GovtEffectItem, TraditionDisplayItem } from "/base-standard/ui/policies/model-government.js";
interface GovernmentChooserItemProps {
    itemName: string;
    passiveEffect?: string;
    celebrationOptions: GovtEffectItem[];
    traditionsUnlocked: TraditionDisplayItem[];
    onClick: void;
    isSelected: boolean;
}
export declare const GovernmentChooserItem: Component<GovernmentChooserItemProps>;
export declare const GovernmentChooser: any;
export {};
