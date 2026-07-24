import { Type } from "typebox";
import { Value } from "typebox/value";

const STAGE_ID_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

/** Runtime schema for one delimiter-safe stage identity assigned by recipe composition. */
export const StageIdSchema = Type.String({ pattern: STAGE_ID_PATTERN });

/** Asserts the single stage-identity grammar shared by authoring, execution, and tracing. */
export function assertStageId(value: unknown): asserts value is string {
  if (!Value.Check(StageIdSchema, value)) {
    throw new TypeError(`stage id "${String(value)}" must be kebab-case (e.g. "map-hydrology")`);
  }
}

/**
 * Admits the unique stage identities used by recipe composition.
 *
 * Identity validation happens before recipe compilation because later authoring and execution
 * projections index each stage by this key.
 *
 * @internal
 */
export function assertStageIds(stageIds: readonly string[]): void {
  const admitted = new Set<string>();
  for (const stageId of stageIds) {
    assertStageId(stageId);
    if (admitted.has(stageId)) {
      throw new Error(`duplicate stage id "${stageId}"`);
    }
    admitted.add(stageId);
  }
}
