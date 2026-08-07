/**
 * @file model-city-capture.ts
 * @copyright 2024, Firaxis Games
 * @description Data model for city capture panel
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
declare class CityCaptureChooserModel {
    private _cityID;
    private _OnUpdate?;
    private _isJustConqueredFrom;
    private _isBeingRazed;
    private _numWonders;
    constructor();
    set updateCallback(callback: (model: CityCaptureChooserModel) => void);
    updateGate: any;
    set cityID(id: ComponentID | null);
    get cityID(): ComponentID | null;
    get canDisplayPanel(): boolean;
    get isBeingRazed(): boolean;
    get isNotBeingRazed(): boolean;
    get containsWonder(): boolean;
    get numWonders(): number;
    sendLiberateFounderRequest(): void;
    sendKeepRequest(): void;
    sendRazeRequest(): void;
    private sendChoiceRequest;
    getKeepCanStartResult(): OperationResult | undefined;
    getRazeCanStartResult(): OperationResult | undefined;
}
declare const CityCaptureChooser: CityCaptureChooserModel;
export { CityCaptureChooser as default };
