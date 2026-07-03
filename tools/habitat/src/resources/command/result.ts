import type { HabitatCommandGitState } from "@habitat/cli/providers/git/state";
import type { HabitatToolExecutionPlane } from "@habitat/cli/resources/config/index";
import type { CommandObservation } from "./observation.js";
import type { CommandCachePolicy, HabitatCommandKind } from "./request.js";

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
  observation: CommandObservation;
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
