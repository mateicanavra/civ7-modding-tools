/**
 * @file panel-yield-banner.ts
 * @copyright 2024-2025, Firaxis Games
 * @description Houses the player's yields and yield configuration
 */
import { FxsActivatable } from "/core/ui/components/fxs-activatable.js";
import Panel from "/core/ui/panel-support.js";
declare class YieldBarEntry extends FxsActivatable {
    private type;
    private value;
    private stored;
    private max;
    private yieldIcon;
    private valueText;
    private addOrRemoveWarning;
    private updateValueText;
    onInitialize(): void;
    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "yield-bar-entry": ComponentRoot<YieldBarEntry>;
    }
}
export declare class PanelYieldBanner extends Panel {
    private engineInputListener;
    private advancedStartEffectUsedListener;
    private inputContextChangedListener;
    private interfaceModeChangedListener;
    private yieldElementMap;
    private settlementCapElement;
    private cityCapElement;
    private readonly navHelpContainer;
    constructor(root: ComponentRoot);
    onInitialize(): void;
    onAttach(): void;
    onDetach(): void;
    private onConstructableAddedToMap;
    private onUnitRemovedFromMap;
    private onCityAddedToMap;
    private onPlayerYieldChanged;
    private onPlayerSettlementCapChanged;
    private onTreasuryChanged;
    private onDiplomacyTreasuryChanged;
    private onPolicyChanged;
    private onNarrativeChoiceMade;
    private onPlayerCityLimitChanged;
    private updateAll;
    private onEngineInput;
    private render;
    private onInputContextChanged;
    private onInterfaceModeChanged;
    private onAdvancedStartEffectUsed;
}
declare global {
    interface HTMLElementTagNameMap {
        "panel-yield-banner": ComponentRoot<PanelYieldBanner>;
    }
}
export {};
