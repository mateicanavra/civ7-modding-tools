import type { TSchema } from "typebox";
import { Value } from "typebox/value";

export type ArtifactValidationIssue = Readonly<{ message: string }>;

export type ArtifactValidationContext = Readonly<{
  dimensions?: Readonly<{ width: number; height: number }>;
}>;

export function validateArtifactSchema(
  schema: TSchema,
  value: unknown
): readonly ArtifactValidationIssue[] {
  return Object.freeze(
    Array.from(Value.Errors(schema, value), (error) => {
      const path =
        (error as { path?: string; instancePath?: string }).path ??
        (error as { instancePath?: string }).instancePath ??
        "/";
      return { message: `${path} ${error.message}` };
    })
  );
}

export function artifactCellCount(
  context: ArtifactValidationContext | undefined
): number | undefined {
  const width = context?.dimensions?.width;
  const height = context?.dimensions?.height;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return undefined;
  return Math.max(0, (width! | 0) * (height! | 0));
}
