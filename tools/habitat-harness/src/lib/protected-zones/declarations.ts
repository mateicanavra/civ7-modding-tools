import path from "node:path";
import { Value } from "typebox/value";
import type { RuleFileLayerFacts } from "../../rules/registry/index.js";
import {
  hostSurfaceDecisionForGeneratedZone,
  hostSurfaceDecisionForPath,
  type HostSurfaceDecision,
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
  const decision = hostSurfaceDecisionForPath(candidate);
  if (decision.declarationState === "conflicting") {
    return blockedDeclaration(candidate, "blocked-declaration-conflict");
  }
  if (decision.declarationState !== "declared") {
    return decision.declarationState === "not-applicable"
      ? null
      : blockedDeclaration(candidate, "blocked-missing-host-declaration");
  }
  if (decision.surfaceKind !== "protected") return null;
  if (!declaredProtectedDecision(decision)) {
    return blockedDeclaration(candidate, "blocked-missing-host-declaration");
  }
  return Value.Parse(DeclarationReadinessSchema, {
    kind: "ready",
    declaration: Value.Parse(ProtectedSurfaceDeclarationSchema, {
      kind: "protected-surface",
      declarationId: decision.declarationId,
      surfaceKind: "protected",
      matcher: decision.matcher,
      owner: protectedZoneOwner(decision.owner),
      recovery: decision.recovery,
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

function declaredProtectedDecision(
  decision: HostSurfaceDecision
): decision is HostSurfaceDecision & {
  declarationId: string;
  owner: NonNullable<HostSurfaceDecision["owner"]>;
  matcher: NonNullable<HostSurfaceDecision["matcher"]>;
  recovery: NonNullable<HostSurfaceDecision["recovery"]>;
} {
  return (
    decision.declarationState === "declared" &&
    decision.surfaceKind === "protected" &&
    Boolean(decision.declarationId && decision.owner && decision.matcher && decision.recovery)
  );
}

function generatedSurfaceDeclaration(rule: GeneratedZoneRule): DeclarationReadiness {
  const decision = hostSurfaceDecisionForGeneratedZone(rule.generatedZone);
  if (decision.declarationState === "conflicting") {
    return blockedDeclaration(rule.generatedZone, "blocked-declaration-conflict");
  }
  if (!declaredGeneratedDecision(decision)) {
    return blockedDeclaration(rule.generatedZone, "blocked-missing-host-declaration");
  }
  return Value.Parse(DeclarationReadinessSchema, {
    kind: "ready",
    declaration: Value.Parse(GeneratedSurfaceDeclarationSchema, {
      kind: "generated-surface",
      zoneId: rule.generatedZone,
      declarationId: decision.declarationId,
      surfaceKind: decision.surfaceKind,
      matcher: decision.matcher,
      owner: protectedZoneOwner(decision.owner),
      recovery: decision.recovery,
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
      },
    }),
  });
}

function declaredGeneratedDecision(
  decision: HostSurfaceDecision
): decision is HostSurfaceDecision & {
  declarationId: string;
  owner: NonNullable<HostSurfaceDecision["owner"]>;
  matcher: NonNullable<HostSurfaceDecision["matcher"]>;
  recovery: NonNullable<HostSurfaceDecision["recovery"]>;
} {
  return (
    decision.declarationState === "declared" &&
    (decision.surfaceKind === "generated" || decision.surfaceKind === "external-resource") &&
    Boolean(decision.declarationId && decision.owner && decision.matcher && decision.recovery)
  );
}

function blockedDeclaration(
  zoneId: string,
  kind: "blocked-missing-host-declaration" | "blocked-declaration-conflict"
): DeclarationReadiness {
  return Value.Parse(DeclarationReadinessSchema, {
    kind,
    zoneId,
    ownerId:
      kind === "blocked-missing-host-declaration"
        ? "host-policy"
        : "protected-zone-policy",
    recovery: declarationRepairRecovery(kind),
  });
}

function declarationRepairRecovery(
  kind: "blocked-missing-host-declaration" | "blocked-declaration-conflict"
): ProtectedZoneRecoveryInstruction {
  return {
    ownerId:
      kind === "blocked-missing-host-declaration"
        ? "host-policy"
        : "protected-zone-policy",
    actionKind: "documented-workflow",
    documentRef: "openspec/changes/deep-habitat-host-policy-boundary-gate",
    retryCondition:
      kind === "blocked-missing-host-declaration"
        ? "Retry after the host policy declaration exists and validates."
        : "Retry after the conflicting protected-zone declarations are repaired.",
  };
}

function protectedZoneOwner(
  owner: NonNullable<HostSurfaceDecision["owner"]>
): ProtectedZoneOwner {
  return {
    ownerId: owner.ownerId,
    displayName: owner.displayName,
    recoveryContact: owner.recoveryContact,
  };
}
