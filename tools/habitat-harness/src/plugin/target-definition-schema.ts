import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const NxTargetDependencySchema = Type.Object(
  {
    projects: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const NxTargetDefinitionSchema = Type.Object(
  {
    command: Type.String({ minLength: 1 }),
    options: Type.Object({ cwd: Type.String({ minLength: 1 }) }, { additionalProperties: false }),
    cache: Type.Boolean(),
    inputs: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    outputs: Type.Optional(Type.Array(Type.String())),
    dependsOn: Type.Optional(Type.Array(NxTargetDependencySchema)),
    metadata: Type.Optional(
      Type.Object({ description: Type.String({ minLength: 1 }) }, { additionalProperties: false })
    ),
  },
  { additionalProperties: false }
);

export const InferredProjectSchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    targets: Type.Record(Type.String({ minLength: 1 }), NxTargetDefinitionSchema),
  },
  { additionalProperties: false }
);

export const InferredProjectsSchema = Type.Record(
  Type.String({ minLength: 1 }),
  InferredProjectSchema
);

export type NxTargetDependency = Static<typeof NxTargetDependencySchema>;
export type NxTargetDefinition = Static<typeof NxTargetDefinitionSchema>;
export type InferredProjects = Static<typeof InferredProjectsSchema>;

export function nxTargetDependencies(values: readonly NxTargetDependency[]): NxTargetDependency[] {
  return values.map((value) => Value.Parse(NxTargetDependencySchema, value));
}

export function nxTargetDefinition(value: NxTargetDefinition): NxTargetDefinition {
  return Value.Parse(NxTargetDefinitionSchema, value);
}
