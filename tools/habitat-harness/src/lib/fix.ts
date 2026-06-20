import type { Layer } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  ApplyAdmissionSchema,
  type ApplyTransactionInput,
  activeApplyTransactionInputs,
  defaultApplyAdmissions,
} from "../rules/patterns/index.js";
import type { HabitatProcess } from "./habitat-process.js";
import {
  observeWorktree,
  type PatternApplyRequest,
  renderPatternApply,
  runPatternApply,
} from "./pattern-apply/index.js";
import type { SpawnResult } from "./spawn.js";

export const FixCommandIntentSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("dry-run-intent"), Type.Literal("live-write-intent")]),
  },
  { additionalProperties: false }
);

export type FixCommandIntent = Static<typeof FixCommandIntentSchema>;

const FixAdmissionSetSchema = Type.Array(ApplyAdmissionSchema);

export interface FixOptions {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  processLayer?: Layer.Layer<HabitatProcess>;
}

export async function runFix(
  intent: FixCommandIntent,
  options: FixOptions = {}
): Promise<SpawnResult> {
  const parsed = Value.Parse(FixCommandIntentSchema, intent);
  const admissions = Value.Parse(
    FixAdmissionSetSchema,
    options.admissions ?? defaultApplyAdmissions()
  );

  if (admissions.length === 0) {
    return missingAdmissionRefusal();
  }

  const transactionInputs = options.transactionInputs ?? activeApplyTransactionInputs();
  const results = await Promise.all(
    admissions.map((admission) =>
      runPatternApply(transactionRequest(parsed, admission), {
        processLayer: options.processLayer,
        transactionInputs,
      })
    )
  );
  const rendered = results.map(renderPatternApply);
  const failed = rendered.find((result) => result.exitCode !== 0);
  if (failed) return failed;

  return {
    exitCode: 0,
    stdout: rendered.map((result) => result.stdout).join(""),
    stderr: rendered.map((result) => result.stderr).join(""),
  };
}

function transactionRequest(
  intent: FixCommandIntent,
  admission: ApplyAdmission
): PatternApplyRequest {
  return {
    kind: intent.kind,
    worktree: observeWorktree(),
    admission,
  };
}

function missingAdmissionRefusal(): SpawnResult {
  return {
    exitCode: 1,
    stdout: "",
    stderr: [
      "habitat fix refused: missing-apply-admission",
      "habitat fix requires an apply admission before it can plan or write changes.",
      "recovery: Admit an apply-capable pattern through pattern manifest before invoking fix.",
      "",
    ].join("\n"),
  };
}
