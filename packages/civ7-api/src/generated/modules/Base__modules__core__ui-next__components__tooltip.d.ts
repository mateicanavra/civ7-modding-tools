import { Accessor, JSX, ParentComponent } from "solid-js";
import { LocaleProps } from "/core/ui-next/components/l10n.js";
import { FocusNavigationRulesMap } from "/core/ui-next/services/focus.js";
import "/core/ui-next/components/tooltip-hidden-hint.js";
export declare const TooltipNavigationRules: FocusNavigationRulesMap;
export declare enum TooltipVerticalPosition {
    /** Automatically determine best fit based on position of target  */
    AUTO = "auto",
    /** Bottom of tooltip aligns with top of target */
    TOP = "top",
    /** Center of tooltip aligns with center of target */
    CENTER = "center",
    /** Top of tooltip aligns with bottom of target */
    BOTTOM = "bottom"
}
export declare enum TooltipHorizontalPosition {
    /** Automatically determine best fit based onposition of target */
    AUTO = "auto",
    /** Right of tooltip aligns with right of target */
    LEFT_COVER = "left_cover",
    /** Right of tooltip aligns with left of target */
    LEFT = "left",
    /** Center of tooltip aligns with center of target */
    CENTER = "center",
    /** Left of tooltip aligns with left of target */
    RIGHT_COVER = "right_cover",
    /** Left of tooltip aligns with right of target */
    RIGHT = "right"
}
export interface TooltipBaseProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Optional delegated trigger registration for callers that already own a concrete trigger element. */
    delegatedTrigger?: {
        root: HTMLElement;
        element: HTMLElement;
    };
    /** The vertical position of the tooltip. @default TooltipVerticalPosition.AUTO */
    initialVPosition?: TooltipVerticalPosition;
    /** The horizontal position of the tooltip. @default TooltipVerticalPosition.AUTO */
    initialHPosition?: TooltipHorizontalPosition;
    /** The offset of the tooltip from its trigger. @default 0 */
    offset?: number;
    /** Whether the tooltip is allowed to flip to avoid overflow. @default false */
    allowFlip?: boolean;
    /** Whether the tooltip should show its filigree decorations. @default true */
    showFiligrees?: boolean;
}
export interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
}
export declare const TooltipContext: any;
type TooltipInspectHintProps = JSX.HTMLAttributes<HTMLDivElement> & {
    progressBarRef?: (el: HTMLDivElement | null) => void;
    isLargeContent?: Accessor<boolean>;
    handlers?: {
        isLocked: Accessor<boolean>;
        isTopLevelActiveAndLocked: Accessor<boolean>;
        tooltipCount: Accessor<number>;
    };
};
interface TooltipFrameProps extends JSX.HTMLAttributes<HTMLDivElement> {
    hideHint?: boolean;
}
export type TooltipTextProps = TooltipBaseProps & LocaleProps & {
    class?: string;
    header?: string;
    headerClass?: string;
    bodyClass?: string;
    showFiligrees?: boolean;
};
export type TooltipComponents = ParentComponent<TooltipBaseProps> & {
    /**
     * The tooltips trigger component.
     * Can be used to trigger the tooltip with the same name to be displayed.
     * By default, tooltips have no frame, use {@link Tooltip.Frame} to add a basic frame.
     * ```tsx
     * <Tooltip>
     *   <Tooltip.Trigger>
     *   <Button>Hover Me</Button>
     *   </Tooltip.Trigger>
     *   <Tooltip.Content>I am a tooltip</Tooltip.Content>
     * </Tooltip>
     * ```
     * @param {TriggerProps} props See {@link TriggerProps} for a full list of properties
     */
    Trigger: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>>;
    /**
     * The tooltip content component.
     * Renders the tooltip body in a portal and handles positioning relative to the trigger.
     * ```tsx
     * <Tooltip>
     *   <Tooltip.Trigger>Hover me</Tooltip.Trigger>
     *   <Tooltip.Content>Hi!</Tooltip.Content>
     * </Tooltip>
     * ```
     */
    Content: ParentComponent<TooltipContentProps>;
    /**
     * A text tooltip.
     * Can be used to display a text tooltip on an activatable or derivative.
     * ```tsx
     * <Tooltip.Text text="I am a text tooltip">
     *   <Activatable> Hover Me </Activatable>
     * </Tooltip.Text>
     * ```
     * Default implementation: {@link TooltipTextComponent}
     * @param {TooltipTextProps} props See {@link TooltipTextProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {string} props.text The text to display on the tooltip.
     */
    Text: ParentComponent<TooltipTextProps>;
    /**
     * A text tooltip formatted to look like legacy tooltips (i.e. frame only, just text).
     * Can be used to display a text tooltip on an activatable or derivative.
     * ```tsx
     * <Tooltip.LegacyText text="I am a text tooltip">
     *   <Activatable> Hover Me </Activatable>
     * </Tooltip.LegacyText>
     * ```
     * Default implementation: {@link TooltipLegacyTextComponent}
     * @param {LocaleProps} props See {@link LocaleProps} for a full list of properties
     */
    LegacyText: ParentComponent<LocaleProps>;
    /**
     * A basic tooltip frame.
     * Can be used to add a basic frame around a tooltip
     *
     * ```tsx
     * <Tooltip>
     *   <Tooltip.Trigger><Button>Hover Me</Button></Tooltip.Trigger>
     *   <Tooltip.Content>
     *     <Tooltip.Frame>I was framed!</Tooltip.Frame>
     *   </Tooltip.Content>
     * </Tooltip>
     * ```
     * Default implementation: {@link TooltipFrameComponent}
     */
    Frame: ParentComponent<TooltipFrameProps>;
    /**
     * A hint to show when the tooltip can be inspected to reveal other nested tooltips.
     *
     * Typically included at the bottom of the tooltip after the content.
     *
     * ```tsx
     * <Tooltip>
     *   <Tooltip.Trigger><Button>Hover Me</Button></Tooltip.Trigger>
     *   <Tooltip.Content>
     *     <Tooltip.Frame>I was framed!</Tooltip.Frame>
     *     <Tooltip.InspectHint />
     *   </Tooltip.Content>
     * </Tooltip>
     * ```
     *
     * Default implementation: {@link TooltipInspectHintComponent}
     */
    InspectHint: ParentComponent<TooltipInspectHintProps>;
};
/**
 * A custom tooltip component.
 * Can be used to display any information as a tooltip, relative to a trigger component.
 * ```tsx
 * <Tooltip>
 *   <Tooltip.Trigger><Button>Hover Me</Button></Tooltip.Trigger>
 *   <Tooltip.Content>I am a tooltip</Tooltip.Content>
 * </Tooltip>
 * ```
 * Default implementation: {@link TooltipRootComponent}
 * @param {TooltipBaseProps} props See {@link TooltipBaseProps} for a full list of properties
 */
export declare const Tooltip: TooltipComponents;
export {};
