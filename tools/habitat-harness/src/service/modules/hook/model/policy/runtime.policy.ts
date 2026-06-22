import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { Clock, Effect } from "effect";

type HookReportEvent =
  | { readonly kind: "stdout"; readonly text: string }
  | { readonly kind: "stderr"; readonly text: string }
  | { readonly kind: "trace"; readonly message: string };

interface HookReporterPort {
  readonly emit: (event: HookReportEvent) => Effect.Effect<void>;
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

export function hookNow(): Effect.Effect<number> {
  return Clock.currentTimeMillis;
}

export function createHookOutput(reporter?: HookReporterPort): {
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
