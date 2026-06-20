import type { HabitatDomainError } from "./domain-errors.ts";
import type { HabitatProviderError } from "./provider-errors.ts";

export type HabitatError = HabitatDomainError | HabitatProviderError;
