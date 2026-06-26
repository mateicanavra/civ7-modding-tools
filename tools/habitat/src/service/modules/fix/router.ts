import { module } from "./module.js";

export const fixRouter = {
  planPatterns: module.planPatterns.effect(function* ({ context }) {
    const admissions = context.defaultApplyAdmissions();

    if (admissions.length === 0) {
      return context.missingAdmissionRefusal();
    }

    const records = yield* context.runPatternApplyTransactions(
      { kind: "dry-run-intent" },
      admissions,
      context.admittedApplyTransactionInputs()
    );
    const rendered = records.map(context.renderPatternApply);
    const failed = rendered.find((result) => result.exitCode !== 0);
    if (failed) return failed;

    return {
      exitCode: 0,
      stdout: rendered.map((result) => result.stdout).join(""),
      stderr: rendered.map((result) => result.stderr).join(""),
    };
  }),
  applyPatterns: module.applyPatterns.effect(function* ({ context }) {
    const admissions = context.defaultApplyAdmissions();

    if (admissions.length === 0) {
      return context.missingAdmissionRefusal();
    }

    const records = yield* context.runPatternApplyTransactions(
      { kind: "live-write-intent" },
      admissions,
      context.admittedApplyTransactionInputs()
    );
    const rendered = records.map(context.renderPatternApply);
    const failed = rendered.find((result) => result.exitCode !== 0);
    if (failed) return failed;

    return {
      exitCode: 0,
      stdout: rendered.map((result) => result.stdout).join(""),
      stderr: rendered.map((result) => result.stderr).join(""),
    };
  }),
};

export const router = fixRouter;
