import { type Static, Type } from "typebox";

const ProjectNameOptionSchema = Type.String({
  minLength: 1,
  description: "Project slug without workspace prefix.",
  $default: { $source: "argv", index: 0 },
});
const ProjectKindBoundarySchema = Type.String({
  minLength: 1,
  description: "Requested project kind. Only plugin is currently supported.",
});
const PackageNameOptionSchema = Type.String({
  minLength: 1,
  description: "Optional package name override.",
});
const DirectoryOptionSchema = Type.String({
  minLength: 1,
  description: "Optional repo-relative project root override.",
});

const ProjectKindNxInputSchema = Type.Union(
  [
    Type.Literal("plugin"),
    Type.Literal("app"),
    Type.Literal("adapter"),
    Type.Literal("control"),
    Type.Literal("engine"),
    Type.Literal("library"),
    Type.Literal("mod"),
    Type.Literal("sdk"),
    Type.Literal("tooling"),
    Type.Literal("kind:app"),
    Type.Literal("kind:adapter"),
    Type.Literal("kind:control"),
    Type.Literal("kind:engine"),
    Type.Literal("kind:library"),
    Type.Literal("kind:mod"),
    Type.Literal("kind:plugin"),
    Type.Literal("kind:sdk"),
    Type.Literal("kind:tooling"),
  ],
  { description: "Requested project kind. Only plugin is currently supported." }
);

export const HabitatProjectGeneratorOptionsSchema = Type.Object(
  {
    name: ProjectNameOptionSchema,
    kind: ProjectKindBoundarySchema,
    packageName: Type.Optional(PackageNameOptionSchema),
    directory: Type.Optional(DirectoryOptionSchema),
  },
  { additionalProperties: true }
);

export const HabitatProjectGeneratorNxSchema = Type.Object(
  {
    name: ProjectNameOptionSchema,
    kind: ProjectKindNxInputSchema,
    packageName: Type.Optional(PackageNameOptionSchema),
    directory: Type.Optional(DirectoryOptionSchema),
  },
  {
    $schema: "https://json-schema.org/schema",
    $id: "HabitatProjectGenerator",
    title: "Habitat project generator",
    additionalProperties: true,
  }
);

export type HabitatProjectGeneratorOptions = Static<typeof HabitatProjectGeneratorOptionsSchema>;

export const PackageJsonNameSchema = Type.Object(
  { name: Type.Optional(Type.String({ minLength: 1 })) },
  { additionalProperties: true }
);
