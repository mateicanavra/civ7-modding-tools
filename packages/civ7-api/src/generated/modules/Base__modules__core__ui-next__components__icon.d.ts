import { type JSX } from "solid-js";
export interface IconProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     * The icon id (or url if isURL is set to true)
     */
    name?: string;
    /**
     * The mask image url, must be in the form of a css url()
     */
    mask?: string;
    /**
     * The icon context. Has no effect if isUrl is set to true
     */
    context?: string;
    /**
     * If set, name must be in the form of a css url() and context will be ignored
     */
    isUrl?: boolean;
    /**
     * The icon class list. By default icon has no dimensions, so at least a size-* should be provided
     */
    class: string;
}
/**
 * An icon component.
 * Can be used to display icons by name or by url.
 * A size must be specified in the class or style as it has none by default.
 * ```tsx
 * // Example - Icon by name
 * <Icon class="size-8" name="YIELD_PRODUCTION" />
 * // Example - Icon by url
 * <Icon class="size-8" name="url('blp:Yield_Production')" isUrl={true} />
 * ```
 * Default implementation: {@link IconComponent}
 * @param {IconProps} props See {@link IconProps} for a full list of properties
 *
 * Commonly Used Properties:
 * @param {string} props.name The icon id (or url if isURL is set to true)
 * @param {string} props.context The optional icon context. Has no effect if isUrl is set to true  Default: undefined
 * @param {boolean} props.isUrl  If set, name must be in the form of a css url() and context will be ignored. Default: false
 */
export declare const Icon: any;
