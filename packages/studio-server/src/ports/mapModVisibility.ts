/**
 * Run-in-Game "map row not visible in Civ7 setup" classifier.
 *
 * Forensic basis (proven live 2026-06-29): a Run-in-Game request can materialize,
 * build, deploy (verified sha) AND register (inject the `<Maps>` row) the map
 * script — `studio.operations.current` shows every artifact present — and STILL
 * fail because Civ7's setup map list does not contain the map row. There are two
 * distinct real causes, and they need different messages (and, for the operator,
 * different actions):
 *
 *   1. THE MAP MOD ITSELF IS NOT LOADED — most commonly a Civ update auto-disabled
 *      it. Signature: Civ7 setup shows maps (base-game maps are present) but NONE
 *      of the target mod's maps are visible. For a disposable run the daemon has
 *      already exit-to-shell restarted Civ and the mod's maps still did not appear,
 *      so the mod is disabled / failed to load — a further restart will not help.
 *      => `map-mod-not-loaded`. Action: re-enable the mod in Civ, then retry.
 *
 *   2. THE MOD IS LOADED but this one freshly-deployed (disposable) map row has not
 *      been enumerated yet. Signature: sibling maps from the SAME mod ARE visible;
 *      only the target is missing.
 *      => `setup-map-row-not-visible`. Action: restart Civ / retry to re-scan.
 *
 * This is pure and deterministic so the identification path is unit-tested directly
 * against both forensic scenarios — no live engine required.
 */

export type MapRowVisibilityFailureCode = "map-mod-not-loaded" | "setup-map-row-not-visible";

export type MapRowVisibilityClassification = Readonly<{
  code: MapRowVisibilityFailureCode;
  message: string;
  recoveryHint: string;
  /** The mod namespace token parsed from the map script, e.g. `{swooper-maps}`. */
  modNamespace: string | null;
  /** How many OTHER maps from the same mod are currently visible in Civ7 setup. */
  siblingMapRowCount: number;
  /** Total map rows Civ7 setup is currently showing (base game + any mods). */
  visibleMapRowCount: number;
}>;

/** Civ7 map-script references are mod-namespaced as `{mod-id}/path/to/map.js`. */
const MOD_NAMESPACE_PATTERN = /^(\{[^}]+\})\//;

/** Parse the `{mod-id}` namespace token from a Civ7 map-script reference. */
export function modNamespaceFromMapScript(mapScript: string): string | null {
  const match = MOD_NAMESPACE_PATTERN.exec(mapScript.trim());
  return match ? match[1] : null;
}

function isSameModRow(file: string, modNamespace: string): boolean {
  return file === modNamespace || file.startsWith(`${modNamespace}/`);
}

/**
 * Classify a "target map row absent from Civ7 setup" failure into a specific,
 * actionable cause using the sibling-visibility discriminator described above.
 *
 * `visibleMapRows` is the FULL Civ7 setup map list (call `getCiv7SetupMapRows({})`
 * with no `file` filter). We only assert `map-mod-not-loaded` when Civ is
 * demonstrably showing OTHER maps yet none from the target mod — that guards
 * against a transient/empty setup read being mislabelled as a disabled mod.
 */
export function classifyMapRowVisibilityFailure(args: {
  readonly launchMapScript: string;
  readonly visibleMapRows: ReadonlyArray<{ readonly file: string }>;
  readonly materializationMode?: string;
}): MapRowVisibilityClassification {
  const launchMapScript = args.launchMapScript;
  const modNamespace = modNamespaceFromMapScript(launchMapScript);
  const visibleMapRowCount = args.visibleMapRows.length;
  const siblingMapRowCount = modNamespace
    ? args.visibleMapRows.filter(
        (row) => row.file !== launchMapScript && isSameModRow(row.file, modNamespace)
      ).length
    : 0;

  // Disabled/not-loaded mod: Civ IS showing maps, but none belong to this mod.
  if (modNamespace && siblingMapRowCount === 0 && visibleMapRowCount > 0) {
    return {
      code: "map-mod-not-loaded",
      message: `Civilization is not loading the ${modNamespace} map mod, so its setup map list cannot show ${launchMapScript}.`,
      recoveryHint:
        `Civilization isn't loading the ${modNamespace} map mod (Swooper Physics Maps) — a game update may have ` +
        "auto-disabled it. In Civilization, open Add-Ons / Mods, enable the mod, then retry Run in Game. " +
        "The map was generated and deployed correctly; Civ simply isn't loading the mod that provides it.",
      modNamespace,
      siblingMapRowCount,
      visibleMapRowCount,
    };
  }

  // Mod is loaded (or we cannot tell): the specific freshly-deployed row just is
  // not enumerated yet. Keep the established code; nudge toward a re-scan.
  return {
    code: "setup-map-row-not-visible",
    message: `Civ7 setup cannot see ${launchMapScript}.`,
    recoveryHint:
      modNamespace && siblingMapRowCount > 0
        ? `Other ${modNamespace} maps are loaded, but ${launchMapScript} has not appeared in Civ7 setup yet. ` +
          "Restart Civilization (or retry Run in Game) so it re-scans the newly deployed map."
        : `${launchMapScript} has not appeared in Civ7 setup yet. Restart Civilization (or retry Run in Game) to re-scan it.`,
    modNamespace,
    siblingMapRowCount,
    visibleMapRowCount,
  };
}
