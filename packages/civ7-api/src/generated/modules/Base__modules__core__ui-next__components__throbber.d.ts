export interface ThrobberComponentProps {
    /** An optional caption shown under the animation. */
    caption?: string;
    class?: string;
}
/**
 * A Throbber component, implemented using our standard hourglass animation.
*/
export declare const Throbber: any;
/**
 * A Suspense component that uses a Throbber as a fallback.
*/
export declare const ThrobberSuspense: any;
