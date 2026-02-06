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

export function snapEraToAvailable(variants: readonly LayerVariant[], requestedEra: number): number | null {
  if (!Number.isFinite(requestedEra) || requestedEra <= 0) return null;
  const eraVariants = listEraVariants(variants);
  if (!eraVariants.length) return null;

  let bestEra = eraVariants[0]!.era;
  let bestDistance = Math.abs(bestEra - requestedEra);
  for (let i = 1; i < eraVariants.length; i += 1) {
    const candidateEra = eraVariants[i]!.era;
    const distance = Math.abs(candidateEra - requestedEra);
    if (distance < bestDistance || (distance === bestDistance && candidateEra < bestEra)) {
      bestEra = candidateEra;
      bestDistance = distance;
    }
  }
  return bestEra;
}

export function findVariantIdForEra(variants: readonly LayerVariant[], era: number): string | null {
  const snappedEra = snapEraToAvailable(variants, era);
  if (snappedEra == null) return null;
  for (const variant of variants) {
    const parsed = parseEraVariantKey(variant.layer.variantKey ?? null);
    if (parsed === snappedEra) return variant.variantId;
  }
  return null;
}

export function findVariantKeyForEra(variants: readonly LayerVariant[], era: number): string | null {
  const snappedEra = snapEraToAvailable(variants, era);
  if (snappedEra == null) return null;
  for (const variant of variants) {
    const variantKey = variant.layer.variantKey ?? null;
    const parsed = parseEraVariantKey(variantKey);
    if (parsed === snappedEra) return variantKey;
  }
  return null;
}

export function resolveFixedEraUiValue(args: {
  variants: readonly LayerVariant[];
  selectedVariantKey: string | null | undefined;
  requestedEra: number;
}): number {
  const selectedEra = parseEraVariantKey(args.selectedVariantKey);
  if (selectedEra != null) return selectedEra;
  return snapEraToAvailable(args.variants, args.requestedEra) ?? args.requestedEra;
}
