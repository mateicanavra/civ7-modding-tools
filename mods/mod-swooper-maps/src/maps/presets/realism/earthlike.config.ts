import { canonicalRecipeConfig } from "../../configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../configs/swooper-earthlike.config.json";

/**
 * Preset: realism/earthlike
 *
 * Legacy recipe-config alias for tooling that still asks for the old realism
 * preset module. Swooper Earthlike is now the authored product record; this
 * export deliberately reads that canonical map envelope so tuning remains in
 * one JSON-backed Studio/save/deploy path.
 */
export const realismEarthlikeConfig = canonicalRecipeConfig(swooperEarthlikeConfigRaw);
