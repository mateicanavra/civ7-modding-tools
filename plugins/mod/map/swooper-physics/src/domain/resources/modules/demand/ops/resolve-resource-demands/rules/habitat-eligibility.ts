import type { HabitatMaskFieldName } from "../../../../habitat/model/atoms/habitat-fields.schema.js";
import type { ResourceHabitatSignal } from "../../../model/policy/habitat-eligibility.js";

type HabitatMaskFields = Partial<Record<HabitatMaskFieldName, ArrayLike<number>>>;

type HabitatEligibility = Readonly<{
  mask: Uint8Array;
  eligibleTileCount: number;
  signalFields: readonly string[];
}>;

/**
 * Resolves one admitted resource signal into its owned habitat mask.
 * Primary fields form the eligible union; suppression fields remove otherwise eligible tiles.
 */
export function buildHabitatEligibility(
  fields: HabitatMaskFields,
  size: number,
  signal: ResourceHabitatSignal
): HabitatEligibility {
  const primaryMasks: ArrayLike<number>[] = [];
  const signalFields: string[] = [];
  for (const field of signal.primary) {
    const mask = fields[field];
    if (!mask) continue;
    primaryMasks.push(mask);
    signalFields.push(field);
  }
  const suppressMasks: ArrayLike<number>[] = [];
  for (const field of signal.suppress) {
    const mask = fields[field];
    if (mask) suppressMasks.push(mask);
  }

  const mask = new Uint8Array(size);
  if (primaryMasks.length === 0) {
    return { mask, eligibleTileCount: 0, signalFields };
  }
  let eligibleTileCount = 0;
  outer: for (let index = 0; index < size; index += 1) {
    if (!primaryMasks.some((primary) => primary[index] !== 0)) continue;
    for (const suppress of suppressMasks) {
      if (suppress[index] !== 0) continue outer;
    }
    mask[index] = 1;
    eligibleTileCount += 1;
  }
  return { mask, eligibleTileCount, signalFields };
}
