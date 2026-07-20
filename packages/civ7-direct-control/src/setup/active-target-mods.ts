export const CIV7_AUTHORITATIVE_ACTIVE_TARGET_MOD_SOURCE = "Configuration.getGame";

export type Civ7ActiveTargetModSetLike = Readonly<{
  available: boolean;
  identityAvailable: boolean;
  mods: ReadonlyArray<
    Readonly<{
      id?: string;
      packageId?: string;
      enabled?: boolean;
      source?: string;
    }>
  >;
  truncated?: boolean;
  readbacks?: ReadonlyArray<
    Readonly<{
      source?: string;
      available?: boolean;
      identityReadable?: boolean;
      count?: number;
      identityCount?: number;
      truncated?: boolean;
    }>
  >;
}>;

export function isAuthoritativeActiveTargetModSetReadback(
  readback: Civ7ActiveTargetModSetLike | undefined
): readback is Civ7ActiveTargetModSetLike {
  if (
    !readback ||
    readback.available !== true ||
    readback.identityAvailable !== true
  ) {
    return false;
  }
  const configurationReadback = readback.readbacks?.find(
    (entry) => entry.source === CIV7_AUTHORITATIVE_ACTIVE_TARGET_MOD_SOURCE
  );
  if (!configurationReadback) return false;
  if (
    configurationReadback.available !== true ||
    configurationReadback.identityReadable !== true ||
    configurationReadback.truncated === true
  ) {
    return false;
  }
  if (
    typeof configurationReadback.count === "number" &&
    typeof configurationReadback.identityCount === "number" &&
    configurationReadback.identityCount !== configurationReadback.count
  ) {
    return false;
  }
  return true;
}

export function activeTargetModSetContainsAuthoritativeTarget(
  readback: Civ7ActiveTargetModSetLike | undefined,
  targetModId: string
): boolean {
  if (!isAuthoritativeActiveTargetModSetReadback(readback)) return false;
  const normalizedTarget = normalizeModToken(targetModId);
  return readback.mods.some((mod) => {
    if (mod.enabled === false) return false;
    if (mod.source !== CIV7_AUTHORITATIVE_ACTIVE_TARGET_MOD_SOURCE) return false;
    return [mod.id, mod.packageId].some(
      (value) => value !== undefined && normalizeModToken(value) === normalizedTarget
    );
  });
}

function normalizeModToken(value: string): string {
  return value.trim().replace(/^\{|\}$/g, "").toLowerCase();
}
