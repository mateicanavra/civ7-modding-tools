import type { Civ7ComponentId } from "../../civ7-component-id.js";

export function sameComponentId(
  left: Civ7ComponentId | null | undefined,
  right: Civ7ComponentId | null | undefined,
): boolean {
  if (left == null || right == null) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}
