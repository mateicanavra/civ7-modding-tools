/** Project dependency constraints shared by ESLint enforcement and Habitat's taxonomy audit. */
export const depConstraints = [
  {
    sourceTag: "kind:workspace",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:control",
      "kind:foundation",
      "kind:plugin",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:foundation", onlyDependOnLibsWithTags: ["kind:foundation"] },
  { sourceTag: "kind:adapter", onlyDependOnLibsWithTags: ["kind:foundation"] },
  { sourceTag: "kind:engine", onlyDependOnLibsWithTags: ["kind:adapter", "kind:foundation"] },
  { sourceTag: "kind:plugin", onlyDependOnLibsWithTags: ["kind:plugin", "kind:foundation"] },
  {
    sourceTag: "kind:sdk",
    onlyDependOnLibsWithTags: ["kind:engine", "kind:adapter", "kind:foundation", "kind:plugin"],
  },
  {
    sourceTag: "kind:control",
    onlyDependOnLibsWithTags: ["kind:control", "kind:foundation", "kind:adapter", "kind:engine"],
  },
  {
    sourceTag: "kind:mod",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:foundation",
      "kind:control",
      "kind:plugin",
    ],
  },
  {
    sourceTag: "kind:app",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:foundation",
      "kind:plugin",
      "kind:control",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:tooling", onlyDependOnLibsWithTags: ["kind:tooling", "kind:foundation"] },
  {
    sourceTag: "habitat:runtime",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service"],
  },
  {
    sourceTag: "habitat:service",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service"],
  },
  {
    sourceTag: "habitat:cli",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service", "habitat:cli"],
  },
  {
    sourceTag: "layer:service-entry",
    onlyDependOnLibsWithTags: ["layer:service-shell", "layer:service-entry"],
  },
  {
    sourceTag: "layer:service-shell",
    onlyDependOnLibsWithTags: [
      "habitat:runtime",
      "layer:service-model",
      "layer:service-module",
      "layer:resource-provider",
    ],
  },
  {
    sourceTag: "layer:service-module",
    onlyDependOnLibsWithTags: [
      "layer:service-shell",
      "layer:service-model",
      "layer:resource-provider",
    ],
  },
  {
    sourceTag: "layer:service-model",
    onlyDependOnLibsWithTags: ["layer:service-model", "layer:resource-provider"],
  },
  {
    sourceTag: "layer:resource-provider",
    onlyDependOnLibsWithTags: ["layer:resource-provider", "layer:service-model"],
  },
];

/** Import paths exempted from project-tag enforcement by the boundary owner. */
export const boundaryAllow = [
  "/base-standard/**",
  "./model/**",
  "./nx-plugin.ts",
  "./providers/**",
  "./resources/**",
  "./service/**",
  "../../../../resources/**",
  "../../service/model/rules/dto/registry.schema.ts",
  "../../host/**",
  "../../rules/**",
];

/** The single options object used by every language lane of the Nx boundary rule. */
export const boundaryRuleOptions = {
  enforceBuildableLibDependency: false,
  allowCircularSelfDependency: true,
  allow: boundaryAllow,
  depConstraints,
};
