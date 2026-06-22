import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { Clock, Effect } from "effect";
import type { HookReportChannel, HookTrace } from "./schema.js";

export interface HookReportEvent {
  channel: HookReportChannel;
  text: string;
}

export interface HookReporter {
  write(event: HookReportEvent): void;
}

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
  reporter?: HookReporter;
  resourcePolicy?: HookResourcePolicy;
  trace?: HookTrace;
}

export function createHookTrace(): HookTrace {
  return { commands: [] };
}

export function hookNow(runtime: HookRuntime): Effect.Effect<number> {
  return runtime.nowMs ? Effect.sync(runtime.nowMs) : Clock.currentTimeMillis;
}

export function createHookOutput(reporter?: HookReporter): {
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
      reporter?.write({ channel: "stdout", text });
    },
    writeStderr(text) {
      if (!text) return;
      stderr += text;
      reporter?.write({ channel: "stderr", text });
    },
    result() {
      return { stdout, stderr };
    },
  };
}

export function section(label: string, output: string): string {
  return output ? `\n[${label}]\n${output}` : "";
}
