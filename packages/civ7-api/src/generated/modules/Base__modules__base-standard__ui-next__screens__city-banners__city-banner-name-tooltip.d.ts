import { type ParentComponent } from "solid-js";
import { type CityBannerIdentity } from "/base-standard/ui-next/screens/city-banners/city-banner-data.js";
export interface CityBannerNameTooltipProps {
    data: Pick<CityBannerIdentity, "leaderName" | "civName" | "cityStateBonusName">;
}
/**
 * The `city-banner__tooltip` name tooltip, showing the leader/suzerain name, civilization name, and
 * (for city-states/villages) the city-state bonus name. Ported from the raw HTML string built by the
 * legacy `city-banners.ts` `queueNameUpdate()`; each line is resolved and composed here instead of by
 * `city-banner-data.ts`, so the data layer only ever exposes raw (unstylized) localization keys.
 */
export declare const CityBannerNameTooltip: ParentComponent<CityBannerNameTooltipProps>;
