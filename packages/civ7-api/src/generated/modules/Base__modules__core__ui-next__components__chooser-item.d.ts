import { type JSX } from "solid-js";
import { type ActivatableProps } from "/core/ui-next/components/activatable.js";
export interface ChooserItemProps extends ActivatableProps {
    /** Selected state; when true, shows the selection frame */
    selected?: boolean;
    /** If true, item can be selected even when disabled */
    selectableWhenDisabled?: boolean;
    /** If true, selecting occurs when focused */
    selectOnFocus?: boolean;
    /** If true, selecting occurs when activated */
    selectOnActivate?: boolean;
    /** Shows the selection frame on hover */
    showFrameOnHover?: boolean;
    /** Shows the standard gray bg behind the chooser item */
    showColorBg?: boolean;
    /** Called when the item becomes selected */
    onSelect?: () => void;
    /** Optional icon rendered before content. If string, treated as image URL. */
    icon?: string | JSX.Element;
    /** When using string icon, optionally render locked overlay state */
    iconLocked?: boolean;
    /** Optional classes applied to the inner content container. */
    contentClass?: string;
    /** Optional opacity for the disabled overlay. Defaults to 0.7. */
    disabledOverlayOpacity?: number;
    /** Ref callback to get access to the host element */
    ref?: (el: HTMLDivElement) => void;
}
/**
 * ChooserItem - Solid.js implementation of the legacy fxs-chooser-item.
 * Compose this with your own content to build list entries that support selection and activation.
 */
export declare const ChooserItem: any;
