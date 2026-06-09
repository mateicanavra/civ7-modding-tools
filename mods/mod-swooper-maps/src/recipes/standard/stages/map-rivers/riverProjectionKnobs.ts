import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Civ-visible navigable river projection density.
 *
 * This is deliberately separate from Hydrology's `riverDensity`: Hydrology owns
 * the physical river network, while map-rivers owns the subset materialized as
 * Civ navigable-river terrain after elevation has been rebuilt.
 */
export const NavigableRiverDensityKnobSchema = Type.Union(
  [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
  {
    description:
      "Civ-visible navigable river trunk density (sparse/normal/dense). Applies after Hydrology has authored the physical river network.",
  }
);

export type NavigableRiverDensityKnob = Static<typeof NavigableRiverDensityKnobSchema>;

export type NavigableRiverDensityKnobs = Readonly<{
  navigableRiverDensity?: NavigableRiverDensityKnob;
  riverDensity?: NavigableRiverDensityKnob;
}>;

export function resolveNavigableRiverDensityKnob(
  knobs: NavigableRiverDensityKnobs
): NavigableRiverDensityKnob {
  const { navigableRiverDensity, riverDensity } = knobs;
  if (
    navigableRiverDensity !== undefined &&
    riverDensity !== undefined &&
    navigableRiverDensity !== riverDensity
  ) {
    throw new Error(
      "map-rivers.knobs.riverDensity is a legacy alias for navigableRiverDensity; set only navigableRiverDensity or give both keys the same value."
    );
  }
  return navigableRiverDensity ?? riverDensity ?? "normal";
}
