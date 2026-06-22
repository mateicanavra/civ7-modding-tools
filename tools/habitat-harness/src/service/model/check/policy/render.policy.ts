import type { CheckReport } from "../dto/check.schema.js";
import { validateCheckReport } from "../dto/check.schema.js";
import { renderReport } from "./messages.policy.js";
import type { EmitCheckOptions } from "./request.policy.js";

export function renderCheckReport(report: CheckReport, options: EmitCheckOptions = {}): string {
  const json = stringifyCheckReport(report);
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
