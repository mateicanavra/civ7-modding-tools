export type HabitatCommandKind =
  | "pattern-check"
  | "pattern-apply"
  | "pattern-test"
  | "biome-handoff"
  | "git-state"
  | "workspace-tool";

export interface HabitatProcessRequest {
  commandId: string;
  kind: HabitatCommandKind;
  executable: string;
  argv: readonly string[];
  cwd: string;
  env?: Readonly<Record<string, string | undefined>>;
  scanRoots?: readonly string[];
  cachePolicy?: CommandCachePolicy;
  timeoutMs?: number;
  captureGitState?: boolean;
}

export interface CommandCachePolicy {
  mode: "default" | "disabled" | "isolated";
  cacheDir?: string;
  observableStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
}
