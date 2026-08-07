/**
 * @file model-unit-promotions.ts
 * @copyright 2023, Firaxis Games
 */
import { Graph } from "/core/ui/graph-layout/graph.js";
import UpdateGate from "/core/ui/utilities/utilities-update-gate.js";
export interface PromotionCard {
    discipline: UnitPromotionDisciplineDefinition;
    iconClass: string;
    promotion: UnitPromotionDefinition;
    row: number;
    column: number;
    hasData: boolean;
}
export interface TreeLayoutData {
    rows: number;
    columns: number;
    layoutHeight: number;
    layoutWidth: number;
}
export interface PromotionTree {
    discipline: UnitPromotionDisciplineDefinition;
    promotions: UnitPromotionDefinition[];
    cards: PromotionCard[];
    layoutGraph: Graph;
    layoutData: TreeLayoutData;
}
declare class UnitPromotionModel {
    private _isClosing;
    get isClosing(): boolean;
    set isClosing(value: boolean);
    private selectedUnit;
    private _name;
    private _totalPromotions;
    private _experienceMax;
    private _experienceCurrent;
    private _experienceCaption;
    private _promotionPoints;
    private _commendationPoints;
    private _level;
    private _promotionsLabel;
    private _commendationsLabel;
    private _commendations;
    private iconClassMap;
    private _OnUpdate?;
    updateGate: UpdateGate;
    private promotionsByDiscipline;
    private _promotionTrees;
    private readonly ORIGIN_ROW;
    private readonly ORIGIN_COLUMN;
    private readonly HORIZONTAL_OFFSET;
    private readonly VERTICAL_OFFSET;
    constructor();
    set updateCallback(callback: (model: UnitPromotionModel) => void);
    get name(): string;
    get totalPromotions(): number;
    get experienceCaption(): string;
    get experienceMax(): number;
    get experienceCurrent(): number;
    get promotionPoints(): number;
    get commendationPoints(): number;
    get level(): number;
    get promotionsLabel(): string;
    get commendationsLabel(): string;
    get commendations(): UnitPromotionDefinition[];
    get promotionTrees(): PromotionTree[];
    get canPurchase(): boolean;
    private onUnitSelectionChanged;
    private update;
    updateModel(): void;
    private realizePromotionTreeElements;
    private getIconClassByDisciplineName;
    private buildPromotionsLayoutGraph;
    private buildPromotionCards;
    private getHorizontalOffsets;
    getCard(type: string | undefined): PromotionCard | undefined;
    getLastPopulatedRowFromTree(tree: HTMLElement): NodeListOf<HTMLElement> | undefined;
}
declare const UnitPromotion: UnitPromotionModel;
export { UnitPromotion as default };
