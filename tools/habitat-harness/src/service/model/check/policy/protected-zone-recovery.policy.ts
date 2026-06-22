import type { HostRecoveryInstruction } from "../dto/host-policy.schema.js";
import {
  renderHostRecoveryInstruction,
} from "./host-policy-decisions.policy.js";
import type { ProtectedZoneRecoveryInstruction } from "../dto/protected-zone.schema.js";

export function renderRecoveryInstruction(recovery: ProtectedZoneRecoveryInstruction): string {
  if (isHostRecovery(recovery)) return renderHostRecoveryInstruction(recovery);
  return recovery.instruction;
}

function isHostRecovery(
  recovery: ProtectedZoneRecoveryInstruction
): recovery is HostRecoveryInstruction {
  return recovery.actionKind !== "remove-artifact";
}
