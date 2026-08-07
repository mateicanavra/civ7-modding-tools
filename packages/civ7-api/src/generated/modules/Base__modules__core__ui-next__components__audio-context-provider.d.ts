import { ParentComponent } from "solid-js";
import { type AudioRule } from "/core/ui-next/services/audio-support.js";
interface AudioContextProviderProps {
    segment?: string;
    vars?: Record<string, string>;
    /**
     * If not provided, will inherit rules from the parent context.
     * If there is no parent context, this will use the 'global' rules provided by the modding framework.
     */
    rules?: AudioRule[];
}
export declare const AudioContextProvider: ParentComponent<AudioContextProviderProps>;
export {};
