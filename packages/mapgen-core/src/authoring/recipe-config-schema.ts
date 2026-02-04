import { Type, type TObject, type TSchema } from "typebox";

import type { StageContractAny } from "./types.js";

type StageStepLike = Readonly<{ contract: Readonly<{ id: string; schema: TSchema }> }>;
type StageLike = Pick<StageContractAny, "id" | "surfaceSchema" | "knobsSchema" | "steps"> &
  Readonly<{ public?: unknown; steps: readonly StageStepLike[] }>;

function deriveStageSurfaceSchema(stage: StageLike): TObject {
  if (stage.public) return stage.surfaceSchema;

  const props: Record<string, TSchema> = {
    knobs: Type.Optional(stage.knobsSchema),
  };
  for (const step of stage.steps) {
    props[step.contract.id] = Type.Optional(step.contract.schema);
  }
  return Type.Object(props, { additionalProperties: false });
}

/**
 * Derive the top-level (surface) recipe config schema from stage definitions.
 *
 * Notes:
 * - We intentionally do NOT set a top-level `{ default: {} }` here. In TypeBox, an object-level
 *   default can suppress property defaults during default materialization.
 * - Stages without an explicit `public` surface are expanded to include per-step schemas so UIs
 *   can validate and default full step configs.
 */
export function deriveRecipeConfigSchema(stages: readonly StageLike[]): TObject {
  const properties: Record<string, TSchema> = {};
  for (const stage of stages) {
    properties[stage.id] = Type.Optional(deriveStageSurfaceSchema(stage));
  }
  return Type.Object(properties, { additionalProperties: false });
}
