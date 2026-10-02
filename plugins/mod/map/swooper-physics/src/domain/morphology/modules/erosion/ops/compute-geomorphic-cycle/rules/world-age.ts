type WorldAge = "young" | "mature" | "old";

const WORLD_AGE_SCALE = { young: 0.7, mature: 1.0, old: 1.3 } as const;

export function resolveWorldAgeScale(worldAge: WorldAge): number {
  return WORLD_AGE_SCALE[worldAge];
}
