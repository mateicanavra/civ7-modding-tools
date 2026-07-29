export function parsePlotFlag(
  raw: string,
  fail: (message: string) => never
): { x: number; y: number } {
  const match = /^\s*(\d+)\s*,\s*(\d+)\s*$/.exec(raw);
  if (!match) {
    fail(`--plot must be x,y with non-negative integers (got "${raw}")`);
  }
  return { x: Number(match![1]), y: Number(match![2]) };
}

export function parseZoomFlag(raw: string, fail: (message: string) => never): number {
  const zoom = Number(raw);
  if (!Number.isFinite(zoom) || zoom < 0 || zoom > 1) {
    fail(`--zoom must be a number between 0 (closest) and 1 (fully zoomed out) (got "${raw}")`);
  }
  return zoom;
}
