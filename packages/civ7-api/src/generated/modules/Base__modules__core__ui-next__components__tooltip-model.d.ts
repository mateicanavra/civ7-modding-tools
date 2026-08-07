import { Accessor } from "solid-js";
import { TriggerHost, TriggerType } from "/core/ui-next/components/trigger.js";
import "/core/ui-next/components/tooltip-hidden-hint.js";
export declare const HIDE_TOOLTIPS_HOLD_THRESHOLD_MS = 1000;
export interface TooltipModel extends TriggerHost {
    readonly active: Accessor<string[]>;
    readonly targets: Accessor<Record<string, WeakRef<HTMLElement> | PlotCoord>>;
    readonly locked: Accessor<string | undefined>;
    readonly isAutolockAvailable: Accessor<boolean>;
    readonly childTooltipTable: () => Record<string, Accessor<string[]>>;
    readonly register: (name: string, childListAccessor: Accessor<string[]>) => () => void;
    readonly isActive: (name: string | undefined) => boolean;
    /**
     * tracks if the user has explicitly hidden tooltips via the inspect action
     * This is not the same as the tooltip systems being disabled in certain screens
     */
    readonly tooltipsHidden: () => boolean;
    /** Toggle the tooltipsHidden state. Used by the hold-to-hide inspect action. */
    readonly toggleTooltipsHidden: () => void;
    readonly isLocked: (name: string | undefined) => boolean;
    readonly unlock: () => void;
    readonly pop: () => void;
    readonly getTarget: (name: string) => HTMLElement | PlotCoord | undefined;
    readonly unlockAll: () => void;
    readonly isAutoLocking: (name: string | undefined) => boolean;
    /** Attempt to lock or toggle the lock state of the current active tooltip. */
    readonly lock: () => boolean;
    readonly triggerTooltip: (name: string, type: TriggerType, source: HTMLElement | PlotCoord | undefined) => void;
}
export declare const TooltipModel: any;
