import { Value } from "typebox/value";
import {
  type DeclarationReadiness,
  DeclarationReadinessSchema,
  type ProtectedMutationDecision,
  ProtectedMutationDecisionSchema,
  type StagedMutationPath,
} from "../dto/protected-zone.schema.js";
import { matchesDeclarationPath } from "./protected-zone-declarations.policy.js";

export function evaluateProtectedMutationGuard(
  declarationState: DeclarationReadiness,
  mutations: readonly StagedMutationPath[]
): ProtectedMutationDecision[] {
  const state = Value.Parse(DeclarationReadinessSchema, declarationState);
  return mutations.map((mutation) => decisionForMutation(state, mutation));
}

function decisionForMutation(
  state: DeclarationReadiness,
  mutation: StagedMutationPath
): ProtectedMutationDecision {
  if (state.kind !== "ready") {
    return Value.Parse(ProtectedMutationDecisionSchema, {
      kind: state.kind,
      path: mutation.path,
      action: mutation.action,
      zoneId: state.zoneId,
      ownerId: state.ownerId,
      recovery: state.recovery,
    });
  }

  const declaration = state.declaration;
  if (!matchesDeclarationPath(declaration, mutation.path)) {
    return Value.Parse(ProtectedMutationDecisionSchema, {
      kind: "not-applicable",
      path: mutation.path,
      action: mutation.action,
    });
  }

  if (declaration.kind === "forbidden-artifact") {
    return Value.Parse(ProtectedMutationDecisionSchema, {
      kind: "refused-forbidden-artifact",
      path: mutation.path,
      action: mutation.action,
      owner: declaration.owner,
      recovery: declaration.recovery,
    });
  }

  if (declaration.kind === "protected-surface") {
    return Value.Parse(ProtectedMutationDecisionSchema, {
      kind: "refused-direct-protected-edit",
      path: mutation.path,
      action: mutation.action,
      surfaceKind: "protected",
      owner: declaration.owner,
      recovery: declaration.recovery,
    });
  }

  return Value.Parse(ProtectedMutationDecisionSchema, {
    kind: "refused-direct-generated-edit",
    path: mutation.path,
    action: mutation.action,
    zoneId: declaration.zoneId,
    surfaceKind: declaration.surfaceKind,
    owner: declaration.owner,
    recovery: declaration.recovery,
  });
}
