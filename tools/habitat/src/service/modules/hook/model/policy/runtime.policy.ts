import type {
  HabitatReportEvent,
  HabitatReporterService,
} from "@habitat/cli/resources/reporter/index";
import { Clock, Effect } from "effect";

export type HookReporterPort = HabitatReporterService;

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

export function hookNow() {
  return Clock.currentTimeMillis;
}

export function createHookOutput(reporter?: HookReporterPort) {
  let stdout = "";
  let stderr = "";
  const events: HabitatReportEvent[] = [];
  return {
    flush() {
      if (!reporter || events.length === 0) return Effect.void;
      return Effect.forEach(events, (event) => reporter.emit(event), {
        discard: true,
      });
    },
    writeStdout(text: string) {
      if (!text) return;
      stdout += text;
      events.push({ kind: "stdout", text });
    },
    writeStderr(text: string) {
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
  if (!output) return "";
  return `\n[${label}]\n${output}`;
}
