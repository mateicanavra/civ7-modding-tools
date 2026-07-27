import type { MapSetup } from "@mapgen/core/map-setup.js";

/** @internal Stable fingerprint identity reserved for Core's physical-only setup authority. */
export const BASE_PHYSICAL_INITIAL_SETUP_ID = "mapgen/physical";

type InitialSetupBinding = Readonly<{
  definition: object;
  definitionId: string;
  value: unknown;
}>;

const initialSetupBindings = new WeakMap<object, InitialSetupBinding>();

/** @internal Returns the private initial-setup binding retained by a physical setup, if any. */
export function findInitialSetupBindingInternal(setup: MapSetup): InitialSetupBinding | undefined {
  return initialSetupBindings.get(setup);
}

/** @internal Binds one admitted full initial value to its sole physical setup identity. */
export function bindInitialSetupInternal(
  setup: MapSetup,
  binding: InitialSetupBinding
): InitialSetupBinding {
  const existing = initialSetupBindings.get(setup);
  if (existing !== undefined) {
    if (existing.definition === binding.definition && existing.value === binding.value) {
      return existing;
    }
    throw new Error(
      `Physical MapSetup is already bound to initial setup authority "${existing.definitionId}".`
    );
  }

  const frozen = Object.freeze(binding);
  initialSetupBindings.set(setup, frozen);
  return frozen;
}

/**
 * @internal Projects only deterministic initial-setup evidence into plan fingerprinting.
 *
 * Unbound setups originate at the lower-level execution-plan API and retain the legacy physical
 * setup as their complete initial state.
 */
export function initialSetupFingerprintInputInternal(setup: MapSetup): Readonly<{
  definitionId: string;
  value: unknown;
}> {
  const binding = initialSetupBindings.get(setup);
  return binding === undefined
    ? Object.freeze({
        definitionId: BASE_PHYSICAL_INITIAL_SETUP_ID,
        value: setup,
      })
    : Object.freeze({
        definitionId: binding.definitionId,
        value: binding.value,
      });
}
