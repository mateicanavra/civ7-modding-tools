import path from "node:path";
import { Value } from "typebox/value";
import type { RuleFileLayerFacts } from "../../rules/registry/index.js";
import {
  hostSurfaceProjectionForGeneratedZone,
  hostSurfaceProjectionForPath,
  type HostSurfaceProjection,
} from "../host-policy.js";
import {
  DeclarationReadinessSchema,
  ForbiddenArtifactDeclarationSchema,
  GeneratedSurfaceDeclarationSchema,
  ProtectedSurfaceDeclarationSchema,
  type DeclarationReadiness,
  type ForbiddenArtifactDeclaration,
  type GeneratedSurfaceDeclaration,
  type ProtectedSurfaceDeclaration,
  type ProtectedZoneOwner,
  type ProtectedZoneRecoveryInstruction,
} from "./schema.js";

type GeneratedZoneRule = Extract<RuleFileLayerFacts, { generatedZone: string }>;
type ForbiddenFileNameRule = Extract<
  RuleFileLayerFacts,
  { forbiddenFileNames: readonly string[] }
>;
type DeclarationFileLayerRule = GeneratedZoneRule | ForbiddenFileNameRule;

export function declarationForFileLayerRule(
  rule: DeclarationFileLayerRule
): DeclarationReadiness {
  if ("generatedZone" in rule) return generatedSurfaceDeclaration(rule);
  return forbiddenArtifactDeclaration(rule);
}

export function declarationForHostSurfacePath(candidate: string): DeclarationReadiness | null {
  const projection = hostSurfaceProjectionForPath(candidate);
  if (projection.declarationState === "conflicting") {
    return blockedDeclaration(candidate, "blocked-declaration-conflict");
  }
  if (projection.declarationState !== "declared") {
    return projection.declarationState === "not-applicable"
      ? null
      : blockedDeclaration(candidate, "blocked-missing-host-declaration");
  }
  if (projection.surfaceKind !== "protected") return null;
  if (!declaredProtectedProjection(projection)) {
    return blockedDeclaration(candidate, "blocked-missing-host-declaration");
  }
  return Value.Parse(DeclarationReadinessSchema, {
    kind: "ready",
    declaration: Value.Parse(ProtectedSurfaceDeclarationSchema, {
      kind: "protected-surface",
      declarationId: projection.declarationId,
      surfaceKind: "protected",
      matcher: projection.matcher,
      owner: ownerProjection(projection.owner),
      recovery: projection.recovery,
      nonClaims: projection.nonClaims,
    }),
  });
}

export function matchesDeclarationPath(
  declaration:
    | GeneratedSurfaceDeclaration
    | ProtectedSurfaceDeclaration
    | ForbiddenArtifactDeclaration,
  candidate: string
): boolean {
  if (declaration.kind === "forbidden-artifact") {
    return declaration.fileNames.includes(path.posix.basename(candidate));
  }
  return declaration.matcher.kind === "exact"
    ? candidate === declaration.matcher.value
    : matchesPathPrefix(declaration.matcher.value, candidate);
}

function matchesPathPrefix(prefix: string, candidate: string): boolean {
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return candidate === prefix || candidate.startsWith(normalizedPrefix);
}

function declaredProtectedProjection(
  projection: HostSurfaceProjection
): projection is HostSurfaceProjection & {
  declarationId: string;
  owner: NonNullable<HostSurfaceProjection["owner"]>;
  matcher: NonNullable<HostSurfaceProjection["matcher"]>;
  recovery: NonNullable<HostSurfaceProjection["recovery"]>;
} {
  return (
    projection.declarationState === "declared" &&
    projection.surfaceKind === "protected" &&
    Boolean(projection.declarationId && projection.owner && projection.matcher && projection.recovery)
  );
}

function generatedSurfaceDeclaration(rule: GeneratedZoneRule): DeclarationReadiness {
  const projection = hostSurfaceProjectionForGeneratedZone(rule.generatedZone);
  if (projection.declarationState === "conflicting") {
    return blockedDeclaration(rule.generatedZone, "blocked-declaration-conflict");
  }
  if (!declaredGeneratedProjection(projection)) {
    return blockedDeclaration(rule.generatedZone, "blocked-missing-host-declaration");
  }
  return Value.Parse(DeclarationReadinessSchema, {
    kind: "ready",
    declaration: Value.Parse(GeneratedSurfaceDeclarationSchema, {
      kind: "generated-surface",
      zoneId: rule.generatedZone,
      declarationId: projection.declarationId,
      surfaceKind: projection.surfaceKind,
      matcher: projection.matcher,
      owner: ownerProjection(projection.owner),
      recovery: projection.recovery,
      nonClaims: projection.nonClaims,
    }),
  });
}

function forbiddenArtifactDeclaration(rule: ForbiddenFileNameRule): DeclarationReadiness {
  return Value.Parse(DeclarationReadinessSchema, {
    kind: "ready",
    declaration: Value.Parse(ForbiddenArtifactDeclarationSchema, {
      kind: "forbidden-artifact",
      declarationId: rule.id,
      owner: {
        ownerId: "habitat-repo-policy",
        displayName: "Habitat repo policy",
        recoveryContact: "docs/process/CONTRIBUTING.md",
      },
      fileNames: [...rule.forbiddenFileNames],
      recovery: {
        ownerId: "habitat-repo-policy",
        actionKind: "remove-artifact",
        instruction: `Remove ${rule.forbiddenFileNames.join(", ")} and use the repository's declared package manager.`,
        nonClaims: ["does-not-prove-dependency-freshness"],
      },
      nonClaims: ["does-not-prove-dependency-freshness"],
    }),
  });
}

function declaredGeneratedProjection(
  projection: HostSurfaceProjection
): projection is HostSurfaceProjection & {
  declarationId: string;
  owner: NonNullable<HostSurfaceProjection["owner"]>;
  matcher: NonNullable<HostSurfaceProjection["matcher"]>;
  recovery: NonNullable<HostSurfaceProjection["recovery"]>;
} {
  return (
    projection.declarationState === "declared" &&
    (projection.surfaceKind === "generated" ||
      projection.surfaceKind === "external-resource") &&
    Boolean(projection.declarationId && projection.owner && projection.matcher && projection.recovery)
  );
}

function blockedDeclaration(
  zoneId: string,
  kind: "blocked-missing-host-declaration" | "blocked-declaration-conflict"
): DeclarationReadiness {
  return Value.Parse(DeclarationReadinessSchema, {
    kind,
    zoneId,
    ownerId: kind === "blocked-missing-host-declaration" ? "G-HOST" : "D10",
    recovery: declarationRepairRecovery(kind),
    nonClaims: [`does-not-authorize-generated-zone:${zoneId}`],
  });
}

function declarationRepairRecovery(
  kind: "blocked-missing-host-declaration" | "blocked-declaration-conflict"
): ProtectedZoneRecoveryInstruction {
  return {
    ownerId: kind === "blocked-missing-host-declaration" ? "G-HOST" : "D10",
    actionKind: "documented-workflow",
    documentRef: "openspec/changes/deep-habitat-host-policy-boundary-gate",
    retryCondition:
      kind === "blocked-missing-host-declaration"
        ? "Retry after the host policy declaration exists and validates."
        : "Retry after the conflicting protected-zone declarations are repaired.",
    nonClaims: ["does-not-authorize-generated-zone"],
  };
}

function ownerProjection(owner: NonNullable<HostSurfaceProjection["owner"]>): ProtectedZoneOwner {
  return {
    ownerId: owner.ownerId,
    displayName: owner.displayName,
    recoveryContact: owner.recoveryContact,
  };
}
