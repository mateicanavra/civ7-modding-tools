export function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
