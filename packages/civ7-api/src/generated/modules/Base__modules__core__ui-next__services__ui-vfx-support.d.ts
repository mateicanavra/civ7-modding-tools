export type VfxRuleConstraint = string | {
    op: undefined;
    value: string;
} | {
    op: "eq" | "neq";
    value: string | number | null;
} | {
    op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "exists";
    value: string | number;
} | {
    op: "in";
    value: string[];
};
export interface VfxRule {
    constraints?: Record<string, VfxRuleConstraint>;
    events: Record<string, string>;
    path: string;
}
export interface CompiledVfxRule {
    constraints?: Record<string, VfxRuleConstraint>;
    events: Record<string, string>;
    path: string;
}
export interface CompiledVfxRuleNode {
    rules: CompiledVfxRule[];
    children: Record<string, CompiledVfxRuleNode>;
}
export type VfxEventName = "activate" | "dragReleased" | "dropAccept" | "dropReject" | "press" | "pressError" | "focus" | "focusLost" | string;
export declare function compileVfxRules(rules: VfxRule[]): CompiledVfxRuleNode;
export declare const VfxContext: any;
export declare const useVfx: (localSegment?: string) => (segmentOrEventName: string | VfxEventName, controlRect: DOMRect, eventNameOrVars?: VfxEventName | Record<string, string>, optionalVars?: Record<string, string>) => void;
