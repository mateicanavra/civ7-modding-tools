import type { SpawnResult } from "@habitat/cli/resources/command/index";
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
  flush: () => Effect.Effect<void>;
  writeStdout: (text: string) => void;
  writeStderr: (text: string) => void;
  result: () => Pick<SpawnResult, "stdout" | "stderr">;
} {
  let stdout = "";
  let stderr = "";
  const events: HookReportEvent[] = [];
  return {
    flush() {
      if (!reporter || events.length === 0) return Effect.void;
      return Effect.forEach(events, (event) => reporter.emit(event), {
        discard: true,
      });
    },
    writeStdout(text) {
      if (!text) return;
      stdout += text;
      events.push({ kind: "stdout", text });
    },
    writeStderr(text) {
      if (!text) return;
      stderr += text;
      events.push({ kind: "stderr", text });
    },
    result() {
      return { stdout, stderr };
    },
  };
}

export function section(label: string, output: string): string {
  return output ? `\n[${label}]\n${output}` : "";
}
