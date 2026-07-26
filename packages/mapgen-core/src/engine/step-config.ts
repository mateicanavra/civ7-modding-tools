import { Type } from "typebox";

/** Canonical closed schema for a step that intentionally exposes no author-facing configuration. */
export const EmptyStepConfigSchema = Type.Object({}, { additionalProperties: false, default: {} });
