import { Value } from "typebox/value";
import {
  HostExternalResourceSurfaceDeclarationSchema,
  HostGeneratedSurfaceDeclarationSchema,
  type HostMatcher,
  type HostPolicyDocument,
  HostPolicyDocumentSchema,
  type HostRecoveryInstruction,
  UnsupportedHostShapeDeclarationSchema,
} from "../dto/host-policy.schema.js";

const policyId = "civ7-repo-host-policy";

export const defaultHostPolicyDocument: HostPolicyDocument = Value.Parse(HostPolicyDocumentSchema, {
  schemaVersion: 1,
  policyId,
  owners: [
    {
      ownerId: "swooper-maps-workflow",
      displayName: "Swooper Maps workflow",
      owningPackageOrWorkflow: "mods/mod-swooper-maps",
      recoveryContact: "docs/system/mods/swooper-maps/",
      aliases: ["Swooper Maps", "MapGen maps"],
    },
    {
      ownerId: "civ7-resources-workflow",
      displayName: "Civ7 resources workflow",
      owningPackageOrWorkflow: "docs/process/resources-submodule.md",
      recoveryContact: "docs/process/resources-submodule.md",
      aliases: ["Civ7 official resources"],
    },
    {
      ownerId: "map-policy-workflow",
      displayName: "Civ7 map policy workflow",
      owningPackageOrWorkflow: "packages/civ7-map-policy",
      recoveryContact: "packages/civ7-map-policy/AGENTS.md",
      aliases: ["map policy generated tables"],
    },
    {
      ownerId: "mapgen-domain-workflow",
      displayName: "MapGen domain workflow",
      owningPackageOrWorkflow: "mods/mod-swooper-maps/src/domain",
      recoveryContact: "docs/system/libs/mapgen/",
      aliases: ["MapGen public ops"],
    },
  ],
  declarations: [
    generatedSurface(
      "swooper-map-generated",
      "swooper-maps-workflow",
      {
        kind: "prefix",
        value: "mods/mod-swooper-maps/src/maps/generated/",
      },
      commandRecovery("swooper-maps-workflow", "nx run mod-swooper-maps:gen:maps")
    ),
    externalResourceSurface(
      "civ7-types-generated",
      "civ7-resources-workflow",
      {
        kind: "prefix",
        value: "packages/civ7-types/generated/",
      },
      documentedRecovery("civ7-resources-workflow", "docs/process/resources-submodule.md")
    ),
    generatedSurface(
      "civ7-map-policy-tables",
      "map-policy-workflow",
      {
        kind: "exact",
        value: "packages/civ7-map-policy/src/civ7-tables.gen.ts",
      },
      commandRecovery("map-policy-workflow", "nx run civ7-map-policy:verify -- --write")
    ),
    {
      policyId,
      declarationId: "mapgen-public-ops-apply-gate",
      ownerId: "mapgen-domain-workflow",
      kind: "apply-gate",
      gateId: "mapgen-public-ops",
      triggerClass: "import-pattern",
      gateContract: "@mapgen/domain public ops validation",
      recovery: documentedRecovery("mapgen-domain-workflow", "docs/system/libs/mapgen/"),
    },
    unsupportedHostShape(
      "unsupported-project-kind-mod",
      "swooper-maps-workflow",
      "project-kind:mod"
    ),
    unsupportedHostShape(
      "unsupported-project-kind-engine",
      "mapgen-domain-workflow",
      "project-kind:engine"
    ),
    unsupportedHostShape(
      "unsupported-project-kind-control",
      "mapgen-domain-workflow",
      "project-kind:control"
    ),
    unsupportedHostShape(
      "unsupported-project-kind-adapter",
      "mapgen-domain-workflow",
      "project-kind:adapter"
    ),
    unsupportedHostShape(
      "unsupported-project-kind-sdk",
      "mapgen-domain-workflow",
      "project-kind:sdk"
    ),
    unsupportedHostShape(
      "unsupported-project-kind-tooling",
      "mapgen-domain-workflow",
      "project-kind:tooling"
    ),
  ],
});

function generatedSurface(
  generatedZoneId: string,
  ownerId: string,
  matcher: HostMatcher,
  recovery: HostRecoveryInstruction
) {
  return Value.Parse(HostGeneratedSurfaceDeclarationSchema, {
    policyId,
    declarationId: generatedZoneId,
    ownerId,
    kind: "generated-surface",
    generatedZoneId,
    matcher,
    mutationLane: "blocked",
    recovery,
  });
}

function externalResourceSurface(
  generatedZoneId: string,
  ownerId: string,
  matcher: HostMatcher,
  recovery: HostRecoveryInstruction
) {
  return Value.Parse(HostExternalResourceSurfaceDeclarationSchema, {
    policyId,
    declarationId: generatedZoneId,
    ownerId,
    kind: "external-resource-surface",
    generatedZoneId,
    matcher,
    mutationLane: "blocked",
    recovery,
  });
}

function unsupportedHostShape(declarationId: string, ownerId: string, requestClass: string) {
  return Value.Parse(UnsupportedHostShapeDeclarationSchema, {
    policyId,
    declarationId,
    ownerId,
    kind: "unsupported-host-shape",
    requestClass,
    recovery: {
      ownerId,
      actionKind: "unsupported",
      retryCondition: "Retry only after the owning domain defines a uniform generator shape.",
    },
  });
}

function commandRecovery(ownerId: string, command: string): HostRecoveryInstruction {
  return {
    ownerId,
    actionKind: "command",
    command,
    retryCondition: "Retry after the command succeeds and generated output is committed.",
  };
}

function documentedRecovery(ownerId: string, documentRef: string): HostRecoveryInstruction {
  return {
    ownerId,
    actionKind: "documented-workflow",
    documentRef,
    retryCondition: "Retry after the documented workflow has been completed.",
  };
}
