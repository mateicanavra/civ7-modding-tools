/**
 * model-advanced-start.ts
 * @copyright 2022-2025, Firaxis Games
 * @description Advanced Start data model
 */
interface CardCost {
    value: string;
    icon: string;
    colorClass: string;
}
interface CardEntry {
    name: string;
    typeID: string;
    typeIcon: string;
    description: string;
    tooltip: string;
    costs: CardCost[];
    effectTypes: AdvancedStartCardEffect[];
    canBeAdded: boolean;
    cannotBeAdded: boolean;
    hasBeenAdded: boolean;
    numInstances: number;
    oddCard: boolean;
    colorClass: string;
    individualLimit: number;
    groupLimit: number;
    instancesLeft?: number;
    insufficientFunds?: boolean;
    multipleInstancesString?: string;
}
interface CardEffectEntry {
    name: string;
    effectID: string;
    description: string;
    costs: CardCost[];
    typeIcon: string;
    numInstances: number;
    display: boolean;
    colorClass?: string;
    multipleInstancesString?: string;
}
interface PreselectEntry {
    deckID: string;
    typeIDs: string[];
}
export interface AdvancedStartToolTipEntry {
    locKey: string;
}
export declare class AdvancedStartModel {
    private onUpdate?;
    private _availableCards;
    private _selectedCards;
    private _placeableCardEffects;
    private _filterForCards;
    private _preselectIndex;
    private _preSelectList;
    private _cardsToAddOnRemoval;
    private updateGate;
    private cardAddedListener;
    private cardRemovedListener;
    private effectUsedListener;
    private localPlayerChangedListener;
    private selectedPlacementEffectID;
    canAddCards: boolean;
    deckConfirmed: boolean;
    advancedStartClosed: boolean;
    constructor();
    set updateCallback(callback: (model: AdvancedStartModel) => void);
    get playerId(): PlayerId;
    get availableCards(): CardEntry[];
    get filterForCards(): CardCategories;
    get filteredCards(): CardEntry[];
    get selectedCards(): CardEntry[];
    get placeableCardEffects(): CardEffectEntry[];
    get preSelectList(): PreselectEntry[];
    get preSelectLoc(): string;
    get preSelectIndex(): number;
    private update;
    private tryAddCards;
    private makeCardEntryFromAgeCardInfo;
    private parseCardText;
    private parseCardTextArray;
    private makeCosts;
    getCardCategoryCostShortname(amount: number, category: CardCategories): string;
    getCardCategoryIconURL(category: CardCategories): string;
    getCardCategoryColor(category: CardCategories): string;
    getCardCategoryByColor(colorCategory: string): CardCategories;
    getDeckIdLoc(deckId: string): string;
    addAvailableCard(typeID: string): boolean;
    filterCards(): CardEntry[];
    setFilter(category: CardCategories): void;
    removeAvailableCard(typeID: string): void;
    changePresetLegacies(indexShift: number): void;
    autoFillLegacies(): void;
    confirmDeck(): void;
    unconfirmDeck(): void;
    refreshCardList(): void;
    selectPlacementEffect(typeID: string): void;
    clearSelectedPlacementEffect(): void;
    placePlacementEffect(plot: PlotCoord): boolean;
    private applyInstanceEffects;
    forceComplete(): void;
    private isACurrency;
    private convertCurrencyText;
    private canNotAffordLegacy;
    tooltipText(hoverNodeId: string): AdvancedStartToolTipEntry | null;
}
declare const AdvancedStart: AdvancedStartModel;
export { AdvancedStart as default };
