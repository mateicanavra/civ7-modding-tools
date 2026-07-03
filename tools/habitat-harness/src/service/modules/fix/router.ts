import { module } from "./module.js";

export const fixRouter = {
  run: module.run.effect(function* ({ context, input }) {
    const admissions = context.defaultApplyAdmissions();

    if (admissions.length === 0) {
      return context.missingAdmissionRefusal();
    }

    const records = yield* context.runPatternApplyTransactions(
      input,
      admissions,
      context.activeApplyTransactionInputs()
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
