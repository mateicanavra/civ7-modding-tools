/**
 * @file game-creation-options.ts
 * @copyright 2025, Firaxis Games
 * @description Contains helper classes for the SP and MP advanced options screens
 */
import { DropdownSelectionChangeEvent } from "/core/ui/components/fxs-dropdown.js";
export interface SettingsHeaderOptions {
    isCollapsible?: boolean;
}
export declare abstract class OptionsBase {
    abstract create(_setupParam: GameSetupParameter): HTMLElement;
    getParameterValueName(setupParam: GameSetupParameter): string;
    setParameterCommonInfo(setupParam: GameSetupParameter, parameterInteractable: HTMLElement, defaultValue: GameSetupDomainValue | null): void;
    abstract processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
}
export declare class BooleanOption extends OptionsBase {
    private component;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
    private castToBoolean;
}
export declare class LabelOption extends OptionsBase {
    private root;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
}
export declare class NumericOption extends OptionsBase {
    private root;
    private parameterID;
    private textboxElement;
    private componentValueChangedEventListener;
    create(setupParam: GameSetupParameter): any;
    private onComponentValueChanged;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
}
export declare class TextBoxOption extends OptionsBase {
    private root;
    private parameterID;
    private defaultValue;
    private componentValueChangedEventListener;
    private isTextBoxValueNull;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
    private onComponentValueChanged;
}
export declare class SelectorOption extends OptionsBase {
    private root;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
}
export declare class MultiSelectorOption extends OptionsBase {
    private root;
    private possibleValueElements;
    private strInvertSelection;
    create(setupParam: GameSetupParameter): any;
    processChange(setupParam: GameSetupParameter, change: GameSetupParameterChange): void;
    onPossibleValueToggled(event: DropdownSelectionChangeEvent, context: {
        parameterID: GameSetupStringHandle;
        PlayerID?: PlayerId;
        TeamID?: TeamId;
    }, pv: GameSetupDomainValue): void;
    private findParameter;
    private rebuildPossibleValues;
}
export declare class AdvancedOptionsParameter {
    protected option: OptionsBase;
    protected rootElement: HTMLElement;
    constructor(setupParameter: GameSetupParameter);
    render(): HTMLElement;
    processChange(change: GameSetupParameterChange): void;
}
export declare class SettingsGroup {
    private name;
    private groupHandle;
    private headerOptions;
    private _headerContainer;
    private _bodyElement;
    private _settingsArrow;
    private paramGroupHandle;
    get headerElement(): HTMLElement;
    get bodyElement(): HTMLElement;
    get settingsArrow(): HTMLElement | undefined;
    constructor(name: string, groupHandle: string, headerOptions: SettingsHeaderOptions);
    private createSettingsHeader;
    private onInitialHeightSet;
    toggleCollapseOptionsSection(): void;
    addOption(option: HTMLElement): void;
    remove(): void;
}
declare class SettingsGroupManager {
    private static _Instance;
    private cachedHiddenContainerIDS;
    static getInstance(): SettingsGroupManager;
    addNewSettingsGroup(name: string, groupHandle: string, addToContainer: HTMLElement, headerOptions: SettingsHeaderOptions): SettingsGroup;
    clearCachedHiddenContainerIDs(): void;
}
declare const SettingsGroupData: SettingsGroupManager;
export { SettingsGroupData };
