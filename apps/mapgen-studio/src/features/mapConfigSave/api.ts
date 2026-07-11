import {
  type MapConfigEnvelope,
  type MapConfigSaveDeployStatus,
  type SaveDeploySafeFailureCategory,
  serializeMapConfigEnvelope,
  type StudioRecoveryAction,
} from "@civ7/studio-contract";
import { safe } from "@orpc/client";
import { orpcClient } from "../../lib/orpc";
import { createMapConfigSaveDeployStatus } from "./status";

export function toConfigId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || `map-config-${Date.now()}`;
}

export async function saveRepoBackedConfig(args: {
  requestId: string;
  canonicalConfig: MapConfigEnvelope;
  restart?: boolean;
  verifyRestart?: boolean;
  onStatus?: (status: MapConfigSaveDeployStatus) => void;
}): Promise<
  | { ok: true; status: MapConfigSaveDeployStatus }
  | { ok: false; status: Extract<MapConfigSaveDeployStatus, { ok: false }> }
> {
  try {
    const saveResult = await safe(
      orpcClient.mapConfigs.saveDeploy({
        requestId: args.requestId,
        canonicalConfig: serializeMapConfigEnvelope(args.canonicalConfig),
        ...(args.restart === undefined ? {} : { restart: args.restart }),
        ...(args.verifyRestart === undefined ? {} : { verifyRestart: args.verifyRestart }),
      })
    );
    if (saveResult.error) {
      return {
        ok: false,
        status: failedStatusFromError(args.requestId, saveResult.error),
      };
    }
    const status = saveResult.data;
    args.onStatus?.(status);
    return { ok: true, status };
  } catch {
    return {
      ok: false,
      status: createMapConfigSaveDeployStatus({
        requestId: args.requestId,
        phase: "failed",
        safeFailureCategory: "internal-defect",
        recoveryActions: ["copy-diagnostics", "retry-save-deploy"],
      }),
    };
  }
}

function failedStatusFromError(
  requestId: string,
  error: unknown
): Extract<MapConfigSaveDeployStatus, { ok: false }> {
  const code = isRecord(error) && typeof error.code === "string" ? error.code : undefined;
  const data = isRecord(error) && isRecord(error.data) ? error.data : undefined;
  const safeFailureCategory = isSaveDeployFailureCategory(data?.safeFailureCategory)
    ? data.safeFailureCategory
    : categoryFromDefinedErrorCode(code);
  const recoveryActions = Array.isArray(data?.recoveryActions)
    ? data.recoveryActions.filter(isStudioRecoveryAction)
    : (["copy-diagnostics", "retry-save-deploy"] satisfies StudioRecoveryAction[]);
  return createMapConfigSaveDeployStatus({
    requestId,
    phase: "failed",
    safeFailureCategory,
    recoveryActions,
  });
}

function categoryFromDefinedErrorCode(code: string | undefined): SaveDeploySafeFailureCategory {
  switch (code) {
    case "SAVE_DEPLOY_BLOCKED":
      return "ownership";
    case "SAVE_DEPLOY_INVALID":
    case "SAVE_DEPLOY_STATUS_NOT_FOUND":
      return "request-validation";
    case "SAVE_DEPLOY_UNAVAILABLE":
      return "dependency-unavailable";
    default:
      return "internal-defect";
  }
}

function isSaveDeployFailureCategory(value: unknown): value is SaveDeploySafeFailureCategory {
  return (
    value === "request-validation" ||
    value === "ownership" ||
    value === "dependency-unavailable" ||
    value === "save" ||
    value === "deployment" ||
    value === "cleanup" ||
    value === "internal-defect"
  );
}

function isStudioRecoveryAction(value: unknown): value is StudioRecoveryAction {
  return (
    value === "check-dev-server" ||
    value === "copy-diagnostics" ||
    value === "dismiss-civ-notification-and-retry" ||
    value === "edit-config" ||
    value === "inspect-deploy-output" ||
    value === "restart-civ-process-and-retry" ||
    value === "retry-run" ||
    value === "retry-save-deploy" ||
    value === "retry-status"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
