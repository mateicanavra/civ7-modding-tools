import type { JSX, ParentComponent } from "solid-js";
export interface SandboxBoxProps extends JSX.HTMLAttributes<HTMLDivElement> {
    class?: string;
}
export declare const SandboxBox: ParentComponent<SandboxBoxProps>;
