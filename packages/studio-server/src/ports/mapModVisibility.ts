/**
 * Classifies absent setup map rows without guessing from public setup rows alone.
 *
 * The generated mod can be called disabled only when a complete active target
 * mod-set readback exposes comparable mod ids and excludes the deployed mod.
 * Labels and sibling map rows remain diagnostics; they are not identity.
 */

import {
  activeTargetModSetContainsAuthoritativeTarget,
  isAuthoritativeActiveTargetModSetReadback,
} from "@civ7/direct-control";
import type { SetupFailureReason } from "../runInGameSetupFailureTaxonomy.js";

export type MapRowVisibilityFailureCode = Extract<
  SetupFailureReason,
  "generated-map-mod-not-enabled" | "setup-map-row-not-visible"
>;

export type ActiveTargetModSetReadback = Readonly<{
  available: boolean;
  identityAvailable: boolean;
  mods: ReadonlyArray<
    Readonly<{
      id?: string;
      packageId?: string;
      name?: string;
      title?: string;
      handle?: string | number;
      enabled?: boolean;
      source?: string;
    }>
  >;
  truncated: boolean;
  readbacks?: ReadonlyArray<Readonly<{ truncated?: boolean }>>;
}>;

export type TargetModReconciliationReadback = Readonly<{
  targetModId?: string;
  verified?: boolean;
  result?: Readonly<{
    targetActive?: boolean;
    enabledModsMetaContainsTarget?: boolean;
  }>;
}>;

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
  activeTargetModSet?: ActiveTargetModSetReadback;
  targetModReconciliation?: TargetModReconciliationReadback;
  targetModId?: string;
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
 * actionable cause using active target mod-set readback as the disabled-mod
 * discriminator. Sibling rows are retained only as bounded setup context.
 *
 * `visibleMapRows` is the FULL Civ7 setup map list (call `getCiv7SetupMapRows({})`
 * with no `file` filter). `activeTargetModSet` is the separate mod-set readback;
 * without it this classifier never guesses that the generated mod is disabled.
 * `targetModReconciliation` is the narrower happy-path setup action result; a
 * negative target-active readback from that action is enough to classify the
 * generated run mod as inactive without running broad inventory diagnostics.
 */
export function classifyMapRowVisibilityFailure(args: {
  readonly launchMapScript: string;
  readonly visibleMapRows: ReadonlyArray<{ readonly file: string }>;
  readonly targetModId?: string;
  readonly activeTargetModSet?: ActiveTargetModSetReadback;
  readonly targetModReconciliation?: TargetModReconciliationReadback;
}): MapRowVisibilityClassification {
  const launchMapScript = args.launchMapScript;
  const modNamespace = modNamespaceFromMapScript(launchMapScript);
  const targetModId = args.targetModId ?? modIdFromNamespace(modNamespace);
  const visibleMapRowCount = args.visibleMapRows.length;
  const siblingMapRowCount = modNamespace
    ? args.visibleMapRows.filter(
        (row) => row.file !== launchMapScript && isSameModRow(row.file, modNamespace)
      ).length
    : 0;

  if (targetModId && reconciliationExcludesTarget(args.targetModReconciliation, targetModId)) {
    return {
      code: "generated-map-mod-not-enabled",
      message: `Civilization is not loading the generated Studio Run mod, so its setup map list cannot show ${launchMapScript}.`,
      recoveryHint:
        "Civilization is missing the active generated Studio Run mod. Enable the generated Studio Run mod in Civilization, then retry Run in Game.",
      modNamespace,
      siblingMapRowCount,
      visibleMapRowCount,
      targetModReconciliation: args.targetModReconciliation,
      targetModId,
    };
  }

  if (
    targetModId &&
    isAuthoritativeActiveModSetReadback(args.activeTargetModSet) &&
    !activeTargetModSetContainsAuthoritativeTarget(args.activeTargetModSet, targetModId)
  ) {
    return {
      code: "generated-map-mod-not-enabled",
      message: `Civilization is not loading the generated Studio Run mod, so its setup map list cannot show ${launchMapScript}.`,
      recoveryHint:
        "Civilization is missing the active generated Studio Run mod. Enable the generated Studio Run mod in Civilization, then retry Run in Game.",
      modNamespace,
      siblingMapRowCount,
      visibleMapRowCount,
      activeTargetModSet: args.activeTargetModSet,
      targetModId,
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
    ...(args.activeTargetModSet === undefined
      ? {}
      : { activeTargetModSet: args.activeTargetModSet }),
    ...(args.targetModReconciliation === undefined
      ? {}
      : { targetModReconciliation: args.targetModReconciliation }),
    ...(targetModId === undefined ? {} : { targetModId }),
  };
}

function isAuthoritativeActiveModSetReadback(
  readback: ActiveTargetModSetReadback | undefined
): readback is ActiveTargetModSetReadback {
  return isAuthoritativeActiveTargetModSetReadback(readback);
}

function modIdFromNamespace(namespace: string | null): string | undefined {
  return namespace?.replace(/^\{|\}$/g, "");
}

function reconciliationExcludesTarget(
  reconciliation: TargetModReconciliationReadback | undefined,
  targetModId: string
): boolean {
  if (!reconciliation) return false;
  if (
    typeof reconciliation.targetModId === "string" &&
    normalizeModToken(reconciliation.targetModId) !== normalizeModToken(targetModId)
  ) {
    return false;
  }
  if (reconciliation.verified === false) return true;
  const targetActive = reconciliation.result?.targetActive;
  const metadataContainsTarget = reconciliation.result?.enabledModsMetaContainsTarget;
  return targetActive === false || metadataContainsTarget === false;
}

function normalizeModToken(value: string): string {
  return value
    .trim()
    .replace(/^\{|\}$/g, "")
    .toLowerCase();
}
