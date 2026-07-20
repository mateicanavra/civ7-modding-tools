/** Browser generation uses the current authoring revision, never a config digest. */
export type BrowserRunSnapshot = Readonly<{
  authoringRevision: number;
}>;

export function buildBrowserRunSnapshot(authoringRevision: number): BrowserRunSnapshot {
  return { authoringRevision };
}
