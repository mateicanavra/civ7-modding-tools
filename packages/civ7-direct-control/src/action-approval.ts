import { Civ7DirectControlError } from "./direct-control-error.js";

export type Civ7ActionApproval = Readonly<{
  approved: true;
  reason: string;
  disposableSession?: boolean;
}>;

export function assertApproved(approval: Civ7ActionApproval, action: string): void {
  if (!approval || approval.approved !== true || !approval.reason.trim()) {
    throw new Civ7DirectControlError("command-failed", `Explicit approval with a reason is required before ${action}`);
  }
}
