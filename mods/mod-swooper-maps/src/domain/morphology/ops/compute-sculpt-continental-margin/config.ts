import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Continental-margin sculpting controls.
 *
 * The profile endpoints are DERIVED from the existing hypsometric scale — the relief datums
 * (oceanicHeight / continentalHeight / elevationScale) are SINGLE-SOURCED from
 * compute-base-topography and reach this op as INPUTS, NOT duplicated here as config — combined
 * with physical RATIOS (the fields below). There are NO foreign magic depths. The sculpt runs
 * before the datum is solved, so it cannot reference sea level; all endpoints are absolute engine
 * int16 elevation derived from crust-type + the input relief datums. All length scales are in
 * tiles and are PHYSICAL properties of the margin (multiplicative postures), never output targets.
 */
export const SculptContinentalMarginConfigSchema = Type.Object(
  {
    /**
     * PHYSICAL ratio: crust-relief fraction at the shelf BREAK (the drowned outer continental
     * edge sits near mid-relief). breakElevation = (oceanicHeight + reliefSpan*breakCrustFraction)
     * *elevationScale (datums from input) — derived from the scale, not a tuned depth, not an
     * output target.
     */
    breakCrustFraction: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description:
        "PHYSICAL ratio: crust-relief fraction at the shelf break (drowned outer continental edge ~ mid-relief). breakElevation = (oceanicHeight + reliefSpan*breakCrustFraction)*elevationScale. Derived, not tuned.",
    }),
    /**
     * PHYSICAL ratio: crust-relief fraction of the apron TOP (the submerged outer continental
     * shelf, above the break but below land). shoreAnchorCeiling = (oceanicHeight +
     * reliefSpan*apronTopCrustFraction)*elevationScale; must exceed breakCrustFraction. The apron
     * staying underwater is held by raise-only + the local submerged-continental anchor + the
     * targetWaterPercent solver intent (empirically verified 0 crossings), NOT by this ceiling as a
     * hard guarantee — the anchor ceiling can equal/exceed the solved sea level.
     */
    apronTopCrustFraction: Type.Number({
      default: 0.62,
      minimum: 0,
      maximum: 1,
      description:
        "PHYSICAL ratio: crust-relief fraction of the apron TOP (submerged outer continental shelf). Shore anchor ceiling = (oceanicHeight + reliefSpan*apronTopCrustFraction)*elevationScale; must exceed breakCrustFraction. Apron stays underwater by raise-only + local anchor + targetWaterPercent intent (empirically verified), not a hard ceiling guarantee.",
    }),
    /**
     * Write-toward blend strength at the break edge (fades to 0 shoreward). Pulls noisy
     * submerged-continental elevation into a coherent apron ramp without overwriting the deep
     * continental interior. A geometry/coherence control, NOT an output target.
     */
    apronBlendStrength: Type.Number({
      default: 0.8,
      minimum: 0,
      maximum: 1,
      description:
        "Write-toward blend strength at the break edge (fades to 0 shoreward). Pulls noisy submerged-continental elevation into a coherent ramp without overwriting deep interior. Geometry control, not an output target.",
    }),
    /**
     * Base apron LENGTH SCALE in tiles for a neutral margin (the gentle continental shelf from
     * the landmass edge out to the break, before margin-physics postures are applied). A
     * physical length, NOT a membership cap: the profile is still evaluated for every oceanic
     * tile; this only sets how far the gentle apron reaches before the break.
     */
    baseApronLengthTiles: Type.Number({
      default: 3,
      minimum: 0,
      maximum: 64,
      description:
        "Base apron length scale (tiles) for a neutral margin: the gentle shelf reach from the landmass edge to the break before margin postures.",
    }),
    /**
     * Active-margin apron multiplier (<1 => narrower). Convergent/transform margins with high
     * boundary closeness subduct/shear steeply and accumulate little shelf — narrow, steep.
     */
    activeApronFactor: Type.Number({
      default: 0.4,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on active (convergent/transform, high-closeness) margins (<1 => narrower, steeper). Margin physics.",
    }),
    /**
     * Rift (divergent) apron multiplier (<1 => narrower). Young rifts have thin, separated
     * margins with little accumulated apron.
     */
    riftApronFactor: Type.Number({
      default: 0.6,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on divergent (rift) margins (<1 => narrower). Young rifts carry little apron.",
    }),
    /**
     * Passive-margin apron multiplier (>1 => wider). Trailing-edge passive margins accumulate
     * thick sediment wedges — wide, gentle aprons.
     */
    passiveApronFactor: Type.Number({
      default: 1.5,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on passive (non-active, non-rift) margins (>1 => wider, gentler). Margin physics.",
    }),
    /**
     * Maximum additional apron widening from crust age on passive margins (multiplicative gain
     * at age=255). Older passive margins have had longer to build out their sediment apron.
     */
    ageApronGain: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 4,
      description:
        "Max multiplicative apron widening from crust age on passive margins (applied at age=255). Older passive margins are wider.",
    }),
    /**
     * Maximum additional apron widening from crust buoyancy (multiplicative gain at buoyancy=1).
     * More buoyant crust rides higher and sheds a broader sediment apron.
     */
    buoyancyApronGain: Type.Number({
      default: 0.4,
      minimum: 0,
      maximum: 4,
      description:
        "Max multiplicative apron widening from crust buoyancy (applied at buoyancy=1). More buoyant crust => broader apron.",
    }),
    /**
     * Boundary-closeness (0..1) above which a convergent/transform margin counts as ACTIVE.
     * Below this, even a convergent crust-type margin behaves passively (far from the boundary).
     */
    activeClosenessThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary closeness (0..1) above which a convergent/transform margin is treated as active.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Continental-margin sculpting controls: a datum-free profile (submerged-continental apron -> break -> oceanic slope -> abyss) whose endpoints are DERIVED from the hypsometric scale (oceanicHeight/continentalHeight/elevationScale single-sourced from base-topography as inputs + physical ratios). The apron is WRITTEN-TOWARD over continental crust and the slope is CARVED-DOWN over oceanic crust; apron length scale modulated by margin physics. No output-target tuning, no membership caps, no magic depths.",
  }
);

export type SculptContinentalMarginConfig = Static<typeof SculptContinentalMarginConfigSchema>;
