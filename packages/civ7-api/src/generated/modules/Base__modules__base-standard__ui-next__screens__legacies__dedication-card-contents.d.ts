/**
 * @file dedication-card-contents.tsx
 * @copyright 2026, Firaxis Games
 * @description Shared Dedication card content and props.
 */
import { Accessor, Component } from "solid-js";
import type { DraggableProps } from "/core/ui-next/components/drag-and-drop.js";
export interface DedicationCardProps extends DraggableProps {
    id: string;
    title?: string;
    description: string;
    class?: string;
    contentClass?: string;
    icon?: string;
    background?: string;
    navTrayText?: () => string;
    onDedicationActivate?: () => void;
    onHover?: () => void;
    onDehover?: () => void;
    isDisplayOnly?: boolean;
    tabIndex?: number;
}
export interface DedicationCardContentProps extends DedicationCardProps {
    isHover?: Accessor<boolean>;
    isDragging?: Accessor<boolean>;
    onHover?: () => void;
    onDehover?: () => void;
}
export declare const DedicationCardContents: Component<DedicationCardContentProps>;
