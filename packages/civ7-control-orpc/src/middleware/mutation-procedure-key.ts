import type { Civ7ControlOrpcProcedureMeta } from "../metadata";

export function civ7MutationProcedureKey(
  meta: Civ7ControlOrpcProcedureMeta,
  path: readonly string[],
): string {
  if (typeof meta.procedureKey === "string" && meta.procedureKey.trim()) {
    return meta.procedureKey;
  }
  if (path.length > 0) return path.join(".");
  return "unknown-procedure";
}
