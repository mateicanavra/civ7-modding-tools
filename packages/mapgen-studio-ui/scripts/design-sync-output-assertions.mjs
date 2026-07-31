/**
 * Checks the generated design-sync README token section for repo-owned invariants.
 *
 * @param {string} readme Generated README contents.
 * @returns {string[]} Assertion failures; empty when the token section is valid.
 */
export function findDesignSyncReadmeFailures(readme) {
  const heading = /^## Tokens[ \t]*\r?$/m.exec(readme);
  if (!heading) {
    return [
      "README is missing the required exact `## Tokens` section — token-table purity was not checked",
    ];
  }

  const afterHeading = readme.slice(heading.index + heading[0].length);
  const nextSectionOffset = afterHeading.search(/^##[ \t]+\S.*$/m);
  const tokensBody =
    nextSectionOffset === -1 ? afterHeading : afterHeading.slice(0, nextSectionOffset);

  // Emitted shape: one bullet per kind — `- **color** (14): \`--x\`, …`.
  const leakedTw = [...tokensBody.matchAll(/^- \*\*(?!other\b)[\w-]+\*\*.*?(--tw-[\w-]+)/gm)].map(
    ([, name]) => name
  );
  if (leakedTw.length === 0) return [];

  return [
    `README token buckets list Tailwind engine vars outside 'other' (${[...new Set(leakedTw)].join(", ")}) — the .ds-sync emit.mjs --tw- classifier patch was lost (re-stage?)`,
  ];
}
