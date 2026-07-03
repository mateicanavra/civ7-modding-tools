import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { Effect } from "effect";
import type { HabitatConfig, HabitatToolExecutionPlane } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import type { HabitatCommandGitState } from "../../lib/git-state.js";
import type { HabitatClock } from "../../resources/index.js";

export type HabitatCommandKind =
  | "pattern-check"
  | "pattern-apply"
  | "pattern-test"
  | "biome-handoff"
  | "git-state"
  | "workspace-tool";

export type GritParseStatus =
  | "unparsed"
  | "parsed"
  | "no-json"
  | "malformed"
  | "schema-drift"
  | "unsupported-mode";

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

export interface HabitatCommandResult {
  commandId: string;
  kind: HabitatCommandKind;
  requestedExecutable: string;
  executable: string;
  argv: readonly string[];
  executionPlane: HabitatToolExecutionPlane;
  cwd: string;
  envDelta: Record<string, RedactedEnvValue>;
  gitState: HabitatCommandGitState;
  scanRoots: readonly string[];
  cachePolicy: CommandCachePolicy;
  timing: {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    source: "Date.now";
  };
  exit: {
    code: number;
    signal: string | null;
    interrupted: boolean;
  };
  stdout: OutputCapture;
  stderr: OutputCapture;
  parseStatus: GritParseStatus;
  failureTag: string | null;
}

export interface RedactedEnvValue {
  value: string;
  redacted: boolean;
}

export interface OutputCapture {
  text: string;
  truncated: boolean;
  sha256: string;
  bytes: number;
}

export interface CommandRunnerService {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    CommandProviderError,
    CommandExecutor | HabitatConfig | HabitatClock
  >;
  readonly runSync: (request: HabitatProcessRequest) => HabitatCommandResult;
}
