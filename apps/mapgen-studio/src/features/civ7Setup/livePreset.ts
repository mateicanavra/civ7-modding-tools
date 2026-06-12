// Identifiers for the synthetic "Live Game" preset that mirrors the last proved
// Run-in-Game source. Extracted verbatim from `App.tsx` during the
// app-decomposition slice — the id/key strings are unchanged.
export const LIVE_GAME_PRESET_ID = "live-game";
export const LIVE_GAME_PRESET_KEY = `live:${LIVE_GAME_PRESET_ID}` as const;
