/**
 * @file ornate-popup.ts
 * @copyright 2026, Firaxis Games
 * @description A Popup that has is styled to be more ornate then the usual popup
 */
import { Component, type JSX } from "solid-js";
interface OrnateTopIconProps extends JSX.HTMLAttributes<HTMLDivElement> {
    backgroundTint: string;
    iconSrc: string;
    iconClass?: string;
}
export declare const OrnateTopIcon: Component<OrnateTopIconProps>;
export declare const OrnatePopupFrame: any;
export {};
