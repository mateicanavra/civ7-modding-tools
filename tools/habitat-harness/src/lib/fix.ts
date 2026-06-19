import { runGritApplyPatterns } from "./grit-apply.js";
import type { SpawnResult } from "./spawn.js";

export interface FixOptions {
  dryRun?: boolean;
}

export async function runFix(options: FixOptions = {}): Promise<SpawnResult> {
  return runGritApplyPatterns({ dryRun: options.dryRun });
}
