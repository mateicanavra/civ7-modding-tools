import type { Civ7ControlOrpcDirectControlFacade } from "../../src/dependencies/direct-control";

/** Builds a type-checked test facade that rejects every unconfigured operation. */
export function directControlFacadeFixture(
  overrides: Partial<Civ7ControlOrpcDirectControlFacade> = {}
): Civ7ControlOrpcDirectControlFacade {
  return new Proxy(overrides, {
    get(target, property, receiver) {
      if (Reflect.has(target, property)) return Reflect.get(target, property, receiver);
      return async () => {
        throw new Error(`Unexpected direct-control fixture call: ${String(property)}`);
      };
    },
  }) as Civ7ControlOrpcDirectControlFacade;
}
