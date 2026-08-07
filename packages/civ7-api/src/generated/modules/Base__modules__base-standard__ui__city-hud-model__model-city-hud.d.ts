/**
 * @file model-city-hud.ts
 * @copyright 2020-2021, Firaxis Games
 * @description The HUD when viewing a city.
 */
import "/base-standard/ui/city-trade/model-city-trade.js";
declare class CityHUDModel {
    private static _Instance;
    private _OnUpdate?;
    private citySelectionChangedListener;
    private SelectedCityID;
    private constructor();
    /**
     * Singleton accessor
     */
    static getInstance(): CityHUDModel;
    set updateCallback(callback: (model: CityHUDModel) => void);
    update(): void;
    private onCitySelectionChanged;
}
declare const CityHUD: CityHUDModel;
export { CityHUD as default };
