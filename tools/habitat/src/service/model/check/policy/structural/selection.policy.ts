import {
  type CheckReport,
  deriveRuleReportStatus,
  type RuleReport,
  type StructuralCheckRequest,
} from "@habitat/cli/service/model/check/index";
import {
  describeRuleSelectionFailure,
  type RuleSelectionResult,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Clock, Effect } from "effect";

export const selectorRefusalReportEffect = Effect.fn("habitat.check.selectorRefusalReport")(
  function* (
    failure: Extract<RuleSelectionResult, { ok: false }>,
    request: StructuralCheckRequest
  ) {
    const started = yield* Clock.currentTimeMillis;
    const ended = yield* Clock.currentTimeMillis;
    const refusalMessage = describeRuleSelectionFailure(failure);
    const disposition: RuleReport["disposition"] = {
      kind: "selector-refused",
      refusal: {
        reason: failure.reason,
        message: refusalMessage,
      },
    };
    const diagnostics: RuleReport["diagnostics"] = [
      {
        ruleId: "rule-selection-integrity",
        path: ".",
        message: refusalMessage,
        severity: "error",
        baselined: false,
      },
    ];
    const lane: RuleReport["lane"] = "enforced";
    const report: RuleReport = {
      ruleId: "rule-selection-integrity",
      runner: "habitat",
      lane,
      status: deriveRuleReportStatus({ lane, disposition, diagnostics }),
      locked: true,
      durationMs: Math.max(0, ended - started),
      disposition,
      diagnostics,
      message:
        "Requested Habitat selectors must match real rule owners, rule ids, runners, and non-empty intersections before rule execution.",
      remediate:
        "Use --owner for owner project ids, --rule for rule ids, --runner for top-level runner names: grit, habitat, or nx; or omit selectors to run all rules.",
    };
    return yield* constructCheckReportEffect({
      command: request.command.serialized,
      reports: [report],
    });
  }
);

export const constructCheckReportEffect = Effect.fn("habitat.check.constructReport")(
  function* (input: { command: string; reports: readonly RuleReport[] }) {
    const startedMs = yield* Clock.currentTimeMillis;
    return {
      schemaVersion: 2,
      command: input.command,
      startedAt: new Date(startedMs).toISOString(),
      ok: input.reports.every((report) => report.status !== "fail"),
      rules: [...input.reports],
    } satisfies CheckReport;
  }
);
