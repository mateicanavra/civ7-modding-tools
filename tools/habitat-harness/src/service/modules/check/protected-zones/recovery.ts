import {
  type HostRecoveryInstruction,
  renderHostRecoveryInstruction,
} from "@internal/habitat-harness/service/modules/check/protection-policy/index";
import type { ProtectedZoneRecoveryInstruction } from "./schema.js";

export function renderRecoveryInstruction(recovery: ProtectedZoneRecoveryInstruction): string {
  if (isHostRecovery(recovery)) return renderHostRecoveryInstruction(recovery);
  return recovery.instruction;
}

function isHostRecovery(
  recovery: ProtectedZoneRecoveryInstruction
): recovery is HostRecoveryInstruction {
  return recovery.actionKind !== "remove-artifact";
}
