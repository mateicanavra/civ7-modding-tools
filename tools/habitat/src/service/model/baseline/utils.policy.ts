import type { BaselineOccurrence } from "./dto/baseline.schema.js";

/** Compares two already-ordered string sequences without changing either input. */
export function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Returns one lexicographically sorted instance of each input string. */
export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

/** Collapses diagnostic keys into sorted unique entries with exact multiplicity. */
export function countOccurrences(values: readonly string[]): BaselineOccurrence[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, count]) => ({ key, count }));
}

/** Compares two canonical occurrence sequences without expanding either count. */
export function sameOccurrenceList(
  a: readonly BaselineOccurrence[],
  b: readonly BaselineOccurrence[]
): boolean {
  return (
    a.length === b.length &&
    a.every((entry, index) => entry.key === b[index]?.key && entry.count === b[index]?.count)
  );
}

/** Returns the total admitted diagnostic count represented by occurrence entries. */
export function occurrenceCount(occurrences: readonly BaselineOccurrence[]): number {
  return occurrences.reduce((total, occurrence) => total + occurrence.count, 0);
}
