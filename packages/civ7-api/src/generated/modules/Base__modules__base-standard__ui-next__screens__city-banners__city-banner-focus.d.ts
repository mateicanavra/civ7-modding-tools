/**
 * @file city-banner-focus.ts
 * @copyright 2021-2026, Firaxis Games
 * @description Provides an isolated focus context for city banner components.
 *
 * City banner tooltip triggers are world-space elements that are not intended to be
 * focusable via controller navigation. Without an explicit FocusContext.Provider,
 * Tooltip.Trigger elements register with the root focus context, which causes the
 * controller to apply DOM focus to banner trigger elements — firing their focus event,
 * raising the city banner tooltip, and pushing FocusManager off the world (blocking
 * plot tooltip and world input).
 *
 * This module creates an isolated FocusContextProvider at module level. Because
 * FocusContextProvider is constructed outside Solid's reactive scope, useContext returns
 * undefined, so no parent registration occurs. The context is therefore unreachable from
 * the controller navigation tree.
 *
 * Usage: wrap the city banner component's return in
 *   <FocusContext.Provider value={cityBannerFocusContext}>
 */
import { FocusContext } from "/core/ui-next/services/focus.js";
export { FocusContext };
export declare const CityBannerFocusContext: any;
