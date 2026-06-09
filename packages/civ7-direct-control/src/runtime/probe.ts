import { Type, type TSchema } from "typebox";

export type Civ7RuntimeProbe<T> = Readonly<
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    }
>;

export function Civ7RuntimeProbeSchema<T extends TSchema>(value: T) {
  return Type.Union([
    Type.Object({
      ok: Type.Literal(true),
      value,
    }, { additionalProperties: false }),
    Type.Object({
      ok: Type.Literal(false),
      error: Type.String(),
    }, { additionalProperties: false }),
  ]);
}

export function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
