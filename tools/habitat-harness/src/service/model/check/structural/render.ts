import { writeFileSync } from "node:fs";
import path from "node:path";
import { renderReport } from "@internal/habitat-harness/service/model/check/rule-runtime/messages";
import { repoRoot } from "@internal/habitat-harness/service/runtime/paths";
import type { EmitCheckOptions } from "./request.js";
import type { CheckReport } from "./schema.js";
import { validateCheckReport } from "./schema.js";

export function renderCheckReport(report: CheckReport, options: EmitCheckOptions = {}): string {
  const json = stringifyCheckReport(report);
  if (options.output) writeFileSync(path.resolve(repoRoot, options.output), `${json}\n`);
  return options.json ? json : renderReport(report);
}

export function stringifyCheckReport(report: CheckReport): string {
  const schemaErrors = validateCheckReport(report);
  if (schemaErrors.length > 0) {
    throw new Error(
      `habitat internal error: report violates its own schema:\n${schemaErrors.join("\n")}`
    );
  }
  return JSON.stringify(report, null, 2);
}
