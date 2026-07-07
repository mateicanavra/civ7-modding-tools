import { type Static, Type } from "typebox";

export const RUN_IN_GAME_SAFE_FAILURE_CATEGORIES = [
  "request-validation",
  "source-resolution",
  "artifact-generation",
  "deployment",
  "runtime-control",
  "runtime-observation",
  "attribution",
  "cleanup",
  "ownership",
  "dependency-unavailable",
  "operation-cancelled",
  "internal-defect",
] as const;

export type RunInGameSafeFailureCategory = (typeof RUN_IN_GAME_SAFE_FAILURE_CATEGORIES)[number];

export const runInGameSafeFailureCategory = Type.Union([
  Type.Literal("request-validation"),
  Type.Literal("source-resolution"),
  Type.Literal("artifact-generation"),
  Type.Literal("deployment"),
  Type.Literal("runtime-control"),
  Type.Literal("runtime-observation"),
  Type.Literal("attribution"),
  Type.Literal("cleanup"),
  Type.Literal("ownership"),
  Type.Literal("dependency-unavailable"),
  Type.Literal("operation-cancelled"),
  Type.Literal("internal-defect"),
]);

export type RunInGameSafeFailureCategorySchema = Static<typeof runInGameSafeFailureCategory>;
