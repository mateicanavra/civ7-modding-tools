import { type Static, Type } from "typebox";

export const PackageJsonTargetInventorySchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    scripts: Type.Optional(Type.Record(Type.String({ minLength: 1 }), Type.String())),
    nx: Type.Optional(
      Type.Object(
        {
          targets: Type.Optional(Type.Record(Type.String({ minLength: 1 }), Type.Unknown())),
        },
        { additionalProperties: true }
      )
    ),
  },
  { additionalProperties: true }
);

export const RootPackageJsonWorkspaceSchema = Type.Object(
  {
    workspaces: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  },
  { additionalProperties: true }
);

export type PackageJsonTargetInventory = Static<typeof PackageJsonTargetInventorySchema>;
export type RootPackageJsonWorkspace = Static<typeof RootPackageJsonWorkspaceSchema>;
