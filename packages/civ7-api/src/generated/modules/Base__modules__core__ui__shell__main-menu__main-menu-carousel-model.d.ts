/**
 * @file Main menu promo carousel model
 * @copyright 2026 Firaxis Games
 * @description Model for the main menu promo carousel
 */
export interface CarouselItem {
    title: string;
    carouselTitle: string;
    content: string;
    carouselImageUrl: string | null;
    modalImageUrl: string;
    promoId: string;
    isInteractable: boolean;
    autoRedeemOnShow: boolean;
    layout: DNAPromoLayout;
}
export interface PromoCarouselContextModel {
    bootLoaded: boolean;
    supportsSSO: boolean;
    isConnectedToNetwork: boolean;
    hasPromoInteractivity: boolean;
    isExpanded: boolean;
    carouselItems: CarouselItem[];
    selectedCarouselIndex: number;
    selectedCarouselItem: CarouselItem | undefined;
    carouselImage: string;
    onNextItem: () => boolean;
    onPreviousItem: () => boolean;
    onSetItem: (index: number) => void;
    onCarouselInteract: () => void;
    onCarouselUpdate: () => void;
    onTelemetryPromoAction: (promoAction: PromoAction, promoId: string, promoLocation: string, interactionDestination: string) => void;
    onShowExpandedCarousel: () => void;
}
export declare function createPromoCarouselModel(): any;
export declare const PromoCarouselModel: any;
export declare const PromoCarouselModelContext: any;
export declare function usePromoCarouselContext(): any;
