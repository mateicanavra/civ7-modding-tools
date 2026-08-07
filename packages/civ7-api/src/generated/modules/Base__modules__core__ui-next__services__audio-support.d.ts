export type AudioRuleConstraint = string | {
    op: undefined;
    value: string;
} | {
    op: "eq" | "neq";
    value: string | number | null;
} | {
    op: "lt" | "lte" | "gt" | "gte" | "exists";
    value: string | number;
} | {
    op: "in";
    value: string[];
};
export interface AudioRule {
    constraints?: Record<string, AudioRuleConstraint>;
    events: Record<string, string>;
    path: string;
}
export interface CompiledAudioRule {
    constraints?: Record<string, AudioRuleConstraint>;
    events: Record<string, string>;
    path: string;
}
export interface CompiledAudioRuleNode {
    rules: CompiledAudioRule[];
    children: Record<string, CompiledAudioRuleNode>;
}
export type AudioEventName = "activate" | "focus" | "dragReleased" | "dropAccept" | "dropReject" | "press" | "pressError" | string;
export declare function compileAudioRules(rules: AudioRule[]): CompiledAudioRuleNode;
export declare const AudioContext: any;
export declare const useAudio: (localSegment?: string) => (segmentOrEventName: string | AudioEventName, eventNameOrVars?: AudioEventName | Record<string, string>, optionalVars?: Record<string, string>) => void;
