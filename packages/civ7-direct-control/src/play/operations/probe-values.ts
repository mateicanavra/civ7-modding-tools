import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import { stableJson } from "./stable-json.js";

export function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

export function probeValueChanged(
  left: Civ7RuntimeProbe<unknown> | undefined,
  right: Civ7RuntimeProbe<unknown> | undefined,
): boolean {
  if (!left || !right) return false;
  if (left.ok !== right.ok) return true;
  if (!left.ok || !right.ok) return stableJson(left) !== stableJson(right);
  return stableJson(left.value) !== stableJson(right.value);
}
