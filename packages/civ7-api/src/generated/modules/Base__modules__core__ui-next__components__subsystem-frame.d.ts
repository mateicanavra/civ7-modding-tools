import { Component, JSX } from "solid-js";
import { ActivatableAudio } from "/core/ui-next/components/activatable.js";
import { PanelProps } from "/core/ui-next/components/panel.js";
export type OutsideSafezoneMode = "none" | "vertical" | "horizontal" | "full";
export interface SubsystemFrameProps extends PanelProps {
    /** Controls frame background fill outside the user safezone. */
    outsideSafezoneMode?: OutsideSafezoneMode;
    /** If true, hides the close button. */
    noClose?: boolean;
    /** Optional background image behind the panel content. */
    backdrop?: string;
    /** Optional classes applied to the header container. */
    headerClass?: string;
    /** Optional classes applied to the footer container. */
    footerClass?: string;
    /** Header content rendered above the scroll/content area. */
    header?: JSX.Element;
    /** Footer content rendered below the scroll/content area. */
    footer?: JSX.Element;
    /** Audio group ref for the close button. */
    closeButtonAudio?: ActivatableAudio;
    /** Called when the close button is activated. */
    onClose?: () => void;
}
export type SubsystemFrameComponents = Component<SubsystemFrameProps> & {
    /**
     * Subsystem Frame B1 style.
     * See {@link SubsystemFrameProps} for prop details.
     *
     * Example:
     * ```tsx
     * <SubsystemFrame.B1
     *   name="tech-tree"
     *   header={<Header>...</Header>}
     *   footer={<Button>...</Button>}
     *   onClose={...}
     * >
     *   ...content...
     * </SubsystemFrame.B1>
     * ```
     */
    B1: Component<SubsystemFrameProps>;
    /**
     * Subsystem Frame B2 style.
     * See {@link SubsystemFrameProps} for prop details.
     *
     * Example:
     * ```tsx
     * <SubsystemFrame.B2
     *   name="diplomacy"
     *   header={<Header>...</Header>}
     *   footer={<Button>...</Button>}
     * >
     *   ...content...
     * </SubsystemFrame.B2>
     * ```
     */
    B2: Component<SubsystemFrameProps>;
    /**
     * Subsystem Frame B3 style.
     * See {@link SubsystemFrameProps} for prop details.
     *
     * Example:
     * ```tsx
     * <SubsystemFrame.B3
     *   name="diplomacy-detailed"
     *   header={<Header>...</Header>}
     * >
     *   ...content...
     * </SubsystemFrame.B3>
     * ```
     */
    B3: Component<SubsystemFrameProps>;
    /**
     * Subsystem Frame B4 style.
     * See {@link SubsystemFrameProps} for prop details.
     *
     * Example:
     * ```tsx
     * <SubsystemFrame.B4
     *   name="civic-chooser"
     *   header={<Header>...</Header>}
     * >
     *   ...content...
     * </SubsystemFrame.B4>
     * ```
     */
    B4: Component<SubsystemFrameProps>;
    /**
     * Subsystem Frame Fullscreen style.
     * See {@link SubsystemFrameProps} for prop details.
     *
     * Example:
     * ```tsx
     * <SubsystemFrame.Fullscreen
     *   name="civilopedia"
     *   header={<Header>...</Header>}
     *   onClose={...}
     * >
     *   ...content...
     * </SubsystemFrame.Fullscreen>
     * ```
     */
    Fullscreen: Component<SubsystemFrameProps>;
};
export declare const SubsystemFrame: SubsystemFrameComponents;
