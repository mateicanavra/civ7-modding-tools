export function currentTimeMillis(): number {
  return Date.now();
}

export function epochMillisToIsoString(epochMillis: number): string {
  return new Date(epochMillis).toISOString();
}
