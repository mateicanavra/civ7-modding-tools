import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import type { HabitatReporterService } from "@internal/habitat-harness/resources/reporter/index";
import { Clock, Effect } from "effect";
import type { HookTrace } from "../dto/hook.schema.js";

export interface ResourceRecoveryCommands {
  publish: string;
  status: string;
  init: string;
  unlock: string;
}

export interface HookResourcePolicy {
  path: string;
  commands: ResourceRecoveryCommands;
}

export interface HookRuntime {
  pathExists?: (target: string) => boolean;
  fileHash?: (repoRelativePath: string) => string | null;
  nowMs?: () => number;
  resourcePolicy?: HookResourcePolicy;
  trace?: HookTrace;
}

export function createHookTrace(): HookTrace {
  return { commands: [] };
}

export function hookNow(runtime: HookRuntime): Effect.Effect<number> {
  return runtime.nowMs ? Effect.sync(runtime.nowMs) : Clock.currentTimeMillis;
}

export function createHookOutput(reporter?: HabitatReporterService): {
  writeStdout: (text: string) => void;
  writeStderr: (text: string) => void;
  result: () => Pick<SpawnResult, "stdout" | "stderr">;
} {
  let stdout = "";
  let stderr = "";
  return {
    writeStdout(text) {
      if (!text) return;
      stdout += text;
      if (reporter) Effect.runSync(reporter.emit({ kind: "stdout", text }));
    },
    writeStderr(text) {
      if (!text) return;
      stderr += text;
      if (reporter) Effect.runSync(reporter.emit({ kind: "stderr", text }));
    },
    result() {
      return { stdout, stderr };
    },
  };
}

export function section(label: string, output: string): string {
  return output ? `\n[${label}]\n${output}` : "";
}
