/**
 * Keeps command stream bodies out of receipts while preserving enough metadata
 * for humans and agents to recognize what happened.
 *
 * @param value - Full command stream body.
 * @param limit - Maximum preview length to retain.
 * @returns The bounded preview and whether truncation occurred.
 */
export function boundedPreview(value: string, limit = 4096): { text: string; truncated: boolean } {
  if (value.length <= limit) return { text: value, truncated: false };
  return { text: value.slice(0, limit), truncated: true };
}

/**
 * Captures only verify-relevant environment keys.
 *
 * The receipt intentionally avoids dumping arbitrary environment variables while
 * retaining the cache/color/CI toggles that commonly affect command behavior.
 *
 * @returns Allowlisted environment key/value pairs.
 */
export function selectedVerifyEnv(env: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    ["CI", "FORCE_COLOR", "NX_DAEMON", "NX_CACHE_PROJECT_GRAPH", "NX_PROJECT_GRAPH_CACHE"]
      .map((key): [string, string] | undefined => {
        const value = env[key];
        return value === undefined ? undefined : [key, value];
      })
      .filter((entry): entry is [string, string] => entry !== undefined)
  );
}
