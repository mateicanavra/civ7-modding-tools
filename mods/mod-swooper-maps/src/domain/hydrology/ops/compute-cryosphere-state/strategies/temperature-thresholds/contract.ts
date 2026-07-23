import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** One temperature scale coherently classifies snow, sea ice, albedo, freeze, permafrost, and melt potential. */
export default defineStrategy({
  id: "temperature-thresholds",
  config: Type.Object(
    {
      /** Temperature at which snow starts to accumulate on land (C). */
      landSnowStartC: Type.Number({
        default: 0,
        minimum: -60,
        maximum: 30,
        description: "Temperature at which snow starts to accumulate on land (C).",
      }),
      /** Temperature at which land snow cover is saturated (C). */
      landSnowFullC: Type.Number({
        default: -12,
        minimum: -80,
        maximum: 10,
        description: "Temperature at which land snow cover is saturated (C).",
      }),
      /** Temperature at which sea ice starts to form (C). */
      seaIceStartC: Type.Number({
        default: -1,
        minimum: -60,
        maximum: 10,
        description: "Temperature at which sea ice starts to form (C).",
      }),
      /** Temperature at which sea ice cover is saturated (C). */
      seaIceFullC: Type.Number({
        default: -10,
        minimum: -80,
        maximum: 10,
        description: "Temperature at which sea ice cover is saturated (C).",
      }),
      /** Temperature at which freezeIndex begins increasing (C). */
      freezeIndexStartC: Type.Number({
        default: 2,
        minimum: -60,
        maximum: 30,
        description: "Temperature at which freezeIndex begins increasing (C).",
      }),
      /** Temperature at which freezeIndex is saturated (C). */
      freezeIndexFullC: Type.Number({
        default: -12,
        minimum: -80,
        maximum: 10,
        description: "Temperature at which freezeIndex is saturated (C).",
      }),
      /** How much rainfall boosts snow cover accumulation (dimensionless). */
      precipitationInfluence: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description: "How much rainfall boosts snow cover accumulation (dimensionless).",
      }),
      /** Permafrost start threshold on freezeIndex (0..1). */
      permafrostStartFreezeIndex: Type.Number({
        default: 0.4,
        minimum: 0,
        maximum: 1,
        description: "Permafrost start threshold on freezeIndex (0..1).",
      }),
      /** Permafrost full threshold on freezeIndex (0..1). */
      permafrostFullFreezeIndex: Type.Number({
        default: 0.8,
        minimum: 0,
        maximum: 1,
        description: "Permafrost full threshold on freezeIndex (0..1).",
      }),
      /** Temperature at which meltPotential begins increasing (C). */
      meltStartC: Type.Number({
        default: 0,
        minimum: -60,
        maximum: 30,
        description: "Temperature at which meltPotential begins increasing (C).",
      }),
      /** Temperature at which meltPotential is saturated (C). */
      meltFullC: Type.Number({
        default: 10,
        minimum: -60,
        maximum: 60,
        description: "Temperature at which meltPotential is saturated (C).",
      }),
      /** How strongly snow cover weights ground ice persistence (0..1). */
      groundIceSnowInfluence: Type.Number({
        default: 0.75,
        minimum: 0,
        maximum: 1,
        description: "How strongly snow cover weights ground ice persistence (0..1).",
      }),
      /** Baseline albedo proxy when no snow/ice is present. */
      baseAlbedo: Type.Integer({
        default: 30,
        minimum: 0,
        maximum: 255,
        description: "Baseline albedo proxy when no snow/ice is present.",
      }),
      /** Albedo boost at full snow cover. */
      snowAlbedoBoost: Type.Integer({
        default: 140,
        minimum: 0,
        maximum: 255,
        description: "Albedo boost at full snow cover.",
      }),
      /** Albedo boost at full sea ice cover. */
      seaIceAlbedoBoost: Type.Integer({
        default: 180,
        minimum: 0,
        maximum: 255,
        description: "Albedo boost at full sea ice cover.",
      }),
    },
    {
      additionalProperties: false,
      description: "Cryosphere state parameters (temperature-thresholds strategy).",
    }
  ),
});
