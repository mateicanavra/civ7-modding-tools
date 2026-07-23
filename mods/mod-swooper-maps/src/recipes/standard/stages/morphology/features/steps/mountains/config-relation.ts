type MountainFamilySelection = Readonly<{
  strategy?: unknown;
  config?: unknown;
}>;

function stableConfigString(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableConfigString).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableConfigString(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function stableRootConfigString(value: unknown): string {
  return stableConfigString(value === undefined ? {} : value);
}

/**
 * Enforces structurally equivalent configuration across two members of the
 * mountain family. Each operation keeps its semantic strategy identity while
 * the shared terrain posture remains aligned. Object keys are compared in
 * stable order so authoring order cannot create false drift.
 */
export function assertSameMountainFamilyConfig(
  ridges: MountainFamilySelection,
  foothills: MountainFamilySelection
): void {
  const ridgeConfig = stableRootConfigString(ridges.config);
  const foothillConfig = stableRootConfigString(foothills.config);
  if (ridgeConfig !== foothillConfig) {
    throw new Error(
      "[Morphology] Mountain-family config requires identical ridge/foothill config; tune the shared terrain-classification posture once, not as divergent op-local worlds."
    );
  }
}
