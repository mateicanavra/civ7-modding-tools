/**
 * @file mods-content.ts
 * @copyright 2024, Firaxis Games
 * @description Screen listing the mods with details.
 */
import Panel from "/core/ui/panel-support.js";
export declare class ModsContent extends Panel {
    private mainSlot;
    private modEntries;
    private modNameHeader;
    private modDateText;
    private modDescriptionText;
    private modDependenciesContent;
    private modsEnableAll;
    private modsDisableUser;
    private selectedMod;
    private selectedModIndex;
    private selectedModHandle;
    private showNotOwnedContent;
    private disableToggling;
    private onModActivateListener;
    private onModFocusListener;
    private focusListener;
    private modToggledActivateListener;
    private modsEnableAllListener;
    private modsDisableUserListener;
    private engineInputListener;
    private refreshInterval;
    private installedModHandles;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    getContent(): string;
    renderModListContent(): void;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    updateModListContent(): void;
    updateDetails(): void;
    private determineEnableButtonState;
    private onModToggled;
    private handleSpecificModToggle;
    private handleModToggle;
    private onModsEnableAll;
    private handleModsEnableAll;
    private onModsDisableUser;
    private handleModsDisableUser;
    private updateNavTray;
    private onFocus;
    private onEngineInput;
    private handleEngineInput;
    private resolveFocus;
    private onModActivate;
    private onModFocus;
    private handleSelection;
    private updateModEntry;
}
