import type { HabitatDomainError } from "./domain-errors.js";
import type { HabitatProviderError } from "./provider-errors.js";

export type HabitatError = HabitatDomainError | HabitatProviderError;
