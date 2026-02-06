import type { LayerVariant } from "./dataTypeModel";

export type EraVariantSummary = Readonly<{
  era: number;
  variantId: string;
  layerKey: string;
  label: string;
}>;

const ERA_VARIANT_PATTERN = /^era:(\d+)$/;

export function parseEraVariantKey(variantKey: string | null | undefined): number | null {
  if (!variantKey) return null;
  const match = ERA_VARIANT_PATTERN.exec(variantKey.trim());
  if (!match) return null;
  const era = Number(match[1]);
  if (!Number.isFinite(era) || era <= 0) return null;
  return era;
}

export function listEraVariants(variants: readonly LayerVariant[]): EraVariantSummary[] {
  const out: EraVariantSummary[] = [];
  for (const variant of variants) {
    const era = parseEraVariantKey(variant.layer.variantKey ?? null);
    if (era == null) continue;
    out.push({
      era,
      variantId: variant.variantId,
      layerKey: variant.layerKey,
      label: variant.label,
    });
  }
  return out.sort((a, b) => a.era - b.era);
}

export function findVariantIdForEra(variants: readonly LayerVariant[], era: number): string | null {
  for (const variant of variants) {
    const parsed = parseEraVariantKey(variant.layer.variantKey ?? null);
    if (parsed === era) return variant.variantId;
  }
  return null;
}
